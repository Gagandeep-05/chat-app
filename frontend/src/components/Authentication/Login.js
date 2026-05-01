import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({ title: "Please fill all fields", status: "warning", duration: 3000, isClosable: true, position: "bottom" });
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post("/api/user/login", { email, password }, { headers: { "Content-type": "application/json" } });
      toast({ title: `Welcome back, ${data.name}! 👋`, status: "success", duration: 3000, isClosable: true, position: "bottom" });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({ title: "Login failed", description: error.response?.data?.message || "Invalid credentials", status: "error", duration: 4000, isClosable: true, position: "bottom" });
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-input-group">
        <label className="auth-label">Email Address</label>
        <input
          className="auth-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitHandler()}
        />
      </div>

      <div className="auth-input-group">
        <label className="auth-label">Password</label>
        <div className="auth-input-with-toggle">
          <input
            className="auth-input"
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitHandler()}
          />
          <button className="auth-toggle-btn" onClick={() => setShow(!show)}>
            {show ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      <button className="auth-btn-primary" onClick={submitHandler} disabled={loading}>
        {loading ? "Signing in..." : "Sign In →"}
      </button>

      <div className="auth-divider"><span>or</span></div>

      <button className="auth-btn-secondary" onClick={() => { setEmail("guest@example.com"); setPassword("123456"); }}>
        🎭 Use Guest Credentials
      </button>
    </div>
  );
};

export default Login;
