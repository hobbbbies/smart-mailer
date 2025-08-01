const nodemailer = require('nodemailer');
require('dotenv').config();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function sendEmail(req, res) {
  try {
    const { senderName, sender, receiver, subject, body } = req.body;
    // Fetch refresh token from DB (dev: id '1')
    const tokenRecord = await prisma.oAuthToken.findUnique({ where: { id: '1' } });
    if (!tokenRecord || !tokenRecord.refreshToken) {
      return res.status(500).json({ success: false, message: 'No refresh token found in DB.' });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'stefankvitanov@gmail.com',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: tokenRecord.refreshToken
      }
    });

    const mailOptions = {
      from: `${senderName} <${process.env.EMAIL_USER}>`,
      to: receiver,
      subject,
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error sending email: ${error.message}` });
  }
}

module.exports = { sendEmail };
