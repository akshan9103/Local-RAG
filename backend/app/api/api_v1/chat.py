from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.user import User
from app.models.chat import Chat, Message
from app.models.knowledge import KnowledgeBase
from app.schemas.chat import (
    ChatCreate,
    ChatResponse,
    ChatUpdate,
    MessageCreate,
    MessageResponse,
    ListChatResponse,
    UpdateChatTitleRequest
)
from app.core.security import get_current_user, get_current_admin
from app.services.chat_service import generate_response, generate_and_save_chat_title_bg

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def create_chat(
    *,
    db: Session = Depends(get_db),
    chat_in: ChatCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    # Verify knowledge bases exist and belong to user
    knowledge_bases = (
        db.query(KnowledgeBase)
        .filter(
            KnowledgeBase.id.in_(chat_in.knowledge_base_ids),
        )
        .all()
    )
    if len(knowledge_bases) != len(chat_in.knowledge_base_ids):
        raise HTTPException(
            status_code=400,
            detail="One or more knowledge bases not found"
        )
    
    chat = Chat(
        id=chat_in.id, # <-- Ensure your ChatCreate schema allows passing the frontend UUID!
        title=chat_in.title,
        user_id=current_user.id,
    )
    chat.knowledge_bases = knowledge_bases
    
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/", response_model=List[ChatResponse])
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100
) -> Any:
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return chats

@router.get("/list", response_model=List[ListChatResponse])
def get_chats_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    knowledge_base_ids: Optional[List[int]] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(Chat).filter(Chat.user_id == current_user.id)

    if knowledge_base_ids:
        query = query.filter(
            Chat.knowledge_bases.any(
                KnowledgeBase.id.in_(knowledge_base_ids)
            )
        )

    return query.offset(skip).limit(limit).all()

# FIX: Changed chat_id from int to str
@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(
    *,
    db: Session = Depends(get_db),
    chat_id: str, 
    current_user: User = Depends(get_current_user)
) -> Any:
    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

# FIX: Changed chat_id: s to chat_id: str
# FIX: Added Body(...) to messages so it correctly parses the Vercel AI payload
@router.post("/{chat_id}/messages")
async def create_message_existing(
    *,
    db: Session = Depends(get_db),
    chat_id: str, 
    messages: dict = Body(...), 
    current_user: User = Depends(get_current_user)
) -> StreamingResponse:
    chat = (
        db.query(Chat)
        .options(joinedload(Chat.knowledge_bases))
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    last_message = messages["messages"][-1]
    if last_message["role"] != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")
    
    knowledge_base_ids = [kb.id for kb in chat.knowledge_bases]

    async def response_stream():
        async for chunk in generate_response(
            query=last_message["content"],
            messages=messages,
            knowledge_base_ids=knowledge_base_ids,
            chat_id=chat_id,
            db=db
        ):
            yield chunk

    return StreamingResponse(
        response_stream(),
        media_type="text/event-stream",
        headers={
            "x-vercel-ai-data-stream": "v1"
        }
    )

# FIX: Changed chat_id from int to str
@router.delete("/{chat_id}")
def delete_chat(
    *,
    db: Session = Depends(get_db),
    chat_id: str, 
    current_user: User = Depends(get_current_user)
) -> Any:
    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    db.delete(chat)
    db.commit()
    return {"status": "success"}

# FIX: Changed chat_id from int to str
@router.put("/{chat_id}/title", response_model=ListChatResponse)
def update_chat_title(
    chat_id: str, 
    payload: UpdateChatTitleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == current_user.id)
        .first()
    )

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = payload.title

    db.commit()
    db.refresh(chat)

    return chat


# FIX: Added Body(...) to messages
@router.post("/new/{chat_id}/messages")
async def create_new_message(
    *,
    db: Session = Depends(get_db),
    chat_id: str,
    messages: dict = Body(...), 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> StreamingResponse:
    chat = (
        db.query(Chat)
        .options(joinedload(Chat.knowledge_bases))
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    last_message = messages["messages"][-1]
    if last_message["role"] != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")
    
    message_count = db.query(Message).filter(Message.chat_id == chat_id).count()
    
    if message_count == 0:
        background_tasks.add_task(
        generate_and_save_chat_title_bg,
        chat_id=chat_id,
        first_message_content=last_message["content"]
    )

    knowledge_base_ids = [kb.id for kb in chat.knowledge_bases]

    async def response_stream():
        async for chunk in generate_response(
            query=last_message["content"],
            messages=messages,
            knowledge_base_ids=knowledge_base_ids,
            chat_id=chat_id,
            db=db
        ):
            yield chunk

    return StreamingResponse(
        response_stream(),
        media_type="text/event-stream",
        headers={
            "x-vercel-ai-data-stream": "v1"
        }
    )