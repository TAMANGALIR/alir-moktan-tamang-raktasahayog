import nodemailer from 'nodemailer';

// Create a transporter
// For production, use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'tamangalir@gmail.com',
        pass: process.env.SMTP_PASS || 'yrwsrwkhqkwizmf'
    }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const fromUser = process.env.SMTP_USER || 'tamangalir@gmail.com';

        await transporter.sendMail({
            from: `Raktasahayog Admin <${fromUser}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent successfully.');
        return true;
    } catch (error) {
        console.error('Email send failed:', error);

        // Fallback to Mock Log if actual send fails
        console.log('--- MOCK EMAIL FALLBACK ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('Body:', html);
        console.log('---------------------------');

        return false;
    }
};

export const sendRejectionEmail = async (to: string, orgName: string, reason: string) => {
    const subject = 'Organization Registration Status - Raktasahayog';
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Organization Registration Update</h2>
            <p>Dear ${orgName},</p>
            <p>Thank you for your interest in joining Raktasahayog.</p>
            <p>We regret to inform you that your application for organization verification has been <strong style="color: red;">REJECTED</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you believe this is a mistake or if you have rectified the issues, please correct your details and re-apply or contact support.</p>
            <br>
            <p>Best Regards,</p>
            <p>The Raktasahayog Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};
