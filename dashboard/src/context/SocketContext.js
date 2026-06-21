import { createContext } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:3002", {
  withCredentials: true,
});

const SocketContext = createContext(socket);

export default SocketContext;