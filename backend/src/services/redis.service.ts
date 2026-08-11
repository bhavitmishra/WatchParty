import { createClient } from "redis";

export const redisClient = createClient({url : "redis://localhost:6379"});
redisClient.on("error", (err) => console.log("Redis Client Error", err))
export async function connectRedis() {
    // @ts-ignore
    await redisClient.connect();
  console.log("redfis connected");
}