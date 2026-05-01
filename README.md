# 💬 Talk-A-Tive — Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack and Socket.io.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, Chakra UI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Real-Time** | Socket.io |
| **Auth** | JWT + Bcrypt |

## Features

- 🔐 **User Authentication** — Register & login with JWT tokens
- 💬 **Real-Time Messaging** — Instant message delivery via Socket.io
- ⌨️ **Typing Indicators** — See when someone is typing
- 👥 **Group Chats** — Create groups, add/remove members, rename
- 🔍 **User Search** — Find people by name or email
- 🔔 **Notifications** — Get notified of new messages
- 👤 **User Profiles** — View profile with avatar (Cloudinary upload)

## Run Locally

Clone the project

```bash
git clone https://github.com/Gagandeep-05/chat-app.git
cd chat-app
```

Install dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

Create `backend/.env` file

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the backend server

```bash
npm run server
```

Start the frontend (in a new terminal)

```bash
cd frontend
npm start
```

The app will be running at `http://localhost:3000`

## Made By

- [@Gagandeep-05](https://github.com/Gagandeep-05)
