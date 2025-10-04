const axios = require("axios");
const qs = require("querystring");

const getDropboxAccessToken = async () => {
  const data = {
    grant_type: "refresh_token",
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
    client_id: process.env.DROPBOX_CLIENT_ID,
    client_secret: process.env.DROPBOX_CLIENT_SECRET,
  };

  const response = await axios.post(
    "https://api.dropbox.com/oauth2/token",
    qs.stringify(data),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};