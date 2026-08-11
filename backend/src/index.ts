import "dotenv/config";
import express from "express"
import authRouter from "./routes/auth/auth.route.js";
import { connectRedis } from "./services/redis.service.js";
const app = express();
app.use(express.json());

app.get("/health" , (_req , res)=>{
	return res.json({msg : "I am Healthy"});
})
app.use("/api/v1/login" , authRouter);
async function startserver(){
	await connectRedis();
	app.listen(3000);
	console.log("Listening on 3000");
	
}
startserver();
