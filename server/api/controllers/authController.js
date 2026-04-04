"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = exports.verifyEmail = exports.resendOtp = exports.verifyOtp = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
// -------------------------------------
// Helpers
// -------------------------------------
const generateAccessToken = (user, organizationId) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
// -------------------------------------
// REGISTER USER
// -------------------------------------
const email_utils_1 = require("../utils/email.utils");
// ... existing imports ...
// -------------------------------------
// REGISTER USER (Step 1)
// -------------------------------------
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        const existingUser = await prisma_service_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (!existingUser.emailVerified) {
                // If user exists but not verified, resend OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
                await prisma_service_1.default.user.update({
                    where: { id: existingUser.id },
                    data: {
                        password: await bcryptjs_1.default.hash(password, 10), // Update password just in case
                        name,
                        otp,
                        otpExpiry
                    }
                });
                await (0, email_utils_1.sendEmail)(email, "Verify Your Email - Raktasahayog", `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`);
                return res.status(200).json({
                    success: true,
                    message: "Account exists but unverified. New OTP sent.",
                    email
                });
            }
            return res.status(409).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const newUser = await prisma_service_1.default.user.create({
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
        await (0, email_utils_1.sendEmail)(email, "Verify Your Email - Raktasahayog", `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`);
        return res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your email.",
            email: newUser.email,
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
// -------------------------------------
// VERIFY OTP (Step 2)
// -------------------------------------
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const user = await prisma_service_1.default.user.findUnique({ where: { email } });
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
        await prisma_service_1.default.user.update({
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
    }
    catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyOtp = verifyOtp;
// -------------------------------------
// RESEND OTP
// -------------------------------------
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma_service_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.emailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await prisma_service_1.default.user.update({
            where: { id: user.id },
            data: { otp, otpExpiry }
        });
        await (0, email_utils_1.sendEmail)(email, "Resend Verification Code - Raktasahayog", `<p>Your new verification code is: <strong>${otp}</strong></p>`);
        res.json({ success: true, message: "OTP resent successfully" });
    }
    catch (error) {
        console.error("RESEND OTP ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.resendOtp = resendOtp;
// Legacy Link Verification (Keep for backward compatibility or remove if not needed)
const verifyEmail = async (req, res) => {
    // ... (keep or deprecate)
    return res.status(400).json({ message: "Please use OTP verification" });
};
exports.verifyEmail = verifyEmail;
// -------------------------------------
// LOGIN USER
// -------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_service_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
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
            const adminProfile = await prisma_service_1.default.adminProfile.findUnique({
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
    }
    catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
// -------------------------------------
// REFRESH TOKEN
// -------------------------------------
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Refresh token required" });
        }
        async (err, decoded) => {
            if (err)
                return res.status(401).json({ message: "Invalid refresh token" });
            // Fetch fresh user data to include current role/org
            const user = await prisma_service_1.default.user.findUnique({ where: { id: decoded.userId } });
            if (!user)
                return res.status(401).json({ message: "User not found" });
            let organizationId = undefined;
            if (user.role === 'ORGANIZATION') {
                const adminProfile = await prisma_service_1.default.adminProfile.findUnique({ where: { userId: user.id } });
                organizationId = adminProfile?.organizationId || undefined;
            }
            const newAccessToken = generateAccessToken(user, organizationId);
            return res.json({ accessToken: newAccessToken });
        };
    }
    catch (error) {
        console.error("REFRESH ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.refreshToken = refreshToken;
