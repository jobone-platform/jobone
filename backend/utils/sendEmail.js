import axios from 'axios';

const sendEmail = async (options) => {
  const brevoUrl = 'https://api.brevo.com/v3/smtp/email';

  const data = {
    sender: {
      name: 'JobOne ATS', // Updated to your new branding
      email: process.env.EMAIL_USERNAME // Must match your verified Brevo sender email
    },
    to: [
      {
        email: options.email,
      }
    ],
    subject: options.subject,
    // FACT: Prioritizes the rich HTML from the ATS, but safely falls back to standard text for your OTPs
    htmlContent: options.html || `<p>${options.message}</p>`, 
  };

  try {
    const res = await axios.post(brevoUrl, data, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log("Brevo Email Sent Successfully, Status:", res.status); 
  } catch (error) {
    console.error("FULL BREVO ERROR:", JSON.stringify(error.response?.data || error.message, null, 2));
    throw new Error('Email failed');
  }
};

export default sendEmail;