import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { createSocketConnection } from "../../sockets/socket";

function ChatBox({ clientId, therapistId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Load previous chat history
  useEffect(() => {
    const token = localStorage.getItem("unfazed_client_token");

    if (!token || !clientId || !therapistId) {
      return;
    }

    const loadChatHistory = async () => {
      try {
        const response = await axiosInstance.get("/chat/history", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load chat history"
          );
        }

        setMessages(data.data || []);
      } catch (error) {
        console.error(
          "❌ Failed to load chat history:",
          error
        );
      }
    };

    loadChatHistory();
  }, [clientId, therapistId]);

  // Connect to Socket.io
  useEffect(() => {
    const token = localStorage.getItem("unfazed_client_token");

    if (!token || !clientId || !therapistId) {
      return;
    }

    const chatSocket = createSocketConnection(token);

    setSocket(chatSocket);

    chatSocket.on("connect", () => {
      setConnected(true);

      chatSocket.emit("join_chat", {
        clientId,
        therapistId,
      });
    });

    chatSocket.on("chat_joined", (data) => {
      console.log(
        "💬 Joined chat room:",
        data.roomId
      );
    });

    chatSocket.on("receive_message", (newMessage) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    });

    chatSocket.on("chat_error", (error) => {
      console.error(
        "💬 Chat error:",
        error.message
      );
    });

    chatSocket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      chatSocket.disconnect();
      setSocket(null);
    };
  }, [clientId, therapistId]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !socket || !connected) {
      return;
    }

    socket.emit("send_message", {
      clientId,
      therapistId,
      message: trimmedMessage,
    });

    setMessage("");
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 p-5">
        <div>
          <h2 className="text-xl font-semibold">
            Chat with Therapist
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Send messages directly through the client portal.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs ${
            connected
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-red-500/10 text-red-300"
          }`}
        >
          {connected ? "Online" : "Offline"}
        </span>
      </div>

      <div className="h-80 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">
              No messages yet. Start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((item, index) => (
              <div
                key={`${item._id || item.createdAt}-${index}`}
                className={`flex ${
                  item.senderRole === "client"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    item.senderRole === "client"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {item.message}
                  </p>

                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(
                      item.createdAt
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex gap-3 border-t border-slate-800 p-4"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            connected
              ? "Type your message..."
              : "Connecting..."
          }
          disabled={!connected}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!connected || !message.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}

export default ChatBox;