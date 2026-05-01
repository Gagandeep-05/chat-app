import { Avatar } from "@chakra-ui/avatar";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: "4px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(124,58,237,0.12)";
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
      }}
    >
      <Avatar size="sm" name={user.name} src={user.pic} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#e2e8f0",
            fontFamily: "'Inter', sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            fontFamily: "'Inter', sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.email}
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
