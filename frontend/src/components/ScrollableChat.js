import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "2px", position: "relative", zIndex: 1 }}>
        {messages &&
          messages.map((m, i) => {
            const isMine = m.sender._id === user._id;
            const showAvatar = isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id);
            const groupWithPrev = isSameUser(messages, m, i, user._id);

            return (
              <div key={m._id} className={`message-row ${isMine ? "sent" : "received"}`} style={{ marginTop: groupWithPrev ? "2px" : "14px" }}>
                {/* Avatar slot for received messages */}
                {!isMine && (
                  <div className="message-avatar-slot">
                    {showAvatar && (
                      <Tooltip label={m.sender.name} placement="left" hasArrow>
                        <Avatar size="xs" name={m.sender.name} src={m.sender.pic} cursor="pointer" />
                      </Tooltip>
                    )}
                  </div>
                )}

                {/* Bubble */}
                <div className="message-bubble-wrapper">
                  {!isMine && showAvatar && (
                    <div className="message-sender-name">{m.sender.name}</div>
                  )}
                  <div className={`message-bubble ${isMine ? "sent" : "received"}`}>
                    {m.content}
                    <div className="message-time">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </ScrollableFeed>
  );
};

export default ScrollableChat;
