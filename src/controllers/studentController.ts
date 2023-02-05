import { NextFunction, Request, Response } from "express";
import { getErrorMessage } from "../helpers/catchErrorMessage";
import db from "../helpers/db";
import bcrypt from "bcryptjs";
import { uuid } from "uuidv4";
import { addRefreshTokenToWhiteList, generateTokens } from "../helpers/jwt";

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, lastName, email, password, role } = req.body;

    if (!name || !lastName || !email || !password || !role) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingStudent = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingStudent) {
      res.status(400);
      throw new Error("Student already exists");
    }

    if (password.length < 5) {
      res.status(400);
      throw new Error("Password must be at least 5 characters");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tokId = uuid() as unknown as number;

    const newStudent = await db.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { accessToken, refreshToken } = generateTokens(newStudent, tokId);

    await addRefreshTokenToWhiteList(tokId, refreshToken, newStudent.id);

    return res.status(201).json({
      newStudent,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    getErrorMessage(err);
  }
};

export const loginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const tokId = uuid() as unknown as number;
    const { accessToken, refreshToken } = generateTokens(existingUser, tokId);
    await addRefreshTokenToWhiteList(tokId, refreshToken, existingUser.id);

    return res.json({
        existingUser,
        accessToken,
        refreshToken
    })

  } catch (err) {
    getErrorMessage(err);
  }
};

export const refreshTokenFn = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById()
}   

export const profileFn = async (req: any, res: Response, next: NextFunction) => {
    try {
      const {userId} = req.payload;
      const user = await db.user.findUnique({
        where: {
          id: userId,
        }
      });

      if(!user) {
        res.status(404);
        throw new Error(`User not found`);
      }

      return res.status(200).json(user);
    } catch (err) {
      getErrorMessage(err);
    }
}