import {Router} from "express"
import crypto from "crypto"
import { sendOtpEmail } from "../../services/otp.service.js";
import { redisClient } from "../../services/redis.service.js";
import prisma from "../../services/prisma.service.js";
import jwt from "jsonwebtoken"
import { otpLimiter, otpReqLimiter } from "../../middleware/rate-limiter.middleware.js";
import z from "zod"
const router = Router();
const secret = process.env.SERVER_SECRET;

if (!secret) {
    throw new Error("SERVER_SECRET is not configured");
}
const emailSchema = z.object({
    email: z.string().email().transform(v => v.toLowerCase().trim())
});
const verifySchema = z.object({
    email: z.string().email().transform(v => v.toLowerCase().trim()),
    otp: z.string().regex(/^\d{6}$/)
});
router.post("/" , otpReqLimiter , async (req , res)=>{
	// parse with zod
	// otp based login ? no password needed just upsert
	const result = emailSchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        msg: "Invalid email"
    });
}

const { email } = result.data;
	const otp = crypto.randomInt(100000 , 1000000)
	await redisClient.set(`otp:${email}` , otp , {EX : 300})
	await sendOtpEmail(email, otp);
	return res.json({ msg: "otp sent" });
})
router.post("/verify-otp" , otpLimiter , async(req , res)=>{
	const result = verifySchema.safeParse(req.body);

if (!result.success) {
    return res.status(400).json({
        msg: "Invalid email or otp"
    });
}

const { email , otp } = result.data;
	const storedOtp = await redisClient.get(`otp:${email}`);
	if(!storedOtp)
	{
		return res.json({msg : "OTP expired"});
	}
	if(storedOtp !== otp)
	{
		return res.json({msg : "Invalid OTP"})
	}
	await redisClient.del(`otp:${email}`);
	
	// upsert user here so if a new user entry is created else we just return the userid from our db or generatre one

	const user = await prisma.user.upsert({where : {email} , update : {} , create :	{email} });

	const token = jwt.sign(
    { userId: user.id },
    secret,
    { expiresIn: "7d" }
);
	return res.cookie("auth", token, {
      httpOnly: true,        // JS can't access
      secure: process.env.NODE_ENV === "production",         // true in production (HTTPS)
      sameSite: "lax",       // good default
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    }).json({msg : "Successfull" , token});

})
export default router