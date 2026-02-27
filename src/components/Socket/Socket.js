import { io } from "socket.io-client";

export const Socket = io("https://app.radianthyve.com:8800", {
    autoConnect: false,
});
