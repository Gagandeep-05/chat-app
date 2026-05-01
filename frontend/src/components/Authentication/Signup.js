import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import { useToast, Progress } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const Signup = () => {
  const [show, setShow] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const { setUser } = ChatState();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState(undefined);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploadDone, setImageUploadDone] = useState(false);

  const submitHandler = async () => {
    if (imageUploading) {
      toast({ title: "Wait for image to finish uploading", status: "info", duration: 3000, isClosable: true, position: "bottom" });
      return;
    }
    setSubmitting(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({ title: "Please fill all required fields", status: "warning", duration: 4000, isClosable: true, position: "bottom" });
      setSubmitting(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({ title: "Passwords do not match", status: "warning", duration: 4000, isClosable: true, position: "bottom" });
      setSubmitting(false);
      return;
    }
    try {
      const payload = { name, email, password };
      if (pic) payload.pic = pic;
      const { data } = await axios.post("/api/user", payload, { headers: { "Content-type": "application/json" } });
      toast({ title: `Welcome, ${data.name}! 🎉`, status: "success", duration: 3000, isClosable: true, position: "bottom" });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setSubmitting(false);
      history.push("/chats");
    } catch (error) {
      toast({ title: "Registration failed", description: error.response?.data?.message || "Something went wrong", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setSubmitting(false);
    }
  };

  const postDetails = (pics) => {
    if (!pics) return;
    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast({ title: "Only JPG or PNG images allowed", status: "warning", duration: 4000, isClosable: true, position: "bottom" });
      return;
    }
    setImageUploading(true);
    setImageUploadDone(false);
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "piyushproj");
    fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", { method: "post", body: data })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setPic(data.url.toString());
          setImageUploadDone(true);
        }
        setImageUploading(false);
      })
      .catch(() => {
        toast({ title: "Image upload skipped — using default avatar", status: "info", duration: 3000, isClosable: true, position: "bottom" });
        setImageUploading(false);
      });
  };

  return (
    <div>
      <div className="auth-input-group">
        <label className="auth-label">Full Name</label>
        <input className="auth-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="auth-input-group">
        <label className="auth-label">Email Address</label>
        <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="auth-row" style={{ marginBottom: "18px" }}>
        <div>
          <label className="auth-label">Password</label>
          <div className="auth-input-with-toggle">
            <input className="auth-input" type={show ? "text" : "password"} placeholder="Min. 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="auth-toggle-btn" onClick={() => setShow(!show)}>
              {show ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>
        <div>
          <label className="auth-label">Confirm</label>
          <input className="auth-input" type={show ? "text" : "password"} placeholder="Repeat" value={confirmpassword} onChange={(e) => setConfirmpassword(e.target.value)} />
        </div>
      </div>

      <div className="auth-input-group">
        <label className="auth-label">Profile Picture <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
        <div className="upload-zone" onClick={() => document.getElementById("signup-file").click()}>
          <input id="signup-file" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => postDetails(e.target.files[0])} />
          {imageUploading ? (
            <div>
              <div style={{ marginBottom: "6px" }}>Uploading...</div>
              <Progress size="xs" isIndeterminate colorScheme="purple" borderRadius="full" />
            </div>
          ) : imageUploadDone ? (
            <span style={{ color: "rgba(134,239,172,0.9)" }}>✅ Image uploaded</span>
          ) : (
            "📷 Click to upload avatar"
          )}
        </div>
      </div>

      <button className="auth-btn-primary" onClick={submitHandler} disabled={submitting || imageUploading}>
        {submitting ? "Creating account..." : "Create Account →"}
      </button>
    </div>
  );
};

export default Signup;
