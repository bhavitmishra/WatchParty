import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export async function sendOtpEmail(email: string, otp: string | number) {
  return brevo.transactionalEmails.sendTransacEmail({
    subject: 'OTP for Authentication!',
    htmlContent: `<html><body><p>Hello,</p><p>This is your otp. OTP - ${otp}</p></body></html>`,
    sender: { name: 'Bhavit Mishra', email: 'projects.bhavit@gmail.com' },
    to: [{ email, name: 'Bhavit Mishra' }],
  });
}
