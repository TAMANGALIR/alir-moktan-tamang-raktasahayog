import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIO } from '../utils/socket.utils';
import { sendEmail } from '../utils/email.utils';


const prisma = new PrismaClient();

// Create a new appointment
export const createAppointment = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { scheduledAt, organizationId } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!scheduledAt || !organizationId) {
            res.status(400).json({ success: false, error: 'Scheduled date and Organization are required' });
            return;
        }

        const appointmentDate = new Date(scheduledAt);
        if (appointmentDate < new Date()) {
            res.status(400).json({ success: false, error: 'Cannot book appointment in the past' });
            return;
        }

        // --- CHECK ACTIVE APPOINTMENTS ---
        const activeAppointment = await prisma.appointment.findFirst({
            where: {
                userId,
                status: { in: ['PENDING', 'APPROVED'] },
                scheduledAt: { gte: new Date() } // Only future appointments matter
            }
        });

        if (activeAppointment) {
            res.status(400).json({
                success: false,
                error: 'You already have an active appointment. Please complete or cancel it first.'
            });
            return;
        }


        // --- ELIGIBILITY CHECK ---
        const donorProfile = await prisma.donorProfile.findUnique({
            where: { userId }
        });

        if (!donorProfile) {
            res.status(403).json({ success: false, error: 'Please update your donor profile first.' });
            return;
        }

        const reasons: string[] = [];

        // 1. Weight Check
        if (donorProfile.weight && donorProfile.weight < 50) {
            reasons.push('Underweight (must be > 50kg)');
        }

        // 2. Age Check
        if (donorProfile.dateOfBirth) {
            const dob = new Date(donorProfile.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (age < 18 || age > 65) {
                reasons.push(`Age ${age} is not within eligible range (18-65)`);
            }
        } else {
            reasons.push('Date of birth missing in profile');
        }

        // 3. Disease Check
        if (donorProfile.hasDiseases) {
            reasons.push('Medical conditions present');
        }

        // 4. Donation Gap Check (56 Days)
        if (donorProfile.lastDonationDate) {
            const lastDonation = new Date(donorProfile.lastDonationDate);
            const nextEligible = new Date(lastDonation);
            nextEligible.setDate(lastDonation.getDate() + 56);

            if (appointmentDate < nextEligible) {
                reasons.push(`Next eligible donation date is ${nextEligible.toDateString()}`);
            }
        }

        if (reasons.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Eligibility check failed',
                reasons
            });
            return;
        }
        // -------------------------

        const appointment = await prisma.appointment.create({
            data: {
                userId,
                organizationId,
                scheduledAt: appointmentDate,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: { name: true, email: true, phone: true, donorProfile: { select: { bloodGroup: true } } }
                },
                organization: true
            }
        });

        // --- REAL-TIME NOTIFICATIONS ---
        const io = getIO();
        if (organizationId) {
            io.to(`ORG_${organizationId}`).emit('appointment_created', appointment);
        }

        res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};


// Get my appointments
export const getMyAppointments = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                organization: {
                    select: { name: true, location: true }
                }
            },
            orderBy: { scheduledAt: 'desc' }
        });

        res.json({ success: true, data: appointments });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get Booking Options (Verified Orgs)
export const getBookingOptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizations = await prisma.organization.findMany({
            where: { status: 'VERIFIED' },
            select: { id: true, name: true, location: true, type: true }
        });
        res.json({ success: true, data: organizations });
    } catch (error) {
        console.error('Get booking options error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Update status (Cancel/Reschedule)
export const updateAppointmentStatus = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, scheduledAt } = req.body;
        const userId = req.user?.id;

        // Verify ownership or Admin/Org role
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                organization: true,
                user: {
                    include: { donorProfile: true }
                }
            }
        });

        if (!appointment) {
            res.status(404).json({ success: false, error: 'Appointment not found' });
            return;
        }

        const isOwner = appointment.userId === userId;
        const isAdmin = req.user.role === 'ADMIN';
        const isOrg = req.user.role === 'ORGANIZATION' && appointment.organizationId === req.user.organizationId;


        if (!isOwner && !isAdmin && !isOrg) {
            res.status(403).json({ success: false, error: 'Unauthorized' });
            return;
        }

        // Specific checks for cancellation
        if (isOwner && status !== 'CANCELED') {
            res.status(403).json({ success: false, error: 'Users can only cancel appointments' });
            return;
        }

        // Prepare update data
        const updateData: any = { status };
        if (scheduledAt) {
            updateData.scheduledAt = new Date(scheduledAt);
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: { organization: true }
        });



        // --- POST-UPDATE ACTIONS ---


        // Helper: Calculate Badge based on donation count
        const calculateBadge = (count: number) => {
            if (count >= 25) return 'DIAMOND';
            if (count >= 10) return 'PLATINUM';
            if (count >= 5) return 'GOLD';
            if (count >= 3) return 'SILVER';
            if (count >= 1) return 'BRONZE';
            return 'NORMAL';
        };

        // ... inside updateAppointmentStatus ...

        // 1. COMPLETED: Update Donor Stats + Email + STOCK UPDATE
        if (status === 'COMPLETED') {
            const donorProfile = appointment.user.donorProfile;

            // A. Update Donor Stats
            if (donorProfile) {
                const newCount = donorProfile.totalDonations + 1;
                const newBadge = calculateBadge(newCount);

                await prisma.donorProfile.update({
                    where: { userId: appointment.userId },
                    data: {
                        lastDonationDate: new Date(),
                        totalDonations: { increment: 1 },
                        badge: newBadge as any // Cast to any until Client regenerates fully
                    }
                });
            }

            // B. Update Blood Inventory (Stock)
            if (donorProfile?.bloodGroup && appointment.organizationId) {
                // Upsert Inventory
                const inventory = await prisma.bloodInventory.findFirst({
                    where: {
                        organizationId: appointment.organizationId,
                        bloodGroup: donorProfile.bloodGroup
                    }
                });

                if (inventory) {
                    await prisma.bloodInventory.update({
                        where: { id: inventory.id },
                        data: { quantity: { increment: 1 } }
                    });
                } else {
                    await prisma.bloodInventory.create({
                        data: {
                            organizationId: appointment.organizationId,
                            bloodGroup: donorProfile.bloodGroup,
                            quantity: 1,
                            location: appointment.organization?.location || 'Main Branch',
                            expiryDate: new Date(new Date().setDate(new Date().getDate() + 42)) // ~42 days shelf life
                        }
                    });
                }

                // C. Log Blood Unit
                await prisma.bloodUnit.create({
                    data: {
                        donorId: appointment.userId,
                        organizationId: appointment.organizationId,
                        bloodGroup: donorProfile.bloodGroup,
                        status: 'AVAILABLE',
                        expiryDate: new Date(new Date().setDate(new Date().getDate() + 42))
                    }
                });

                // D. Create Donation History Record
                await prisma.donationHistory.create({
                    data: {
                        donorId: donorProfile.id, // linked to donorProfile, not user directly causing possible mismatch if not careful, schema says donorId references DonorProfile.id
                        date: new Date(),
                        livesSaved: 0 // Initially 0, updated when used? Or default 1? Schema says default 1. Let's use default or 1.
                    }
                });
            }

            await sendEmail(
                appointment.user.email,
                'Thank You for Your Donation - Raktasahayog',
                `<p>Dear ${appointment.user.name},</p>
                 <p>Thank you for completing your blood donation appointment at <strong>${appointment.organization?.name || 'our center'}</strong>.</p>
                 <p>Your donation saves lives! Your donor profile has been updated.</p>
                 <p>Total Donations: <strong>+1</strong></p>`
            );
        }

        // 2. CANCELED: Email
        if (status === 'CANCELED') {
            await sendEmail(
                appointment.user.email,
                'Appointment Canceled - Raktasahayog',
                `<p>Dear ${appointment.user.name},</p>
                 <p>Your appointment scheduled for <strong>${new Date(appointment.scheduledAt).toDateString()}</strong> has been canceled.</p>
                 <p>If you did not request this, please contact support.</p>`
            );
        }

        // 3. REJECTED: Email
        if (status === 'REJECTED') {
            await sendEmail(
                appointment.user.email,
                'Appointment Request Rejected - Raktasahayog',
                `<p>Dear ${appointment.user.name},</p>
                 <p>Unfortunately, your appointment request at <strong>${appointment.organization?.name}</strong> has been rejected.</p>
                 <p>Please try booking another slot or a different center.</p>`
            );
        }

        // 4. APPROVED / RESCHEDULED: Email
        if (status === 'APPROVED' || status === 'RESCHEDULED') {
            const timeString = new Date(updated.scheduledAt).toLocaleString();
            const title = status === 'RESCHEDULED' ? 'Appointment Rescheduled - Raktasahayog' : 'Appointment Confirmed - Raktasahayog';

            await sendEmail(
                appointment.user.email,
                title,
                `<p>Dear ${appointment.user.name},</p>
                <p>Your appointment at <strong>${appointment.organization?.name}</strong> is confirmed for:</p>
                <h3>${timeString}</h3>
                <p>Please arrive 10 minutes early.</p>`
            );
        }

        // --- REAL-TIME NOTIFICATIONS ---
        const io = getIO();

        // Notify User
        if (!isOwner) {
            io.to(appointment.userId).emit('appointment_updated', updated);
        }

        // Notify Organization
        if (appointment.organizationId) {
            io.to(`ORG_${appointment.organizationId}`).emit('appointment_updated', updated);
        }

        res.json({ success: true, data: updated, message: 'Appointment updated' });

    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Get requests for Organization
export const getOrgAppointments = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const orgId = req.user?.organizationId;
        if (!orgId) {
            res.status(403).json({ success: false, error: 'Not an organization' });
            return;
        }

        const appointments = await prisma.appointment.findMany({
            where: { organizationId: orgId },
            include: {
                user: {
                    select: { name: true, email: true, phone: true, donorProfile: { select: { bloodGroup: true } } }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('Get org appointments error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
