"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 6969 });
wss.on("connection", (ws) => {
    ws.on("error", console.error());
    ws.on("message", (message) => {
        console.log(`recieved_message : ${message}`);
    });
    ws.send("Connected Successfully");
});
//# sourceMappingURL=index.js.map