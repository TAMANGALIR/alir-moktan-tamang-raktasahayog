import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from '../services/prisma.service';

// -------------------------------------
// Helpers
// -------------------------------------
const generateAccessToken = (user: any, organizationId?: string) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
};

// -------------------------------------
// REGISTER USER
// -------------------------------------
import { sendEmail } from '../utils/email.utils';

// ... existing imports ...

// -------------------------------------
// REGISTER USER (Step 1)
// -------------------------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // If user exists but not verified, resend OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: await bcrypt.hash(password, 10), // Update password just in case
            name,
            otp,
            otpExpiry
          }
        });

        await sendEmail(
          email,
          "Verify Your Email - Raktasahayog",
          `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        );

        return res.status(200).json({
          success: true,
          message: "Account exists but unverified. New OTP sent.",
          email
        });
      }
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        otp,
        otpExpiry,
        emailVerified: false
      },
    });

    await sendEmail(
      email,
      "Verify Your Email - Raktasahayog",
      `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      email: newUser.email,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------
// VERIFY OTP (Step 2)
// -------------------------------------
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP Valid
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    // Auto-login (Generate tokens)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    return res.json({
      success: true,
      message: "Email verified successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------
// RESEND OTP
// -------------------------------------
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry }
    });

    await sendEmail(
      email,
      "Resend Verification Code - Raktasahayog",
      `<p>Your new verification code is: <strong>${otp}</strong></p>`
    );

    res.json({ success: true, message: "OTP resent successfully" });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Legacy Link Verification (Keep for backward compatibility or remove if not needed)
export const verifyEmail = async (req: Request, res: Response) => {
  // ... (keep or deprecate)
  return res.status(400).json({ message: "Please use OTP verification" });
};

// -------------------------------------
// LOGIN USER
// -------------------------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.emailVerified) {
      if (user.role === 'ORGANIZATION') {
        return res.status(403).json({ message: "Your organization account is pending approval by an administrator." });
      }
      return res.status(403).json({ message: "Email not verified. Please verify your email." });
    }

    // Check for Organization association if role is 'ORGANIZATION'
    let organizationId = undefined;
    if (user.role === 'ORGANIZATION') {
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: user.id },
      });
      organizationId = adminProfile?.organizationId || undefined;
    }

    const accessToken = generateAccessToken(user, organizationId);
    const refreshToken = generateRefreshToken(user.id);

    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId // Return to client too
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------
// REFRESH TOKEN
// -------------------------------------
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    async (err: any, decoded: any) => {
      if (err) return res.status(401).json({ message: "Invalid refresh token" });

      // Fetch fresh user data to include current role/org
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(401).json({ message: "User not found" });

      let organizationId = undefined;
      if (user.role === 'ORGANIZATION') {
        const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });
        organizationId = adminProfile?.organizationId || undefined;
      }

      const newAccessToken = generateAccessToken(user, organizationId);

      return res.json({ accessToken: newAccessToken });
    }

  } catch (error) {
    console.error("REFRESH ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
