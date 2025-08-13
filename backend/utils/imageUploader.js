const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expenses");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch,
});

async function uploadImagesToDropbox(images) {
    const urls = [];
  
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