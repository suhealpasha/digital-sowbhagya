const fetch = require("node-fetch");

async function getAccessTokenFromRefreshToken(refreshToken) {
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.DROPBOX_APP_KEY,
      client_secret: process.env.DROPBOX_APP_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Failed to refresh token: " + errorText);
  }

  const data = await response.json();
  return data.access_token;
}

module.exports = { getAccessTokenFromRefreshToken };
