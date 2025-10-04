// routes/dropbox.js

const express = require('express');
const fetch = require('isomorphic-fetch');
const verifyToken = require("./token-verify");
const router = express.Router();

const {
  DROPBOX_APP_KEY,
  DROPBOX_APP_SECRET,
  DROPBOX_REDIRECT_URI,
} = process.env;

let savedRefreshToken = null;

router.get('/dropbox/auth', (req, res) => {
  const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${DROPBOX_APP_KEY}&token_access_type=offline&redirect_uri=${DROPBOX_REDIRECT_URI}`;
  res.redirect(authUrl);
});

router.get('/dropbox/callback', verifyToken, async (req, res) => {
  const { code } = req.query;

  try {
    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (data.refresh_token) {
      savedRefreshToken = data.refresh_token;
      console.log('✅ Refresh token stored.', savedRefreshToken);
    }

    res.send('Dropbox connected successfully. You can close this window.');
  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Dropbox auth failed.');
  }
});

router.get('/dropbox/token', verifyToken, async (req, res) => {
  if (!savedRefreshToken) {
    return res.status(400).send('Refresh token not found.');
  }

  try {
    const tokenRes = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: savedRefreshToken,
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();
    res.json({ access_token: tokenData.access_token });
  } catch (err) {
    res.status(500).send('Failed to refresh token.');
  }
});

module.exports = { dropboxRouter: router, getRefreshToken: () => savedRefreshToken };
