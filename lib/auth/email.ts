import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verify your email - Odilon",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #483434;">Welcome to Odilon</h1>
        <p style="color: #6B4F4F;">Please verify your email address to complete your registration.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #E7D4B5; color: #483434; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        <p style="color: #6B4F4F; font-size: 14px; margin-top: 24px;">If the button doesn't work, copy and paste this link: <br /> ${verifyUrl}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your password - Odilon",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #483434;">Reset Password</h1>
        <p style="color: #6B4F4F;">We received a request to reset your password. Click the button below to set a new one.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #E7D4B5; color: #483434; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        <p style="color: #6B4F4F; font-size: 14px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #6B4F4F; font-size: 14px;">The link will expire in 1 hour.</p>
      </div>
    `,
  });
}
