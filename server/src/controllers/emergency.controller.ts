import { Response } from 'express';
import { PrismaClient, EmergencyStatus, ResponseStatus, BloodGroup } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../utils/socket.utils';

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in kilometers
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Create emergency blood request
export const createEmergencyRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            bloodGroup,
            unitsNeeded,
            urgencyLevel,
            location,
            latitude,
            longitude,
            hospitalName,
            contactPerson,
            contactPhone,
            radiusKm,
            message,
            expiresAt
        } = req.body;

        // Get organization ID
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId ?? undefined;
        }

        if (!organizationId) {
            return res.status(403).json({ message: 'Only organizations can create emergency requests' });
        }

        // Create emergency request
        const emergencyRequest = await prisma.emergencyRequest.create({
            data: {
                organizationId: organizationId as string,
                bloodGroup,
                unitsNeeded: parseInt(unitsNeeded),
                urgencyLevel,
                location,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                hospitalName,
                contactPerson,
                contactPhone,
                radiusKm: parseFloat(radiusKm || '10'),
                message,
                expiresAt: new Date(expiresAt),
                status: EmergencyStatus.ACTIVE
            },
            include: {
                organization: true
            }
        });

        // Find eligible donors within radius
        const eligibleDonors = await findEligibleDonors(
            bloodGroup,
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(radiusKm || '10')
        );

        // Create in-app notifications for eligible donors
        const notificationPromises = eligibleDonors.map(donor => {
            const message = `🚨 URGENT: ${bloodGroup.replace('_', ' ')} Blood Needed! ${unitsNeeded} units needed at ${hospitalName || location}. Distance: ~${Math.round(donor.distance)}km. Contact: ${contactPerson} (${contactPhone})`;

            // Send socket notification immediately
            sendNotification(donor.user.id, 'EMERGENCY', {
                message,
                emergencyId: emergencyRequest.id
            });

            return prisma.notification.create({
                data: {
                    userId: donor.user.id,
                    type: 'EMERGENCY',
                    message,
                    read: false
                }
            });
        });

        await Promise.all(notificationPromises);

        // Send SMS to eligible donors (using free TextBelt service)
        if (eligibleDonors.length > 0 && process.env.ENABLE_SMS === 'true') {
            try {
                const smsPromises = eligibleDonors.slice(0, 5).map(async (donor) => {
                    if (!donor.user.phone) return;

                    const message = `🚨 URGENT BLOOD NEEDED\nType: ${bloodGroup.replace('_', ' ')}\nUnits: ${unitsNeeded}\nLocation: ${hospitalName || location}\nDistance: ~${Math.round(donor.distance)}km\nContact: ${contactPerson}\n${contactPhone}`;

                    await fetch('https://textbelt.com/text', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: donor.user.phone,
                            message: message,
                            key: process.env.TEXTBELT_API_KEY || 'textbelt'
                        })
                    });
                });

                await Promise.allSettled(smsPromises);
                console.log(`SMS sent to ${Math.min(eligibleDonors.length, 5)} donors`);
            } catch (error) {
                console.error('SMS sending failed:', error);
            }
        }

        console.log(`Emergency broadcast created. ${eligibleDonors.length} eligible donors notified.`);

        res.status(201).json({
            success: true,
            data: emergencyRequest,
            eligibleDonorsCount: eligibleDonors.length,
            notificationsSent: eligibleDonors.length
        });
    } catch (error) {
        console.error('Create Emergency Request Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Find eligible donors based on blood type and location
async function findEligibleDonors(
    bloodGroup: BloodGroup,
    latitude: number,
    longitude: number,
    radiusKm: number
) {
    const donors = await prisma.donorProfile.findMany({
        where: {
            bloodGroup,
            latitude: { not: null },
            longitude: { not: null }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true
                }
            }
        }
    });

    const eligibleDonors = donors
        .filter(donor => {
            if (!donor.latitude || !donor.longitude) return false;
            const distance = calculateDistance(latitude, longitude, donor.latitude, donor.longitude);
            return distance <= radiusKm;
        })
        .map(donor => ({
            ...donor,
            distance: calculateDistance(latitude, longitude, donor.latitude!, donor.longitude!)
        }))
        .sort((a, b) => a.distance - b.distance);

    return eligibleDonors;
}

// Get active emergency requests for users
export const getActiveEmergencies = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.json({ success: true, data: [] });
        }

        const donorProfile = await prisma.donorProfile.findUnique({
            where: { userId }
        });

        if (!donorProfile) {
            return res.json({ success: true, data: [] });
        }

        const activeRequests = await prisma.emergencyRequest.findMany({
            where: {
                status: EmergencyStatus.ACTIVE,
                bloodGroup: donorProfile.bloodGroup,
                expiresAt: { gte: new Date() }
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        location: true
                    }
                },
                responses: {
                    where: { donorId: userId },
                    select: {
                        id: true,
                        status: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const requestsWithDistance = activeRequests.map(request => {
            let distance = null;
            let withinRadius = false;

            if (donorProfile.latitude && donorProfile.longitude) {
                distance = calculateDistance(
                    request.latitude,
                    request.longitude,
                    donorProfile.latitude,
                    donorProfile.longitude
                );
                withinRadius = distance <= request.radiusKm;
            }

            return {
                ...request,
                distance: distance ? Math.round(distance * 10) / 10 : null,
                withinRadius,
                hasResponded: request.responses.length > 0,
                userResponse: request.responses[0] || null
            };
        });

        const filteredRequests = requestsWithDistance.filter(r => r.withinRadius || r.distance === null);

        res.json({ success: true, data: filteredRequests });
    } catch (error) {
        console.error('Get Active Emergencies Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Respond to emergency request
export const respondToEmergency = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, estimatedArrival, notes } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const request = await prisma.emergencyRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }

        if (request.status !== EmergencyStatus.ACTIVE) {
            return res.status(400).json({ message: 'This emergency request is no longer active' });
        }

        const response = await prisma.emergencyResponse.upsert({
            where: {
                requestId_donorId: {
                    requestId: id,
                    donorId: userId
                }
            },
            update: {
                status,
                estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
                notes
            },
            create: {
                requestId: id,
                donorId: userId,
                status,
                estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
                notes
            },
            include: {
                donor: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        // Notify Organization Admins if accepted
        if (status === 'ACCEPTED') {
            try {
                // Find admins for this organization
                const orgAdmins = await prisma.adminProfile.findMany({
                    where: { organizationId: request.organizationId },
                    include: { user: true }
                });

                const notificationMessage = `✅ IMPACT: ${response.donor.name} accepted your emergency request for ${request.bloodGroup.replace('_', ' ')} blood! Arrival by: ${estimatedArrival ? new Date(estimatedArrival).toLocaleTimeString() : 'ASAP'}`;

                // Create notifications for each admin
                const adminNotifications = orgAdmins.map(admin => {
                    // Send socket notification
                    sendNotification(admin.userId, 'EMERGENCY_RESPONSE', {
                        message: notificationMessage,
                        requestId: id,
                        donorId: userId,
                        response: response
                    });

                    return prisma.notification.create({
                        data: {
                            userId: admin.userId,
                            type: 'EMERGENCY', // ORG_UPDATE or similar if available, keeping EMERGENCY for high visibility
                            message: notificationMessage,
                            read: false
                        }
                    });
                });

                await Promise.all(adminNotifications);
            } catch (error) {
                console.error('Failed to notify org admins:', error);
            }
        }

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Respond to Emergency Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get organization's emergency requests
export const getMyEmergencyRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId ?? undefined;
        }

        if (!organizationId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const requests = await prisma.emergencyRequest.findMany({
            where: { organizationId: organizationId as string },
            include: {
                responses: {
                    include: {
                        donor: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                email: true,
                                donorProfile: {
                                    select: {
                                        bloodGroup: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        responses: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Get My Emergency Requests Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update emergency request status
export const updateEmergencyStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId ?? undefined;
        }

        const request = await prisma.emergencyRequest.findUnique({
            where: { id }
        });

        if (!request || !organizationId || request.organizationId !== organizationId) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }

        const updatedRequest = await prisma.emergencyRequest.update({
            where: { id },
            data: { status },
            include: {
                responses: {
                    include: {
                        donor: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        res.json({ success: true, data: updatedRequest });
    } catch (error) {
        console.error('Update Emergency Status Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Re-broadcast emergency request to eligible donors
export const rebroadcastEmergency = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId ?? undefined;
        }

        const request = await prisma.emergencyRequest.findUnique({ where: { id } });

        if (!request || !organizationId || request.organizationId !== organizationId) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }

        if (request.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Can only re-broadcast active requests' });
        }

        const eligibleDonors = await findEligibleDonors(
            request.bloodGroup,
            request.latitude,
            request.longitude,
            request.radiusKm
        );

        const notificationPromises = eligibleDonors.map(donor => {
            const message = `🚨 REMINDER: ${request.bloodGroup.replace('_', ' ')} Blood Still Needed! ${request.unitsNeeded} units at ${request.hospitalName || request.location}. Distance: ~${Math.round(donor.distance)}km. Contact: ${request.contactPerson} (${request.contactPhone})`;

            // Send socket notification immediately
            sendNotification(donor.user.id, 'EMERGENCY', {
                message,
                emergencyId: request.id
            });

            return prisma.notification.create({
                data: {
                    userId: donor.user.id,
                    type: 'EMERGENCY',
                    message,
                    read: false
                }
            });
        });

        await Promise.all(notificationPromises);

        // Optional: Send SMS again if enabled
        if (eligibleDonors.length > 0 && process.env.ENABLE_SMS === 'true') {
            try {
                const smsPromises = eligibleDonors.slice(0, 5).map(async (donor) => {
                    if (!donor.user.phone) return;

                    const message = `🚨 REMINDER: URGENT BLOOD NEEDED\nType: ${request.bloodGroup.replace('_', ' ')}\nUnits: ${request.unitsNeeded}\nLocation: ${request.hospitalName || request.location}\nDistance: ~${Math.round(donor.distance)}km\nContact: ${request.contactPerson}\n${request.contactPhone}`;

                    await fetch('https://textbelt.com/text', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: donor.user.phone,
                            message: message,
                            key: process.env.TEXTBELT_API_KEY || 'textbelt'
                        })
                    });
                });

                await Promise.allSettled(smsPromises);
            } catch (error) {
                console.error('SMS re-broadcast failed:', error);
            }
        }

        res.json({
            success: true,
            message: 'Emergency request re-broadcasted successfully',
            notificationsSent: eligibleDonors.length
        });
    } catch (error) {
        console.error('Re-broadcast Emergency Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
