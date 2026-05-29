import { Server } from "socket.io";
import { createServer } from "http";

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", (message) => {
      io.to(message.chat_id).emit("new-message", message);
    });
  });

  return io;
};
