// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
//   // 1. Create a transporter using explicit host and port for better control
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com', // Explicitly set Gmail's SMTP server
//     port: 587,              // Use port 587 for TLS
//     secure: false,          // false for 587, true for 465
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // Optional: Add this if you still get certificate errors, 
//     // but try without it first as it lowers security slightly.
//     tls: {
//        rejectUnauthorized: false
//     }
//   });

//   // 2. Define email options
//   const mailOptions = {
//     from: '"Adore Job Portal" <noreply@adorejobportal.com>', // Make this look professional
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3. Send email
//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;











import axios from 'axios';

const sendEmail = async (options) => {
  const brevoUrl = 'https://api.brevo.com/v3/smtp/email';

  const data = {
    sender: {
      name: 'Adore Job Portal',
      email: process.env.EMAIL_USERNAME // MUST be rawalkundan987@gmail.com
    },
    to: [
      {
        email: options.email,
      }
    ],
    subject: options.subject,
    htmlContent: `<p>${options.message}</p>`, // Changed to htmlContent for better compatibility
  };

  try {
    const res = await axios.post(brevoUrl, data, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log("Brevo response:", res.status); // Log success status
  } catch (error) {
    // THIS IS CRITICAL FOR DEBUGGING
    console.error("FULL BREVO ERROR:", JSON.stringify(error.response?.data || error.message, null, 2));
    throw new Error('Email failed');
  }
};

export default sendEmail;