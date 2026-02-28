const nodemailer = require('nodemailer');

const getTransport = () => {
  const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendSignupOtpEmail = async ({ toEmail, otpCode, expiresInMinutes }) => {
  const transporter = getTransport();
  if (!transporter) {
    throw new Error('Email transport not configured (missing BREVO_SMTP_USER/BREVO_SMTP_PASS)');
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER;
  const fromName = process.env.BREVO_FROM_NAME || 'CareerPrep AI';
  const subject = 'Your CareerPrep AI signup OTP';

  const text = `Your OTP is: ${otpCode}. It expires in ${expiresInMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Verify your email</h2>
      <p style="margin: 0 0 8px;">Use this OTP to complete your signup:</p>
      <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${otpCode}</div>
      <p style="margin: 0; color: #475569;">This code expires in ${expiresInMinutes} minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const sendPasswordResetOtpEmail = async ({ toEmail, otpCode, expiresInMinutes }) => {
  const transporter = getTransport();
  if (!transporter) {
    throw new Error('Email transport not configured (missing BREVO_SMTP_USER/BREVO_SMTP_PASS)');
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER;
  const fromName = process.env.BREVO_FROM_NAME || 'CareerPrep AI';
  const subject = 'Your CareerPrep AI password reset OTP';

  const text = `Your password reset OTP is: ${otpCode}. It expires in ${expiresInMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Reset your password</h2>
      <p style="margin: 0 0 8px;">Use this OTP to reset your CareerPrep AI password:</p>
      <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${otpCode}</div>
      <p style="margin: 0; color: #475569;">This code expires in ${expiresInMinutes} minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendSignupOtpEmail,
  sendPasswordResetOtpEmail,
};
