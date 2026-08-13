import {WebSocketServer} from 'ws';


const wss = new WebSocketServer({port : 6969});

wss.on("connection" , (ws : any)=>{
	ws.on("error" , console.error());
	ws.on("message" , (message : any)=>{
		console.log(`recieved_message : ${message}`);
	})
	ws.send("Connected Successfully");
})
