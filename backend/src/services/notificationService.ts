import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface PriceDropAlertOptions {
  email: string;
  productTitle: string;
  currentPrice: number;
  alertPrice: number;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendPriceDropAlert(options: PriceDropAlertOptions): Promise<void> {
  const { email, productTitle, currentPrice, alertPrice } = options;
  const transporter = createTransporter();

  const savings = alertPrice - currentPrice;
  const savingsPct = Math.round((savings / alertPrice) * 100);

  await transporter.sendMail({
    from: `"PriceTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Price Drop: ${productTitle}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">Price Drop Alert!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:16px;">Great news — the price has hit your target.</p>
          </td>
        </tr>
        <!-- Product -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 24px;color:#111827;font-size:20px;font-weight:600;">${productTitle}</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fef2f2;border-radius:8px;padding:20px;text-align:center;width:48%;">
                  <p style="margin:0;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:.05em;">Your Target</p>
                  <p style="margin:8px 0 0;color:#ef4444;font-size:28px;font-weight:700;">₹${alertPrice.toLocaleString('en-IN')}</p>
                </td>
                <td width="4%"></td>
                <td style="background:#f0fdf4;border-radius:8px;padding:20px;text-align:center;width:48%;">
                  <p style="margin:0;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:.05em;">Current Price</p>
                  <p style="margin:8px 0 0;color:#16a34a;font-size:28px;font-weight:700;">₹${currentPrice.toLocaleString('en-IN')}</p>
                </td>
              </tr>
            </table>
            <div style="margin-top:20px;background:#eff6ff;border-radius:8px;padding:16px;text-align:center;">
              <p style="margin:0;color:#1d4ed8;font-size:16px;font-weight:600;">You save ₹${savings.toLocaleString('en-IN')} (${savingsPct}% off)</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              You received this because you set a price alert on PriceTrack.<br>
              Manage your alerts in the PriceTrack dashboard.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  console.log(`[Notification] Price drop alert sent to ${email} for "${productTitle}"`);
}
