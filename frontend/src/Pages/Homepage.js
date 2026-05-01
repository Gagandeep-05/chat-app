import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const [tab, setTab] = useState("login");
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "42px", marginBottom: "12px", filter: "drop-shadow(0 0 24px rgba(124,58,237,0.4))" }}>
            💬
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "900",
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #c4b5fd, #818cf8, #a78bfa)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "6px",
          }}>
            Talk‑A‑Tive
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
            Real-time messaging, simplified.
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === "signup" ? "active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          <div className="auth-form">
            {tab === "login" ? <Login /> : <Signup />}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "11px",
          color: "rgba(255,255,255,0.15)",
        }}>
          🔒 JWT Authentication · Socket.io Real-time
        </div>
      </div>
    </div>
  );
}

export default Homepage;
