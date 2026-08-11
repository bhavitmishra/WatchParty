import {Router} from "express"
import { authMiddleware } from "../../middleware/auth.middleware.js";
import prisma from "../../services/prisma.service.js";
import z from "zod";
import bcrypt from "bcrypt"
const router = Router();
const joinRoomSchema = z.object({
    id : z.string(),
    password : z.string()
})
const createRoomSchema = z.object({
    name: z.string().min(1).max(100),
    password: z.string().min(6).max(100)
});
router.get("/rooms" , authMiddleware , async(_req , res)=>{
    const rooms = await prisma.room.findMany({select : {id : true , name : true}});
    return res.json({rooms})
})

router.post("/join-room" , authMiddleware , async(req , res)=>{
    const result = joinRoomSchema.safeParse(req.body);
    if(!result.success)
    {
        return res.json({msg : "Invalid format"})
    }
    const {id , password} = result.data;
   const validRoom = await prisma.room.findUnique({
    where: { id }
});

if (!validRoom) {
    return res.status(404).json({
        msg: "Room not found"
    });
}

const validPassword = await bcrypt.compare(
    password,
    validRoom.password
);

if (!validPassword) {
    return res.status(401).json({
        msg: "Invalid credentials"
    });
}
const existingMember = await prisma.roomMember.findUnique({
    where: {
        roomId_userId: {
            roomId: validRoom.id,
            userId : req.user.userId
        }
    }
});

if (existingMember) {
    return res.status(409).json({
        msg: "Already a member of this room"
    });
}
await prisma.roomMember.create({ data: { roomId: validRoom.id, userId : req.user.userId}}); 
return res.json({ msg: "Joined room" });
})

router.post("/rooms", authMiddleware, async (req, res) => {
    const result = createRoomSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            msg: "Invalid request"
        });
    }

    if (!req.user) {
        return res.status(401).json({
            msg: "Unauthorized"
        });
    }

    const { name, password } = result.data;
    const userId = req.user.userId;

    const passwordHash = await bcrypt.hash(password, 12);

    const room = await prisma.room.create({
        data: {
            name,
            password : passwordHash,
            hostId: userId,
            members: {
                create: {
                    userId
                }
            }
        }
    });

    return res.status(201).json({
        roomId: room.id
    });
});