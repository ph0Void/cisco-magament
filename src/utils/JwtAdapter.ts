import { envConfig } from "@/config/EnvConfig";
import jwt from "jsonwebtoken";

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRATION = Number(envConfig.JWT_EXPIRATION) || 3600;

export class JwtAdapter {
  static generateToken(payload: any, expiresIn = JWT_EXPIRATION): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: expiresIn,
    });
  }

  static verifyToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, JWT_SECRET) as T;
    } catch (error) {
      return null;
    }
  }

  static isValidToken(token: string) {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }
}
