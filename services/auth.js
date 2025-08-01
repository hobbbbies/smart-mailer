// routes/auth.js
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_LOCAL
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

router.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  res.redirect(authUrl);
});

router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code); // exchange code for tokens
    oauth2Client.setCredentials(tokens);

    // ⚠️ Save the tokens somewhere (DB or encrypted local file)
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    res.send('✅ Authentication successful. You can now send email.');
  } catch (err) {
    console.error('Error getting tokens:', err);
    res.status(500).send('❌ Failed to authenticate');
  }
});


module.exports = router;
