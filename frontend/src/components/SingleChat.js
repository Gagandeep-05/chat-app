import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useToast, Avatar, Spinner } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";

// Use relative URL in production (same server), localhost in development
const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "/"
    : "http://localhost:8000";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch {
      toast({ title: "Failed to load messages", status: "error", duration: 4000, isClosable: true, position: "bottom" });
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;
    socket.emit("stop typing", selectedChat._id);
    try {
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      setNewMessage("");
      // FIX: Send selectedChat._id instead of the entire selectedChat object
      const { data } = await axios.post("/api/message", { content: text, chatId: selectedChat._id }, config);
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast({ title: "Failed to send message", status: "error", duration: 3000, isClosable: true, position: "bottom" });
    }
  };

  // Socket connection setup — runs once on mount
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // Cleanup on unmount: disconnect the socket
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  // Fetch messages when selected chat changes
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;

    // Reset typing state when switching chats
    setTyping(false);
    setIsTyping(false);

    // Focus input when chat changes
    if (selectedChat && inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line
  }, [selectedChat]);

  // FIX: Listen for incoming messages with proper cleanup to prevent listener leak
  useEffect(() => {
    const messageHandler = (newMsg) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMsg.chat._id) {
        if (!notification.includes(newMsg)) {
          setNotification([newMsg, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("message recieved", messageHandler);

    // Cleanup: remove this specific listener before adding a new one
    return () => {
      socket.off("message recieved", messageHandler);
    };
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  /* ── Empty State ── */
  if (!selectedChat) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <div className="empty-state-title">Your messages</div>
        <div className="empty-state-desc">
          Select a conversation from the sidebar, or click <strong style={{ color: "#7c3aed" }}>Find new people</strong> to start chatting.
        </div>
      </div>
    );
  }

  const senderName = selectedChat.isGroupChat ? selectedChat.chatName : getSender(user, selectedChat.users);
  const senderFull = !selectedChat.isGroupChat ? getSenderFull(user, selectedChat.users) : null;

  return (
    <>
      {/* ── Header ── */}
      <div className="chat-main-header">
        <div className="chat-main-header-left">
          <Avatar size="sm" name={senderName} src={senderFull?.pic} />
          <div>
            <div className="chat-main-header-name">
              {selectedChat.isGroupChat ? selectedChat.chatName : senderName}
            </div>
            <div className="chat-main-header-status">
              {selectedChat.isGroupChat ? (
                <span style={{ color: "#64748b" }}>{selectedChat.users.length} members</span>
              ) : (
                <><div className="chat-main-header-dot" /> Online</>
              )}
            </div>
          </div>
        </div>
        <div>
          {selectedChat.isGroupChat ? (
            <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          ) : (
            <ProfileModal user={senderFull} />
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chat-messages-area">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "12px" }}>
            <Spinner color="purple.400" size="lg" thickness="3px" />
            <span style={{ fontSize: "13px", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>Loading messages...</span>
          </div>
        ) : (
          <ScrollableChat messages={messages} />
        )}
      </div>

      {/* ── Typing Indicator ── */}
      {istyping && (
        <div style={{ padding: "8px 20px", background: "#f1f4f9", flexShrink: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "white", border: "1px solid #edf2f7", borderRadius: "20px", padding: "7px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div className="typing-dots">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
            <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "'Inter', sans-serif" }}>typing...</span>
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="chat-input-bar">
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Type a message…"
          value={newMessage}
          onChange={typingHandler}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          autoComplete="off"
        />
        <button className="send-btn" onClick={sendMessage} disabled={!newMessage.trim()} title="Send (Enter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
};

export default SingleChat;
