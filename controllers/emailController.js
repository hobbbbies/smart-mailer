const nodemailer = require('nodemailer');
require('dotenv').config();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { Resend } = require('resend');

async function sendEmailThirdParty(req, res) {
  try {
    const { senderName, sender, receiver, subject, body } = req.body;
    const transporter = nodemailer.createTransport({
        service:  'Mailgun',
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
      from: `${senderName} <${process.env.EMAIL_USER}> <${sender}>`,
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

// Need a domain for this shit, not using it. 
async function sendEmailResendAPI(req, res) {
    try {
        const resend = new Resend;
        const { senderName, sender, receiver, subject, body } = req.body;
        const { data, error } = await resend.emails.send({
            from: `${senderName} <onboarding@resend.dev>`,
            to: receiver,
            subject,
            html: '<p>Testing 123</p>'
        })
        if (error) {
            console.log(error);
            return res.status(400).json({ success: false, message: `Error sending email: ${error.message}` });
        }
        console.log(data);
        console.log('to: ', receiver);
        res.json({ success: true, messageId: data });
    } catch(error) {
        res.status(500).json({ success: false, message: `Error sending email: ${error.message}` });
    }
}

const { google } = require('googleapis');

async function sendEmailGmailApi(req, res) {
  try {
    const { sender, receiver, subject, body } = req.body;

    // Fetch refresh token
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

module.exports = { sendEmailResendAPI, sendEmailGmailApi };

