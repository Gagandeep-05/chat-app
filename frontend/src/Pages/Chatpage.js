import { useState } from "react";
import MyChats from "../components/MyChats";
import SingleChat from "../components/SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  if (!user) return null;

  return (
    <div className="chat-root">
      {/* Dark Sidebar with brand, search, conversations, profile */}
      <div className="chat-sidebar">
        <MyChats fetchAgain={fetchAgain} />
      </div>

      {/* Light Chat Area */}
      <div className="chat-main">
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </div>
    </div>
  );
};

export default Chatpage;
