const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expenses");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
async function createDropboxClient() {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  return new Dropbox({
    accessToken,
    fetch,
  });
}

async function uploadImagesToDropbox(images) {
  const urls = [];

  const dbx = await createDropboxClient(); 
  for (let img of images) {
    // Use multer buffer directly
    const buffer = img.buffer;
    const dropboxPath = `/expenses-bill/${Date.now()}-${img.originalname}`;

    const uploadRes = await dbx.filesUpload({
      path: dropboxPath,
      contents: buffer,
      mode: "overwrite",
    });

    let sharedLink;
    try {
      const sharedLinkRes = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadRes.result.path_lower,
      });
      sharedLink = sharedLinkRes.result.url;
    } catch (err) {
      const existingLinksRes = await dbx.sharingListSharedLinks({
        path: uploadRes.result.path_lower,
        direct_only: true,
      });
      sharedLink = existingLinksRes.result.links[0].url;
    }

    // Convert link to direct access
    if (sharedLink.includes("?dl=0")) {
      sharedLink = sharedLink.replace("?dl=0", "?raw=1");
    } else {
      sharedLink += "?raw=1";
    }

    urls.push(sharedLink);
  }

  return urls;
}

module.exports = { uploadImagesToDropbox };

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
