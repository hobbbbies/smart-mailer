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
    console.log('tokeNNN: ', tokenRecord.refreshToken);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'stefankvitanov@gmail.com',
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: tokenRecord.refreshToken
      }
    });

    const mailOptions = {
      from: `${senderName} <stefankvitanov@gmail.com>`,
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

const { google } = require('googleapis');

async function sendEmailGmailApi(req, res) {
  try {
    const { sender, receiver, subject, body } = req.body;
    // Fetch refresh token from DB (dev: id '1')
    const tokenRecord = await prisma.oAuthToken.findUnique({ where: { email: sender } });
    if (!tokenRecord || !tokenRecord.refreshToken) {
      return res.status(500).json({ success: false, message: 'No refresh token found in DB.' });
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_LOCAL
    );
    oauth2Client.setCredentials({ refresh_token: tokenRecord.refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create raw email
    const messageParts = [
      `To: ${receiver}`,
      `Subject: ${subject}`,
      '',
      body
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    res.json({ success: true, messageId: response.data.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Error sending email: ${error.message}` });
  }
}

module.exports = { sendEmail, sendEmailGmailApi };

