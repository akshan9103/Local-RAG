import { Message } from "../../types/chat";

type Props = {
  message: Message;
};

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow
          ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}
        `}
      >
        {message.content}
      </div>
    </div>
  );
}