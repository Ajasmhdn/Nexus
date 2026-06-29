import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<void> {
  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to:      email,
    subject: "Nexus-Admin — Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2>Password Reset</h2>
        <p>Your one-time password reset code is:</p>
        <h1 style="letter-spacing:8px;color:#7c3aed">${otp}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}
