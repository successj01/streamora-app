import React, { useRef, useState } from "react";
import {
  Send,
  Smile,
  Users,
  MessageCircle,
} from "lucide-react";

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StreamChat = ({
  messages = [],
  currentUser = null,
  onSendMessage,
  viewerCount = 0,
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    if (onSendMessage) {
      onSendMessage(trimmedMessage);
    }

    setMessage("");

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  };

  return (
    <aside className="flex h-[600px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141416]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">

        <div className="flex items-center gap-2">
          <MessageCircle
            size={18}
            className="text-red-500"
          />

          <h2 className="text-sm font-semibold text-white">
            Live Chat
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={14} />
          {viewerCount.toLocaleString()}
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
              <MessageCircle
                size={21}
                className="text-gray-600"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-400">
              No messages yet
            </p>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-gray-600">
              Be the first person to say something in the chat.
            </p>

          </div>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className="group"
            >
              <div className="flex items-start gap-2.5">

                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#222225]">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                      {item.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-gray-300">
                      {item.username || "User"}
                    </span>

                    {item.badge && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-500">
                        {item.badge}
                      </span>
                    )}

                    {item.time && (
                      <span className="text-[10px] text-gray-700">
                        {formatTime(item.time)}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 break-words text-sm leading-5 text-gray-400">
                    {item.message}
                  </p>
                </div>

              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-white/10 p-3">

        {!currentUser ? (
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <p className="text-xs text-gray-500">
              Sign in to join the conversation.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2"
          >
            <button
              type="button"
              aria-label="Add emoji"
              className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-500 transition hover:text-white"
            >
              <Smile size={18} />
            </button>

            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              maxLength={300}
              placeholder="Send a message..."
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-gray-600"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        )}

      </div>

    </aside>
  );
};

export default StreamChat;