import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const SERVER_SECRET = process.env.SERVER_SECRET;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!SERVER_SECRET) {
      return res.status(500).json({ msg: "JWT secret not configured" });
    }

    // Prefer cookie, fall back to Authorization header
    const token = req.cookies?.auth ?? req.header("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: token missing" });
    }

    const decoded = jwt.verify(token, SERVER_SECRET) as JwtPayload | string;

    let userId: string | undefined;

    if (typeof decoded === "string") {
      userId = decoded;
    } else if (decoded && typeof decoded === "object") {
      userId = (decoded as any).userId ?? (decoded as JwtPayload).sub?.toString();
    }

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized: invalid token payload" });
    }

    // attach typed user object
    (req as unknown as Express.Request).user = { userId };

    return next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};