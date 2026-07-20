const nodemailer = require('nodemailer');
require('dotenv').config();

async function test() {
  console.log("Testing email with user:", process.env.SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Mawidoc" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log("Success! Email sent. Info:", info);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

test();
