const nodemailer = require('nodemailer');
require('dotenv').config();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { Resend } = require('resend');
const MailComposer = require('nodemailer/lib/mail-composer');

/** 
 * @desc Send email using Nodemailer and Mailgun SMTP (Not used in production)
 */
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
/**
 * @desc Send email using the Resend API (not used in production)
 */
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

/**
 * @desc Send email using the Gmail API with OAuth2 and optional base64 attachment
 */
async function sendEmailGmailApi(req, res) {
  try {
    const { sender, receiver, subject, body } = req.body;
    console.log('req.body: ', req.body);
    console.log('req.file: ', req.file);
    // const base64File = req.file.buffer.toString('base64');
    const attachmentsArray = req.file?.map((file) => {
        const base64File = file.buffer.toString('base64');
        return { 
            filename: file.originalname, 
            content: base64File, 
            encoding: 'base64' 
        };
    });

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

    // create RFC-2822 message
    let mail = new MailComposer(
        {
        to: receiver,
        text: body,
        subject: subject,
        textEncoding: "base64",
        attachments: attachmentsArray
        });

    // Turn into MIME format
    mail.compile().build((error, msg) => {
      if (error) {
        console.log('Error compiling email', error);
        return res.status(400).json({ success: false, message: `Error compiling email: ${error.message}` });
      }

      const encodedMessage = Buffer.from(msg)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      gmail.users.messages.send({
        userId: 'me',
        resource: { raw: encodedMessage }
      }, (err, result) => {
        if (err) {
          console.log('Error sending email', err);
          return res.status(400).json({ success: false, message: `Error sending email: ${err.message}` });
        }
        console.log('Sending email reply from server:', result.data);
        res.json({ success: true, messageId: result.data.id });
      });
    })
    // Create raw email
    // const messageParts = [
    //   `To: ${receiver}`,
    //   `Subject: ${subject}`,
    //   '',
    //   body
    // ];
    // const message = messageParts.join('\n');
    // const encodedMessage = Buffer.from(message)
    //   .toString('base64')
    //   .replace(/\+/g, '-')
    //   .replace(/\//g, '_')
    //   .replace(/=+$/, '');

    // const response = await gmail.users.messages.send({
    //   userId: 'me',
    //   requestBody: {
    //     raw: encodedMessage
    //   }
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: `Error sending email: ${error.message}` });
  }
}

module.exports = { sendEmailResendAPI, sendEmailGmailApi };

