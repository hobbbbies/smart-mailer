const { google } = require('googleapis');
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const jwt = require('jsonwebtoken');
const getToken = require('../services/getToken'); 

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient()

const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT
);

// const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'openid', 'profile', 'email'];

router.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  console.log('hitting oauth2callback');
  try {
    const { tokens } = await oauth2Client.getToken(code); // exchange code for tokens
    oauth2Client.setCredentials(tokens);

    const grantedScopes = tokens.scope?.split(' ') || [];
    if (!grantedScopes.includes('https://www.googleapis.com/auth/gmail.send')) {
      res.redirect(`${process.env.FRONTEND_URL}/?denied=true`)
    }
    const idToken = jwt.decode(tokens.id_token);

    // For development: store refresh token with id '1' and placeholder email
    if (tokens.refresh_token) {
      await prisma.oAuthToken.upsert({
        where: { email: idToken?.email},
        update: { refreshToken: tokens.refresh_token, email: idToken?.email },
        create: {
          googleId: idToken?.sub,
          email: idToken?.email,
          refreshToken: tokens.refresh_token,
        },
      });
      console.log('Refresh token saved to DB for dev user.');
    } else {
      console.warn('Missing refresh_token. Not saving to DB.');
    }
    res.redirect(`${process.env.FRONTEND_URL}/?token=${tokens.id_token}`);
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.status(500).send('❌ Failed to authenticate');
  }
});

router.get('/validate-token', getToken);

module.exports = router;
