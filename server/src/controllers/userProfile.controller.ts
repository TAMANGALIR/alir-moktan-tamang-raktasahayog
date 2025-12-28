
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get User Profile
export const getUserProfile = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; // Fixed: accessing 'id' from token payload, not 'userId'

        if (!userId) {
            res.status(401).json({ success: false, error: 'User ID not found' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                donorProfile: true
            }
        });

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Flatten the response or just return user
        // Frontend expects phoneNumber and bloodGroup maybe?
        const responseData = {
            ...user,
            phoneNumber: user.phone, // Map phone to phoneNumber
            bloodGroup: user.donorProfile?.bloodGroup || null // Get from donor profile
        };

        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update User Profile
export const updateUserProfile = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; // Fixed: accessing 'id' from token payload
        const { name, phone, phoneNumber } = req.body; // Accept both phone and phoneNumber
        const finalPhone = phone || phoneNumber;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (name && name.length < 2) {
            res.status(400).json({ success: false, error: 'Name must be at least 2 characters long' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                phone: finalPhone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true
            }
        });

        const responseData = {
            ...updatedUser,
            phoneNumber: updatedUser.phone
        };

        res.json({ success: true, data: responseData, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
