from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class MessageBase(BaseModel):
    content: str
    role: str

class MessageCreate(MessageBase):
    chat_id: UUID

class MessageResponse(MessageBase):
    id: int  # Assuming message IDs are still auto-incrementing database integers
    chat_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatBase(BaseModel):
    title: str

class ChatCreate(ChatBase):
    id: UUID  # Required here since the frontend generates and sends it
    knowledge_base_ids: List[int]

class ChatUpdate(BaseModel):
    title: Optional[str] = None
    knowledge_base_ids: Optional[List[int]] = None

class ChatResponse(ChatBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    knowledge_base_ids: List[int] = []

    model_config = ConfigDict(from_attributes=True)

class KnowledgeBaseResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class ListChatResponse(ChatBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    knowledge_bases: List[KnowledgeBaseResponse] = []

    model_config = ConfigDict(from_attributes=True)

class UpdateChatTitleRequest(BaseModel):
    title: str