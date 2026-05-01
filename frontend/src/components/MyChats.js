import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useToast, Avatar, Spinner } from "@chakra-ui/react";
import {
  Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay,
  useDisclosure, Menu, MenuButton, MenuItem, MenuList, MenuDivider,
} from "@chakra-ui/react";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import ProfileModal from "./miscellaneous/ProfileModal";
import UserListItem from "./userAvatar/UserListItem";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer search state
  const [drawerSearch, setDrawerSearch] = useState("");
  const [drawerResults, setDrawerResults] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const { selectedChat, setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  const toast = useToast();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchChats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch {
      toast({ title: "Failed to load chats", status: "error", duration: 4000, isClosable: true, position: "bottom-left" });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const filteredChats = chats
    ? chats.filter((chat) => {
        const name = !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  // Drawer search
  const handleDrawerSearch = async (query) => {
    const q = query !== undefined ? query : drawerSearch;
    if (!q.trim()) { setDrawerResults([]); return; }
    try {
      setDrawerLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${q}`, config);
      setDrawerResults(data);
      setDrawerLoading(false);
    } catch {
      toast({ title: "Search failed", status: "error", duration: 3000, isClosable: true, position: "bottom-left" });
      setDrawerLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setChatLoading(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setChatLoading(false);
      onClose();
    } catch (error) {
      toast({ title: "Error opening chat", description: error.message, status: "error", duration: 4000, isClosable: true, position: "bottom-left" });
      setChatLoading(false);
    }
  };

  return (
    <>
      {/* ── Brand Row ── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <div className="sidebar-brand-icon">💬</div>
          <span className="sidebar-brand-name">Talk-A-Tive</span>
        </div>
        <GroupChatModal>
          <button className="sidebar-new-group-btn">+ Group</button>
        </GroupChatModal>
      </div>

      {/* ── User Profile ── */}
      <div className="sidebar-user">
        <Avatar size="sm" name={user?.name} src={user?.pic} />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>

        {/* Profile & Logout Menu */}
        <Menu>
          <MenuButton>
            <button className="sidebar-bottom-btn" style={{ width: "32px", height: "32px", borderRadius: "8px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </MenuButton>
          <MenuList bg="#1a1a2e" border="1px solid rgba(255,255,255,0.08)" borderRadius="14px" boxShadow="0 10px 40px rgba(0,0,0,0.4)" minW="180px" py={2} px={2}>
            <ProfileModal user={user}>
              <MenuItem bg="transparent" borderRadius="10px" fontSize="13px" color="#e2e8f0" _hover={{ bg: "rgba(255,255,255,0.06)" }} fontFamily="'Inter', sans-serif" mb={1}>
                👤 My Profile
              </MenuItem>
            </ProfileModal>
            <MenuDivider borderColor="rgba(255,255,255,0.06)" />
            <MenuItem bg="transparent" borderRadius="10px" fontSize="13px" color="#ef4444" _hover={{ bg: "rgba(239,68,68,0.1)" }} fontFamily="'Inter', sans-serif" onClick={logoutHandler}>
              🚪 Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </div>

      {/* ── Search ── */}
      <div className="sidebar-search">
        <div className="sidebar-search-box">
          <svg className="sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="sidebar-search-input"
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Find People Button ── */}
      <div style={{ padding: "0 16px 12px" }}>
        <button
          onClick={onOpen}
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "10px",
            border: "1.5px dashed rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.background = "rgba(124,58,237,0.05)"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Find new people to chat
        </button>
      </div>

      {/* ── Section Label ── */}
      <div className="sidebar-section-label">
        <span className="sidebar-section-title">Conversations</span>
        {chats && <span className="sidebar-section-count">{chats.length}</span>}
      </div>

      {/* ── Notification badge ── */}
      {notification.length > 0 && (
        <div style={{ padding: "0 16px 8px" }}>
          <div style={{
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.15)",
            fontSize: "12px",
            color: "#a78bfa",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onClick={() => {
            if (notification[0]) {
              setSelectedChat(notification[0].chat);
              setNotification(notification.slice(1));
            }
          }}
          >
            <span style={{ background: "#7c3aed", color: "white", width: "20px", height: "20px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
              {notification.length}
            </span>
            new message{notification.length > 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ── Chat List ── */}
      <div className="sidebar-chat-list">
        {!chats ? (
          /* Skeleton loader */
          <div className="chat-skeleton">
            {[1,2,3,4,5,6].map((i) => (
              <div className="chat-skeleton-item" key={i}>
                <div className="chat-skeleton-avatar" />
                <div className="chat-skeleton-lines">
                  <div className="chat-skeleton-line" />
                  <div className="chat-skeleton-line" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">{searchQuery ? "🔍" : "💬"}</div>
            <div className="sidebar-empty-text">
              {searchQuery
                ? `No chats matching "${searchQuery}"`
                : "No conversations yet.\nClick 'Find new people' above to start!"}
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = selectedChat?._id === chat._id;
            const senderName = !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName;
            const senderPic = !chat.isGroupChat ? chat.users?.find((u) => u._id !== loggedUser?._id)?.pic : undefined;
            const time = chat.latestMessage?.createdAt ? formatTime(chat.latestMessage.createdAt) : "";

            return (
              <div key={chat._id} className={`chat-list-item ${isActive ? "active" : ""}`} onClick={() => setSelectedChat(chat)}>
                <Avatar size="md" name={senderName} src={senderPic} style={{ flexShrink: 0 }} />
                <div className="chat-list-item-text">
                  <div className="chat-list-item-top">
                    <span className="chat-list-name">{senderName}</span>
                    <span className="chat-list-time">{time}</span>
                  </div>
                  {chat.latestMessage && (
                    <div className="chat-list-preview">
                      {chat.latestMessage.sender._id === loggedUser?._id ? "You: " : `${chat.latestMessage.sender.name.split(" ")[0]}: `}
                      {chat.latestMessage.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Search People Drawer ── */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay backdropFilter="blur(8px)" bg="rgba(0,0,0,0.4)" />
        <DrawerContent bg="#13131f" borderRightRadius="20px" boxShadow="0 20px 60px rgba(0,0,0,0.5)" maxW="340px">
          <DrawerHeader py={5} px={5} borderBottom="1px solid rgba(255,255,255,0.06)" color="#e2e8f0" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="16px">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="sidebar-brand-icon" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.5"/><path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              Find People
            </div>
          </DrawerHeader>
          <DrawerBody px={4} py={4}>
            <div className="sidebar-search-box" style={{ marginBottom: "16px" }}>
              <svg className="sidebar-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                className="sidebar-search-input"
                type="text"
                placeholder="Name or email..."
                value={drawerSearch}
                onChange={(e) => { setDrawerSearch(e.target.value); handleDrawerSearch(e.target.value); }}
                onKeyDown={(e) => e.key === "Enter" && handleDrawerSearch()}
                autoFocus
              />
            </div>

            {drawerLoading ? (
              <div className="chat-skeleton">
                {[1,2,3].map((i) => (
                  <div className="chat-skeleton-item" key={i}>
                    <div className="chat-skeleton-avatar" />
                    <div className="chat-skeleton-lines"><div className="chat-skeleton-line" /><div className="chat-skeleton-line" /></div>
                  </div>
                ))}
              </div>
            ) : drawerResults.length === 0 && drawerSearch.trim() ? (
              <div className="sidebar-empty">
                <div className="sidebar-empty-icon">🔍</div>
                <div className="sidebar-empty-text">No users found for "{drawerSearch}"</div>
              </div>
            ) : drawerResults.length === 0 ? (
              <div className="sidebar-empty">
                <div className="sidebar-empty-icon">👥</div>
                <div className="sidebar-empty-text">Search by name or email<br/>to find people</div>
              </div>
            ) : (
              drawerResults.map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
              ))
            )}
            {chatLoading && <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}><Spinner color="purple.400" size="md" /></div>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MyChats;
