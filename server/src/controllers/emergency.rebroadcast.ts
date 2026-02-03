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

        // Verify ownership and get request
        const request = await prisma.emergencyRequest.findUnique({
            where: { id }
        });

        if (!request || !organizationId || request.organizationId !== organizationId) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }

        if (request.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Can only re-broadcast active requests' });
        }

        // Find eligible donors again
        const eligibleDonors = await findEligibleDonors(
            request.bloodGroup,
            request.latitude,
            request.longitude,
            request.radiusKm
        );

        // Create new notifications for eligible donors
        const notificationPromises = eligibleDonors.map(donor =>
            prisma.notification.create({
                data: {
                    userId: donor.user.id,
                    type: 'EMERGENCY',
                    message: `🚨 REMINDER: ${request.bloodGroup.replace('_', ' ')} Blood Still Needed! ${request.unitsNeeded} units at ${request.hospitalName || request.location}. Distance: ~${Math.round(donor.distance)}km. Contact: ${request.contactPerson} (${request.contactPhone})`,
                    read: false
                }
            })
        );

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
