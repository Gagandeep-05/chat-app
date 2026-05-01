const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config({ path: "./backend/.env" });
connectDB();
const app = express();

app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? true   // allow same-origin in production (frontend served by same server)
      : "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Store the user's ID so we can clean up on disconnect
  let currentUserId = null;

  socket.on("setup", (userData) => {
    currentUserId = userData._id;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    if (currentUserId) {
      socket.leave(currentUserId);
    }
  });
});
