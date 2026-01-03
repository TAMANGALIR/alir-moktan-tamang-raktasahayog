import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create or Update Donor Profile
// Create or Update Donor Profile
export const upsertDonorProfile = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { bloodGroup, location, latitude, longitude, lastDonationDate, weight, dateOfBirth, hasDiseases } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!bloodGroup || !location || !weight || !dateOfBirth) {
            res.status(400).json({ success: false, error: 'All fields (Blood Group, Location, Weight, DOB) are required' });
            return;
        }

        // --- Validation Logic (Non-blocking) ---
        const reasons: string[] = [];

        // 1. Weight Check
        if (Number(weight) < 50) {
            reasons.push('Underweight (must be > 50kg)');
        }

        // 2. Age Check
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 18 || age > 65) {
            reasons.push(`Age ${age} is not within eligible range (18-65)`);
        }

        // 3. Health Check
        if (hasDiseases) {
            reasons.push('Medical conditions present');
        }

        // Check if profile exists
        // const existingProfile = await prisma.donorProfile.findUnique({ where: { userId } }); // Not strictly needed for upsert

        // Calculate next eligible date based on last donation
        let nextEligibleDate = null;
        if (lastDonationDate) {
            const lastDate = new Date(lastDonationDate);
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + 56);
            nextEligibleDate = nextDate;
        }

        // Use upsert
        const profile = await prisma.donorProfile.upsert({
            where: { userId },
            update: {
                bloodGroup,
                location,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                weight: Number(weight),
                dateOfBirth: new Date(dateOfBirth),
                hasDiseases: Boolean(hasDiseases),
                lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
                nextEligibleDate
            },
            create: {
                userId,
                bloodGroup,
                location,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                weight: Number(weight),
                dateOfBirth: new Date(dateOfBirth),
                hasDiseases: Boolean(hasDiseases),
                lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
                nextEligibleDate
            }
        });

        // Calculate final eligibility status
        // Check date eligibility
        if (profile.nextEligibleDate && new Date() < profile.nextEligibleDate) {
            reasons.push('Waiting period active after recent donation');
        }

        const isEligible = reasons.length === 0;

        res.json({
            success: true,
            data: profile,
            message: isEligible ? 'Profile updated successfully' : 'Profile updated. Note: You are currently marked as ineligible.',
            eligibility: {
                eligible: isEligible,
                reasons: reasons,
                reason: reasons.join(', ') || 'Eligible to donate',
                nextEligibleDate: profile.nextEligibleDate
            }
        });

    } catch (error) {
        console.error('Upsert donor profile error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get Donor Eligibility
export const getDonorEligibility = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const profile = await prisma.donorProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            res.status(404).json({ success: false, error: 'Donor profile not found' });
            return;
        }

        const reasons: string[] = [];

        // Re-evaluate static criteria
        if (profile.weight && profile.weight < 50) {
            reasons.push('Underweight (must be > 50kg)');
        }

        if (profile.dateOfBirth) {
            const dob = new Date(profile.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (age < 18 || age > 65) {
                reasons.push(`Age ${age} is not within eligible range (18-65)`);
            }
        }

        if (profile.hasDiseases) {
            reasons.push('Medical conditions present');
        }

        if (profile.nextEligibleDate && new Date() < profile.nextEligibleDate) {
            reasons.push('Waiting period active');
        }

        const isEligible = reasons.length === 0;

        res.json({
            success: true,
            data: {
                eligible: isEligible,
                reasons: reasons,
                reason: reasons.join(', ') || 'Eligible to donate',
                nextEligibleDate: profile.nextEligibleDate
            }
        });

    } catch (error) {
        console.error('Get eligibility error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get Donation History
export const getDonorHistory = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const stats = await prisma.donorProfile.findUnique({
            where: { userId },
            select: {
                totalDonations: true,
                badge: true,
                donationHistory: {
                    orderBy: { date: 'desc' }
                }
            }
        });

        if (!stats) {
            res.status(404).json({ success: false, error: 'Profile not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                total: stats.totalDonations,
                badge: stats.badge,
                history: stats.donationHistory
            }
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
