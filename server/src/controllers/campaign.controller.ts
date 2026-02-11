
import { Request, Response } from 'express';
import { PrismaClient, CampaignStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email.utils';

const prisma = new PrismaClient();

// Create Campaign (Organization Only)
export const createCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, description, date, startTime, endTime, location, latitude, longitude } = req.body;

        let licenseUrl = null;
        let bannerUrl = null;

        // Handle multiple file uploads
        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            if (files.permit?.[0]) {
                licenseUrl = `${req.protocol}://${req.get('host')}/uploads/${files.permit[0].filename}`;
            }
            if (files.banner?.[0]) {
                bannerUrl = `${req.protocol}://${req.get('host')}/uploads/${files.banner[0].filename}`;
            }
        }

        // Robust lookup: Get Organization ID from DB using User ID
        // This works even if the token payload is missing organizationId
        let organizationId = req.user?.organizationId;

        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId || undefined;
        }

        if (!organizationId) {
            return res.status(403).json({ message: 'Only organizations can create campaigns (No Org ID found)' });
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                date: new Date(date),
                startTime,
                endTime,
                location,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                bannerUrl,
                governmentPermitUrl: licenseUrl,
                organizerId: organizationId,
                status: 'PAYMENT_PENDING' as any
            } as any, // Cast to any to bypass stale Prisma types until restart
            include: { organizer: true } // Include organizer for notification details
        });

        // Notify Admins
        notifyAdmins('CAMPAIGN_CREATED', {
            message: `New Campaign Request: "${title}" by ${(campaign as any).organizer?.name}`,
            campaignId: campaign.id,
            status: 'PENDING'
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Create Campaign Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Organization's Campaigns
export const getOrgCampaigns = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Robust lookup: Get Organization ID from DB using User ID
        let organizationId = req.user?.organizationId;

        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId || undefined;
        }

        if (!organizationId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const campaigns = await prisma.campaign.findMany({
            where: { organizerId: organizationId },
            orderBy: { date: 'desc' }
        });

        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Campaign (Organization Only)
export const updateCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, date, startTime, endTime, location, latitude, longitude } = req.body;

        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.user.id } });
            organizationId = adminProfile?.organizationId || undefined;
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } });

        if (!campaign || campaign.organizerId !== organizationId) {
            return res.status(404).json({ message: 'Campaign not found or unauthorized' });
        }

        const campaignAny = campaign as any; // Cast for stale types
        let newStatus = campaign.status;
        let newRejectionReason = campaignAny.rejectionReason;

        if (campaign.status === CampaignStatus.REJECTED) {
            newStatus = CampaignStatus.PENDING;
            newRejectionReason = null;
        }

        // Handle File Updates
        let licenseUrl = campaignAny.governmentPermitUrl;
        let bannerUrl = campaignAny.bannerUrl;

        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            if (files.permit?.[0]) {
                licenseUrl = `${req.protocol}://${req.get('host')}/uploads/${files.permit[0].filename}`;
            }
            if (files.banner?.[0]) {
                bannerUrl = `${req.protocol}://${req.get('host')}/uploads/${files.banner[0].filename}`;
            }
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: {
                title,
                description,
                date: new Date(date),
                startTime,
                endTime,
                location,
                latitude: latitude ? parseFloat(latitude) : campaignAny.latitude,
                longitude: longitude ? parseFloat(longitude) : campaignAny.longitude,
                bannerUrl,
                governmentPermitUrl: licenseUrl,
                status: newStatus,
                rejectionReason: newRejectionReason
            } as any,
            include: { organizer: true }
        });

        // Notify Admins about the update
        notifyAdmins('CAMPAIGN_UPDATED', {
            message: `Campaign Updated: "${title}" by ${(updatedCampaign as any).organizer?.name}`,
            campaignId: updatedCampaign.id,
            status: newStatus
        });

        res.json(updatedCampaign);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Campaign Details (Organization Only) with Registrations
export const getCampaignDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        let organizationId = req.user?.organizationId;

        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.user.id } });
            organizationId = adminProfile?.organizationId || undefined;
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                registrations: {
                    include: {
                        user: {
                            include: {
                                donorProfile: true
                            }
                        }
                    }
                }
            }
        });

        if (!campaign || campaign.organizerId !== organizationId) {
            return res.status(404).json({ message: 'Campaign not found or unauthorized' });
        }

        res.json(campaign);
    } catch (error) {
        console.error("Get Campaign Details Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Campaign (Organization Only)
export const deleteCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.user.id } });
            organizationId = adminProfile?.organizationId || undefined;
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } });

        if (!campaign || campaign.organizerId !== organizationId) {
            return res.status(404).json({ message: 'Campaign not found or unauthorized' });
        }

        await prisma.campaign.delete({ where: { id } });
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ------------------------------------------------------------------
// ADMIN FUNCTIONS (Approval & Algorithm)
// ------------------------------------------------------------------

// Get All Campaigns for Admin (Sorted by Urgency/Date)
// Get All Campaigns for Admin (Paginated, Searchable, Filterable)
export const getAllCampaignsForAdmin = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const status = req.query.status as string || 'ALL';

        const skip = (page - 1) * limit;

        const whereClause: any = {};

        // Status Filter
        if (status !== 'ALL' && Object.values(CampaignStatus).includes(status as CampaignStatus)) {
            whereClause.status = status as CampaignStatus;
        }

        // Search Filter (Title or Organizer Name)
        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { organizer: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Execute Query with Pagination
        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where: whereClause,
                include: { organizer: true },
                skip,
                take: limit,
                orderBy: { date: 'asc' } // Approximate Urgency (Sooner = Higher Priority)
            }),
            prisma.campaign.count({ where: whereClause })
        ]);

        // Calculate Urgency Scores for the current page
        const enrichedCampaigns = campaigns.map(campaign => {
            const today = new Date();
            const eventDate = new Date(campaign.date);
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let urgencyScore = diffDays < 0 ? 0 : 100 / (diffDays + 1);

            return { ...campaign, urgencyScore, daysUntil: diffDays };
        });

        res.json({
            data: enrichedCampaigns,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get All Campaigns Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Campaign Status (Admin)
export const updateCampaignStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body; // APPROVED or REJECTED

        if (!Object.values(CampaignStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status === CampaignStatus.REJECTED && !reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === CampaignStatus.REJECTED ? reason : null
            },
            include: { organizer: { include: { admins: true } } }
        });

        // Auto-refund on rejection if payment was completed
        if (status === CampaignStatus.REJECTED) {
            const completedPayment = await (prisma as any).payment.findFirst({
                where: { campaignId: id, status: 'COMPLETED' }
            });
            if (completedPayment) {
                await (prisma as any).payment.update({
                    where: { id: completedPayment.id },
                    data: {
                        status: 'REFUNDED',
                        refundedAt: new Date(),
                        refundId: `REFUND-${Date.now()}`
                    }
                });
            }
        }

        // NOTIFICATION LOGIC
        // Notify all admins of the organization about the status change
        const campaignAny = campaign as any;
        if (campaignAny.organizer?.admins) {
            const message = status === CampaignStatus.APPROVED
                ? `Your campaign "${campaign.title}" has been APPROVED!`
                : `Your campaign "${campaign.title}" has been REJECTED. Reason: ${reason}`;

            const type = status === CampaignStatus.APPROVED ? 'GENERAL' : 'REQUEST_ALERT';

            // Create DB Notifications and Send Real-time Socket Event
            await processNotifications(campaignAny.organizer.admins, message, type, campaign.id);
        }

        res.json(campaign);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper to handle both DB and Socket processing
import { sendNotification, notifyAdmins } from '../utils/socket.utils';

async function processNotifications(admins: any[], message: string, type: any, campaignId: string) {
    // 1. Bulk Create in DB
    await prisma.notification.createMany({
        data: admins.map(admin => ({
            userId: admin.userId,
            message,
            type
        }))
    });

    // 2. Send Real-time Events
    admins.forEach(admin => {
        sendNotification(admin.userId, 'CAMPAIGN_UPDATE', {
            message,
            campaignId,
            status: type === 'GENERAL' ? 'APPROVED' : 'REJECTED'
        });
    });
}

// Get Public Approved Campaigns
export const getPublicCampaigns = async (req: Request, res: Response) => {
    try {
        const prismaAny = prisma as any;
        const campaigns = await prisma.campaign.findMany({
            where: {
                status: CampaignStatus.APPROVED,
                date: { gte: new Date() } // Only future campaigns
            },
            include: {
                organizer: true,
                _count: {
                    select: { registrations: true, donations: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Aggregate total donations per campaign
        const campaignsWithDonations = await Promise.all(
            campaigns.map(async (campaign: any) => {
                const result = await prismaAny.campaignDonation.aggregate({
                    where: { campaignId: campaign.id, status: 'COMPLETED' },
                    _sum: { amount: true }
                });
                return {
                    ...campaign,
                    totalDonated: result._sum.amount || 0
                };
            })
        );

        res.json(campaignsWithDonations);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ------------------------------------------------------------------
// USER FUNCTIONS
// ------------------------------------------------------------------

// Register for a Campaign
export const registerForCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user has a donor profile
        const donorProfile = await prisma.donorProfile.findUnique({
            where: { userId }
        });

        if (!donorProfile) {
            return res.status(403).json({ message: 'You must create a donor profile before registering.' });
        }

        // Check if already registered
        const existingRegistration = await prisma.campaignRegistration.findFirst({
            where: {
                campaignId: id,
                userId
            }
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this campaign.' });
        }

        // Create Registration
        await prisma.campaignRegistration.create({
            data: {
                campaignId: id,
                userId
            }
        });

        res.json({ success: true, message: 'Successfully registered for the campaign!' });

    } catch (error) {
        console.error('Campaign Registration Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Check Registration Status
export const checkRegistrationStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.json({ registered: false });

        const registration = await prisma.campaignRegistration.findFirst({
            where: { campaignId: id, userId }
        });

        res.json({ registered: !!registration });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkAndCompleteCampaigns = async () => {
    try {
        const today = new Date();
        // Update all APPROVED campaigns where date is in the past to COMPLETED
        const result = await prisma.campaign.updateMany({
            where: {
                status: CampaignStatus.APPROVED,
                date: { lt: today }
            },
            data: {
                status: CampaignStatus.COMPLETED
            }
        });

        if (result.count > 0) {
            console.log(`Auto-Completed ${result.count} campaigns.`);
        }
    } catch (error) {
        console.error('Auto-Complete Job Error:', error);
    }
};

// ------------------------------------------------------------------
// CAMPAIGN DONOR MANAGEMENT (Org Only)
// ------------------------------------------------------------------

// Update Donor Registration Status (Mark as Donated/No-Show)
import { RegistrationStatus } from '@prisma/client';

// Helper: Check if campaign is currently active (allow buffer of 1 hour after end time for final updates)
const isCampaignActive = (campaign: any): boolean => {
    const now = new Date();
    const campaignDate = new Date(campaign.date);

    // Parse Start Time
    const [startH, startM] = campaign.startTime.split(':').map(Number);
    const startDateTime = new Date(campaignDate);
    startDateTime.setHours(startH, startM, 0, 0);

    // Parse End Time
    const [endH, endM] = campaign.endTime.split(':').map(Number);
    const endDateTime = new Date(campaignDate);
    endDateTime.setHours(endH, endM, 0, 0);

    // Add 1 hour buffer to end time for closing tasks
    endDateTime.setHours(endDateTime.getHours() + 1);

    return now >= startDateTime && now <= endDateTime;
};

export const updateRegistrationStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id, registrationId } = req.params;
        const { status, volume } = req.body;

        if (!Object.values(RegistrationStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Verify Org Ownership
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.user.id } });
            organizationId = adminProfile?.organizationId || undefined;
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign || campaign.organizerId !== organizationId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Time Restriction Check
        if (!isCampaignActive(campaign)) {
            return res.status(403).json({
                message: 'Donor status updates are only allowed during campaign hours (and up to 1 hour after).'
            });
        }

        // Update Registration
        const registration = await prisma.campaignRegistration.update({
            where: { id: registrationId },
            data: { status } as any, // Cast to any to bypass stale types
            include: { user: { include: { donorProfile: true } } }
        }) as any;

        // If marked as DONATED, handle post-donation logic (Inventory & History)
        if (status === RegistrationStatus.DONATED) {
            const donationVolume = volume || 450;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 42); // 42 days for shelf life

            // Create Blood Unit
            const bloodUnitData: any = {
                organizationId,
                bloodGroup: registration.user?.donorProfile?.bloodGroup || registration.guestBloodGroup,
                volume: donationVolume,
                status: 'AVAILABLE',
                expiryDate
            };

            if (registration.userId) {
                bloodUnitData.donorId = registration.userId;
            } else {
                bloodUnitData.guestName = registration.guestName;
                bloodUnitData.guestEmail = registration.guestEmail;
            }

            // Only create blood unit if blood group is known
            if (bloodUnitData.bloodGroup) {
                await prisma.bloodUnit.create({ data: bloodUnitData });

                // AGGREGATE INVENTORY UPDATE
                // Check if inventory record exists for this Org + Blood Group
                const inventory = await prisma.bloodInventory.findFirst({
                    where: {
                        organizationId,
                        bloodGroup: bloodUnitData.bloodGroup
                    }
                });

                if (inventory) {
                    await prisma.bloodInventory.update({
                        where: { id: inventory.id },
                        data: {
                            quantity: { increment: donationVolume },
                            // Update expiry to the latest unit's expiry if deeper logic isn't present
                            // But usually aggregate expiry is complex. Keeping existing or updating to latest unit's expiry.
                            expiryDate
                        }
                    });
                } else {
                    // Start: Fetch Org for Location
                    const org = await prisma.organization.findUnique({
                        where: { id: organizationId },
                        select: { location: true }
                    });
                    // End: Fetch Org for Location

                    await prisma.bloodInventory.create({
                        data: {
                            organizationId,
                            bloodGroup: bloodUnitData.bloodGroup,
                            quantity: donationVolume,
                            location: org?.location || 'Unknown',
                            expiryDate
                        }
                    });
                }
            }


            // Helper: Calculate Badge
            const calculateBadge = (count: number) => {
                if (count >= 25) return 'DIAMOND';
                if (count >= 10) return 'PLATINUM';
                if (count >= 5) return 'GOLD';
                if (count >= 3) return 'SILVER';
                if (count >= 1) return 'BRONZE';
                return 'NORMAL';
            };

            // ... inside updateRegistrationStatus ...

            // Update Donor Profile (if registered user)
            if (registration.userId && registration.user?.donorProfile) {
                const newCount = registration.user.donorProfile.totalDonations + 1;
                const newBadge = calculateBadge(newCount);

                await prisma.donorProfile.update({
                    where: { userId: registration.userId },
                    data: {
                        lastDonationDate: new Date(),
                        totalDonations: { increment: 1 },
                        badge: newBadge as any // Update Badge
                    }
                });

                // Add History Record
                await prisma.donationHistory.create({
                    data: {
                        donorId: registration.user.donorProfile.id,
                        date: new Date(),
                        livesSaved: 0 // Default 0 until used
                    }
                });

                // Send Thank You Email
                if (registration.user.email) {
                    await sendEmail(
                        registration.user.email,
                        'Thank You for Your Donation - Raktasahayog',
                        `<div style="font-family: Arial, sans-serif; color: #333;">
                            <h2 style="color: #e63946;">Thank You for Being a Hero! 🦸</h2>
                            <p>Dear <strong>${registration.user.name}</strong>,</p>
                            <p>Thank you for donating blood at our campaign <strong>${campaign.title}</strong>.</p>
                            <p>Your generosity makes a huge difference. Your donor profile has been updated!</p>
                            <p>Total Donations: <strong>+1</strong></p>
                            <br/>
                            <p>Warm regards,</p>
                            <p><strong>The Raktasahayog Team</strong></p>
                        </div>`
                    );
                }
            }
        }

        res.json(registration);
    } catch (error) {
        console.error("Update Registration Status Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add Manual Guest Registration (Walk-in)
export const registerGuest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, bloodGroup, phone, email, status } = req.body;

        // Verify Org Ownership
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.user.id } });
            organizationId = adminProfile?.organizationId || undefined;
        }

        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign || campaign.organizerId !== organizationId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Time Restriction Check
        if (!isCampaignActive(campaign)) {
            return res.status(403).json({
                message: 'Walk-in registrations are only allowed during campaign hours.'
            });
        }

        const registration = await prisma.campaignRegistration.create({
            data: {
                campaignId: id,
                guestName: name,
                guestBloodGroup: bloodGroup,
                guestPhone: phone,
                guestEmail: email,
                status: status || RegistrationStatus.REGISTERED
            }
        });

        res.json(registration);
    } catch (error) {
        console.error("Register Guest Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
