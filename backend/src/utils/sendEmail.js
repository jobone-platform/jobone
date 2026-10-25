import axios from 'axios';

/**
 * Brevo Email Dispatcher for JobOne ATS
 * 
 * Uses Brevo REST API v3: https://api.brevo.com/v3/smtp/email
 * Authenticates using `process.env.BREVO_API_KEY`
 * Sender configured from `process.env.EMAIL_USERNAME`
 */
const sendEmail = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.EMAIL_USERNAME?.trim();

  // Log configuration status without leaking secret keys
  console.log(`[Brevo Email Engine] BREVO_API_KEY configured: ${Boolean(brevoApiKey)}`);
  console.log(`[Brevo Email Engine] EMAIL_USERNAME configured: ${Boolean(senderEmail)}`);

  if (!brevoApiKey || !senderEmail) {
    const missing = [];
    if (!brevoApiKey) missing.push('BREVO_API_KEY');
    if (!senderEmail) missing.push('EMAIL_USERNAME');
    console.error(`[Brevo Email Engine] Missing required configuration: ${missing.join(', ')}`);
    throw new Error(`Email service is not configured. Missing: ${missing.join(', ')}`);
  }

  const brevoUrl = 'https://api.brevo.com/v3/smtp/email';

  // Construct styled HTML content for standard OTP messages if raw HTML not provided
  let htmlContent = options.html;
  if (!htmlContent) {
    htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">JobOne ATS</h1>
          <p style="color: #64748b; margin-top: 4px; font-size: 14px;">Next-Generation Hiring & Career Portal</p>
        </div>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #edf2f7;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155;">${options.message}</p>
        </div>
        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automated security email from JobOne ATS. Please do not reply directly to this email.
        </p>
      </div>
    `;
  }

  const data = {
    sender: {
      name: 'JobOne ATS',
      email: senderEmail,
    },
    to: [
      {
        email: options.email?.trim(),
      },
    ],
    subject: options.subject,
    htmlContent,
  };

  try {
    const res = await axios.post(brevoUrl, data, {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
    });
    console.log(`[Brevo Email Engine] Email sent successfully. HTTP Status: ${res.status}`);
    return res.data;
  } catch (error) {
    const status = error.response?.status;
    const responseData = error.response?.data;
    console.error(`[Brevo Email Engine] Brevo HTTP Error Status: ${status || 'Network/Timeout'}`);
    console.error(`[Brevo Email Engine] Brevo Error Body:`, JSON.stringify(responseData || error.message, null, 2));

    const errorMessage = responseData?.message || error.message || 'Brevo API request failed';
    throw new Error(`Email delivery failed: ${errorMessage}`);
  }
};

export default sendEmail;