import twilio from 'twilio';

// Initialize Twilio client if credentials are provided
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

/**
 * Sends an SMS message using either Twilio (preferred) or Textbelt (fallback).
 * @param to The recipient's phone number (must be in E.164 format, e.g., +1234567890)
 * @param message The text message to send
 * @returns A promise that resolves when the message is successfully sent
 */
export const sendSMS = async (to: string, message: string): Promise<void> => {
    if (process.env.ENABLE_SMS !== 'true') {
        console.log(`[SMS Disabled] Would have sent to ${to}: ${message}`);
        return;
    }

    if (!to) {
        console.warn('[SMS Warning] Cannot send SMS to an empty phone number.');
        return;
    }

    try {
        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            // Use Twilio
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });
            console.log(`[Twilio] SMS sent successfully to ${to}`);
        } else {
            // Fallback to Textbelt
            const response = await fetch('https://textbelt.com/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: to,
                    message: message,
                    key: process.env.TEXTBELT_API_KEY || 'textbelt'
                })
            });

            const data = await response.json() as { success: boolean; error?: string };
            if (data.success) {
                console.log(`[Textbelt] SMS sent successfully to ${to}`);
            } else {
                console.warn(`[Textbelt] SMS sending failed for ${to}:`, data.error);
                throw new Error(data.error || 'Textbelt failed to send SMS');
            }
        }
    } catch (error) {
        console.error(`[SMS Error] Failed to send SMS to ${to}:`, error);
        throw error;
    }
};
