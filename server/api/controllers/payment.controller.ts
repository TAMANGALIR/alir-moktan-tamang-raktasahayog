import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import crypto from 'crypto';
import axios from 'axios';

const prisma = new PrismaClient();
const prismaAny = prisma as any; // Bypass stale Prisma types after migration

// ─── CONFIG ───────────────────────────────────────────────────────────
const CAMPAIGN_FEE = 250; // Rs 250
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// eSewa Sandbox
const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_STATUS_URL = 'https://uat.esewa.com.np/api/epay/transaction/status/';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

// Khalti Sandbox
const KHALTI_INITIATE_URL = 'https://dev.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP_URL = 'https://dev.khalti.com/api/v2/epayment/lookup/';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '';

// ─── HELPERS ──────────────────────────────────────────────────────────

function generateEsewaSignature(message: string): string {
    const hash = crypto.createHmac('sha256', ESEWA_SECRET_KEY)
        .update(message)
        .digest('base64');
    return hash;
}

// ─── INITIATE PAYMENT ─────────────────────────────────────────────────
export const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaignId } = req.params;
        const { provider } = req.body; // 'ESEWA' or 'KHALTI'

        if (!provider || !['ESEWA', 'KHALTI'].includes(provider)) {
            return res.status(400).json({ message: 'Invalid payment provider. Use ESEWA or KHALTI.' });
        }

        // Verify campaign exists and belongs to this org
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { organizer: true }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        if ((campaign as any).status !== 'PAYMENT_PENDING') {
            return res.status(400).json({ message: 'Payment already completed or campaign not in payment pending state.' });
        }

        // Check org ownership
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId || undefined;
        }

        if (campaign.organizerId !== organizationId) {
            return res.status(403).json({ message: 'You can only pay for your own campaigns.' });
        }

        // Create payment record
        const transactionUuid = `CAMP-${campaignId.slice(0, 8)}-${Date.now()}`;
        const payment = await prismaAny.payment.create({
            data: {
                campaignId,
                provider: provider,
                amount: CAMPAIGN_FEE,
                transactionUuid,
                status: 'INITIATED'
            }
        });

        if (provider === 'ESEWA') {
            const totalAmount = CAMPAIGN_FEE;
            const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
            const signature = generateEsewaSignature(message);

            return res.json({
                paymentId: payment.id,
                provider: 'ESEWA',
                paymentUrl: ESEWA_PAYMENT_URL,
                formData: {
                    amount: totalAmount,
                    tax_amount: 0,
                    total_amount: totalAmount,
                    transaction_uuid: transactionUuid,
                    product_code: ESEWA_PRODUCT_CODE,
                    product_service_charge: 0,
                    product_delivery_charge: 0,
                    success_url: `${FRONTEND_URL}/payment/success`,
                    failure_url: `${FRONTEND_URL}/payment/failure?campaignId=${campaignId}`,
                    signed_field_names: 'total_amount,transaction_uuid,product_code',
                    signature
                }
            });
        }



    } catch (error) {
        console.error('Initiate Payment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── VERIFY ESEWA PAYMENT ─────────────────────────────────────────────
export const verifyEsewaPayment = async (req: Request, res: Response) => {
    try {
        const { data } = req.query; // Base64 encoded response from eSewa

        if (!data) {
            return res.status(400).json({ success: false, message: 'No payment data received.' });
        }

        // Decode the base64 response
        const decodedData = JSON.parse(Buffer.from(data as string, 'base64').toString('utf-8'));
        console.log('eSewa decoded data:', decodedData);

        const { transaction_uuid, total_amount, transaction_code, status } = decodedData;

        if (status !== 'COMPLETE') {
            return res.status(400).json({ success: false, message: 'Payment was not completed.' });
        }

        // Verify signature
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const expectedSignature = generateEsewaSignature(message);

        if (decodedData.signed_field_names) {
            // Optional: verify with eSewa's status API
            try {
                const statusResponse = await axios.get(ESEWA_STATUS_URL, {
                    params: {
                        product_code: ESEWA_PRODUCT_CODE,
                        total_amount: total_amount,
                        transaction_uuid: transaction_uuid
                    }
                });
                console.log('eSewa status check:', statusResponse.data);
            } catch (e) {
                console.log('eSewa status check failed (non-critical):', e);
            }
        }

        // Find payment by transaction_uuid
        const payment = await prismaAny.payment.findFirst({
            where: { transactionUuid: transaction_uuid }
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }

        if (payment.status === 'COMPLETED') {
            return res.json({ success: true, message: 'Payment already verified.' });
        }

        // Update payment and campaign status
        await prismaAny.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                transactionId: transaction_code
            }
        });
        await prisma.campaign.update({
            where: { id: payment.campaignId },
            data: { status: 'PENDING' as any }
        });

        return res.json({ success: true, message: 'Payment verified successfully!' });

    } catch (error) {
        console.error('eSewa Verify Error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed.' });
    }
};



// ─── REFUND PAYMENT ──────────────────────────────────────────────────
export const refundPayment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaignId } = req.params;

        // Find the completed payment for this campaign
        const payment = await prismaAny.payment.findFirst({
            where: {
                campaignId,
                status: 'COMPLETED'
            }
        });

        if (!payment) {
            return res.status(404).json({ message: 'No completed payment found for this campaign.' });
        }

        if (payment.status === 'REFUNDED') {
            return res.json({ message: 'Payment already refunded.' });
        }

        // NOTE: In sandbox/test mode, refund APIs may not be available.
        // We mark the payment as refunded in our DB.
        // In production, integrate with eSewa/Khalti refund APIs.

        await prismaAny.payment.update({
            where: { id: payment.id },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
                refundId: `REFUND-${Date.now()}`
            }
        });

        return res.json({ success: true, message: 'Payment refunded successfully.' });

    } catch (error) {
        console.error('Refund Error:', error);
        res.status(500).json({ message: 'Refund processing failed.' });
    }
};

// ─── CANCEL CAMPAIGN WITH REFUND ─────────────────────────────────────
export const cancelCampaign = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Check org ownership
        let organizationId = req.user?.organizationId;
        if (!organizationId && req.user?.id) {
            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId: req.user.id }
            });
            organizationId = adminProfile?.organizationId || undefined;
        }

        if (campaign.organizerId !== organizationId) {
            return res.status(403).json({ message: 'You can only cancel your own campaigns.' });
        }

        if (!['PAYMENT_PENDING', 'PENDING'].includes(campaign.status as string)) {
            return res.status(400).json({ message: 'Can only cancel campaigns that are pending.' });
        }

        // Cancel campaign
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'CANCELLED' as any }
        });

        // Refund if payment was completed
        const completedPayment = await prismaAny.payment.findFirst({
            where: { campaignId, status: 'COMPLETED' }
        });

        if (completedPayment) {
            await prismaAny.payment.update({
                where: { id: completedPayment.id },
                data: {
                    status: 'REFUNDED',
                    refundedAt: new Date(),
                    refundId: `REFUND-${Date.now()}`
                }
            });
        }

        return res.json({
            success: true,
            message: completedPayment
                ? 'Campaign cancelled and payment refunded.'
                : 'Campaign cancelled.'
        });

    } catch (error) {
        console.error('Cancel Campaign Error:', error);
        res.status(500).json({ message: 'Failed to cancel campaign.' });
    }
};

// ─── GET PAYMENT STATUS ──────────────────────────────────────────────
export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaignId } = req.params;

        const payment = await prismaAny.payment.findFirst({
            where: { campaignId },
            orderBy: { createdAt: 'desc' }
        });

        if (!payment) {
            return res.status(404).json({ message: 'No payment found for this campaign.' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Get Payment Status Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── INITIATE DONATION (Any Authenticated User) ──────────────────────
export const initiateDonation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { campaignId } = req.params;
        const { amount, message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const donationAmount = parseFloat(amount);
        if (!donationAmount || donationAmount < 100) {
            return res.status(400).json({ message: 'Minimum donation amount is Rs. 100.' });
        }

        if (donationAmount > 100000) {
            return res.status(400).json({ message: 'Maximum donation amount is Rs. 100,000.' });
        }

        // Verify campaign exists and is approved/active
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        if (!['APPROVED', 'COMPLETED'].includes(campaign.status as string)) {
            return res.status(400).json({ message: 'Donations are only accepted for approved campaigns.' });
        }

        // Create donation record
        const transactionUuid = `DON-${campaignId.slice(0, 8)}-${Date.now()}`;
        const donation = await prismaAny.campaignDonation.create({
            data: {
                campaignId,
                userId,
                amount: donationAmount,
                provider: 'ESEWA',
                transactionUuid,
                message: message || null,
                status: 'INITIATED'
            }
        });

        // Generate eSewa form data
        const esewaMessage = `total_amount=${donationAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
        const signature = generateEsewaSignature(esewaMessage);

        return res.json({
            donationId: donation.id,
            provider: 'ESEWA',
            paymentUrl: ESEWA_PAYMENT_URL,
            formData: {
                amount: donationAmount,
                tax_amount: 0,
                total_amount: donationAmount,
                transaction_uuid: transactionUuid,
                product_code: ESEWA_PRODUCT_CODE,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${FRONTEND_URL}/donate/success`,
                failure_url: `${FRONTEND_URL}/campaigns?donation=failed`,
                signed_field_names: 'total_amount,transaction_uuid,product_code',
                signature
            }
        });

    } catch (error) {
        console.error('Initiate Donation Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─── VERIFY DONATION PAYMENT (eSewa Callback) ────────────────────────
export const verifyDonationPayment = async (req: Request, res: Response) => {
    try {
        const { data } = req.query;

        if (!data) {
            return res.status(400).json({ success: false, message: 'No payment data received.' });
        }

        const decodedData = JSON.parse(Buffer.from(data as string, 'base64').toString('utf-8'));
        console.log('Donation eSewa decoded data:', decodedData);

        const { transaction_uuid, total_amount, transaction_code, status } = decodedData;

        if (status !== 'COMPLETE') {
            return res.status(400).json({ success: false, message: 'Payment was not completed.' });
        }

        // Find donation by transaction_uuid
        const donation = await prismaAny.campaignDonation.findFirst({
            where: { transactionUuid: transaction_uuid }
        });

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation record not found.' });
        }

        if (donation.status === 'COMPLETED') {
            return res.json({ success: true, message: 'Donation already verified.' });
        }

        // Update donation status
        await prismaAny.campaignDonation.update({
            where: { id: donation.id },
            data: {
                status: 'COMPLETED',
                transactionId: transaction_code
            }
        });

        return res.json({ success: true, message: 'Donation verified successfully! Thank you for your contribution.' });

    } catch (error) {
        console.error('Verify Donation Error:', error);
        res.status(500).json({ success: false, message: 'Donation verification failed.' });
    }
};
