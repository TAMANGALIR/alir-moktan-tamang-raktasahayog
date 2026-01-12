import { Request, Response } from 'express';
import { PrismaClient, PriorityLevel, BloodGroup } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new donation request
export const createRequest = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { bloodGroup, location, donationCenter, preferredDate, priority, medicalConditions, requestUnits } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!bloodGroup || !location || !preferredDate) {
            res.status(400).json({ success: false, error: 'Blood Group, Location, and Preferred Date are required' });
            return;
        }

        const request = await prisma.donationRequest.create({
            data: {
                userId,
                bloodGroup: bloodGroup as BloodGroup,
                location,
                city: location, // Using location (District) as city for now
                donationCenter: donationCenter || 'Any capable center',
                preferredDate: new Date(preferredDate),
                priority: priority as PriorityLevel || 'NORMAL',
                medicalConditions,
                requestedUnits: Number(requestUnits) || 1,
                status: 'PENDING'
            }
        });

        res.status(201).json({ success: true, data: request, message: 'Donation request submitted successfully' });

    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get requests for the logged-in user
export const getMyRequests = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const requests = await prisma.donationRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: requests });

    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get requests for admin (Global or Regional)
export const getRequestsForAdmin = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        // Fetch Admin Profile to get region
        const adminProfile = await prisma.adminProfile.findUnique({
            where: { userId }
        });

        if (!adminProfile) {
            res.status(403).json({ success: false, error: 'Access denied. Admin profile not found.' });
            return;
        }

        let whereClause: any = {};

        // If not Global, filter by region
        if (adminProfile.region !== 'Global') {
            whereClause = {
                OR: [
                    { location: { contains: adminProfile.region, mode: 'insensitive' } },
                    { city: { contains: adminProfile.region, mode: 'insensitive' } }
                ]
            };
        }

        const requests = await prisma.donationRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: requests });

    } catch (error) {
        console.error('Get admin requests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update request status (Approve/Reject)
export const updateRequestStatus = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const adminProfile = await prisma.adminProfile.findUnique({
            where: { userId },
            include: { organization: true }
        });

        if (!adminProfile) {
            res.status(403).json({ success: false, error: 'Access denied.' });
            return;
        }

        // LOGIC: If status is APPROVED (Allocate), check and decrement inventory
        if (status === 'APPROVED') {
            const donationRequest = await prisma.donationRequest.findUnique({
                where: { id },
                select: { bloodGroup: true, location: true }
            });

            if (!donationRequest) {
                res.status(404).json({ success: false, error: 'Request not found' });
                return;
            }

            // 1. Try to find a specific Blood Unit (Prioritized)
            let bloodUnit = null;
            if (adminProfile.organizationId) {
                bloodUnit = await prisma.bloodUnit.findFirst({
                    where: {
                        organizationId: adminProfile.organizationId,
                        bloodGroup: donationRequest.bloodGroup,
                        status: 'AVAILABLE',
                        expiryDate: { gt: new Date() } // Not expired
                    },
                    orderBy: { expiryDate: 'asc' } // Use oldest first (FIFO)
                });
            }

            // 2. Fallback: Check aggregate stock (Legacy or manual entry)
            let hasAggregateStock = false;
            const inventory = await prisma.bloodInventory.findFirst({
                where: {
                    bloodGroup: donationRequest.bloodGroup,
                    // If Org-based, match Org. If not, match location (Legacy support)
                    ...(adminProfile.organizationId ? { organizationId: adminProfile.organizationId } : { location: adminProfile.region })
                }
            });

            if (inventory && inventory.quantity > 0) {
                hasAggregateStock = true;
            }

            if (!bloodUnit && !hasAggregateStock) {
                res.status(400).json({
                    success: false,
                    error: `Insufficient stock for ${donationRequest.bloodGroup}. Please Broadcast or Arrange external donation.`
                });
                return;
            }

            // Transaction: Update Request, Decrement Stock, Mark Unit Used, Notify Donor
            await prisma.$transaction(async (tx) => {
                // a. Mark Unit as USED & Notify Donor (if unit exists)
                if (bloodUnit) {
                    await tx.bloodUnit.update({
                        where: { id: bloodUnit.id },
                        data: {
                            status: 'USED',
                            usedFor: { connect: { id } }
                        }
                    });

                    // NOTIFICATION: The Heart of the Feature
                    if (bloodUnit.donorId) {
                        await tx.notification.create({
                            data: {
                                userId: bloodUnit.donorId,
                                type: 'LIVES_SAVED', // Ensure this Enum is added to Schema
                                message: `Your blood donation has been used to save a life! Thank you for being a hero.`,
                                read: false
                            }
                        });
                    } else if ((bloodUnit as any).guestEmail) {
                        // TODO: Integrate actual Email Service here
                        console.log(`[Email Notification] Sending "You saved a life" email to guest: ${(bloodUnit as any).guestEmail}`);
                    }
                }

                // b. Decrement Aggregate Inventory
                if (inventory) {
                    await tx.bloodInventory.update({
                        where: { id: inventory.id },
                        data: { quantity: { decrement: 1 } }
                    });
                }

                // c. Approve Request
                await tx.donationRequest.update({
                    where: { id },
                    data: {
                        status: 'APPROVED',
                        reviewedById: adminProfile.id,
                        reviewedAt: new Date(),
                        assignedAdminId: adminProfile.id,
                        organizationId: adminProfile.organizationId, // Fulfilled by this Org
                        fulfilledByUnitId: bloodUnit ? bloodUnit.id : undefined
                    }
                });
            });

            res.json({
                success: true,
                message: bloodUnit
                    ? 'Request approved, blood unit allocated, and donor notified!'
                    : 'Request approved and blood allocated from general stock.'
            });
            return;
        }

        // Default handle for other statuses (REJECTED, SEARCHING, etc.)
        const request = await prisma.donationRequest.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
                reviewedById: adminProfile.id,
                reviewedAt: new Date(),
                assignedAdminId: adminProfile.id
            }
        });

        res.json({ success: true, data: request, message: `Request ${status.toLowerCase()} successfully` });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
