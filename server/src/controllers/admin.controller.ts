import { Request, Response } from 'express';
import { PrismaClient, OrgType, OrgStatus, Role } from '@prisma/client';
import { sendRejectionEmail, sendEmail } from '../utils/email.utils';

const prisma = new PrismaClient();

import { hash } from 'bcryptjs';

// Register a new Organization (Pending Verification)
export const registerOrganization = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { name, type, location, latitude, longitude, contactInfo, website, email, password } = req.body;

        let licenseUrl = req.body.licenseUrl; // Fallback or direct URL
        if (req.file) {
            licenseUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Basic Validation
        if (!name || !location || !licenseUrl || !email || !password) {
            res.status(400).json({ success: false, error: 'Name, Location, Email, Password, and License Proof are required' });
            return;
        }

        const existingOrg = await prisma.organization.findUnique({ where: { name } });
        if (existingOrg) {
            res.status(400).json({ success: false, error: 'Organization with this name already exists' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ success: false, error: 'User with this email already exists' });
            return;
        }

        const hashedPassword = await hash(password, 10);

        // Transaction: Create User -> Org -> AdminProfile
        await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    name: `Admin - ${name}`,
                    email,
                    password: hashedPassword,
                    role: Role.ORGANIZATION,
                    emailVerified: false, // Could send verification email later
                }
            });

            // 2. Create Organization
            const organization = await tx.organization.create({
                data: {
                    name,
                    type: type as OrgType || 'HOSPITAL',
                    location,
                    latitude: latitude ? Number(latitude) : null,
                    longitude: longitude ? Number(longitude) : null,
                    contactInfo,
                    website,
                    licenseUrl,
                    status: 'PENDING'
                }
            });

            // 3. Create Admin Profile linking them
            await tx.adminProfile.create({
                data: {
                    userId: user.id,
                    organizationId: organization.id,
                    region: location, // Default region to location
                    specialization: 'Organization Admin'
                }
            });

            return organization;
        });

        // Send Confirmation Email
        await sendEmail(
            email,
            "Organization Registration Received - Raktasahayog",
            `<p>Dear ${name},</p>
            <p>Thank you for registering your organization with Raktasahayog. Your application has been received and is currently <strong>Pending Verification</strong>.</p>
            <p>Our team will review your details and documentation. You will receive another email once your account has been approved.</p>
            <br>
            <p>Best Regards,<br>Raktasahayog Team</p>`
        );

        res.status(201).json({
            success: true,
            message: 'Organization registered successfully. Login account created. Pending verification.'
        });

    } catch (error) {
        console.error('Register Org error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Super Admin: Get Unverified Organizations
// Super Admin: Get Organizations with Filters
export const getAllOrgs = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { status, search, type } = req.query; // 'PENDING', 'VERIFIED', 'REJECTED', or undefined (All)

        const whereClause: any = {};
        if (status && status !== 'ALL') {
            whereClause.status = status as OrgStatus;
        }

        if (type && type !== 'ALL') {
            whereClause.type = type as OrgType;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { location: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const orgs = await prisma.organization.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: orgs });

    } catch (error) {
        console.error('Get orgs error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Super Admin: Verify (Approve/Reject) Organization
export const verifyOrganization = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // 'VERIFIED' or 'REJECTED'

        // Validate Status
        if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
            res.status(400).json({ success: false, error: 'Invalid status' });
            return;
        }

        const org = await prisma.organization.update({
            where: { id },
            data: { status: status as OrgStatus }
        });

        // If VERIFIED, also verify the associated user account
        if (status === 'VERIFIED') {
            const adminProfile = await prisma.adminProfile.findFirst({
                where: { organizationId: id },
                include: { user: true }
            });

            if (adminProfile) {
                await prisma.user.update({
                    where: { id: adminProfile.userId },
                    data: { emailVerified: true }
                });

                // Send approval email
                await sendEmail(
                    adminProfile.user.email,
                    "Organization Approved - Raktasahayog",
                    `<p>Dear ${org.name},</p>
                    <p>Congratulations! Your organization has been <strong>approved</strong> and verified.</p>
                    <p>You can now login to your account and access all features.</p>
                    <br>
                    <p>Best Regards,<br>Raktasahayog Team</p>`
                );
            }
        }

        if (status === 'REJECTED' && org.contactInfo) {
            if (org.contactInfo.includes('@')) {
                await sendRejectionEmail(org.contactInfo, org.name, rejectionReason || 'Documentation issues');
            }
        }

        res.json({ success: true, data: org, message: `Organization ${status.toLowerCase()} successfully` });

    } catch (error) {
        console.error('Verify org error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Super Admin: Get Dashboard Stats
export const getDashboardStats = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const [usersCount, orgsCount, campaignsCount, bloodStock] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.organization.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            prisma.campaign.count(),
            prisma.bloodInventory.aggregate({
                _sum: { quantity: true }
            })
        ]);

        const verifiedOrgs = orgsCount.find(o => o.status === 'VERIFIED')?._count.id || 0;
        const pendingOrgs = orgsCount.find(o => o.status === 'PENDING')?._count.id || 0;

        res.json({
            success: true,
            data: {
                totalUsers: usersCount,
                verifiedOrganizations: verifiedOrgs,
                pendingOrganizations: pendingOrgs,
                totalCampaigns: campaignsCount,
                totalBloodUnits: bloodStock._sum.quantity || 0,
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
