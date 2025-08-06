const PDFDocument = require("pdfkit");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch,
});

async function generateGSTBillPDF(booking) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          
          const dropboxPath = `/GST_Bill_${booking._id}.pdf`;

          // Upload PDF to Dropbox
          const uploadRes = await dbx.filesUpload({
            path: dropboxPath,
            contents: pdfBuffer,
            mode: "overwrite",
          });

          const filePath = uploadRes.result.path_lower;

          // Try creating a permanent shared link
          let sharedLink;

          try {
            const sharedLinkRes = await dbx.sharingCreateSharedLinkWithSettings({
              path: filePath,
            });

            sharedLink = sharedLinkRes.result.url;
          } catch (err) {
            if (
              err?.error?.error_shared_link_already_exists ||
              err?.error?.['.tag'] === 'shared_link_already_exists'
            ) {
              // If a shared link already exists, get it
              const existingLinksRes = await dbx.sharingListSharedLinks({
                path: filePath,
                direct_only: true,
              });

              if (existingLinksRes.result.links.length > 0) {
                sharedLink = existingLinksRes.result.links[0].url;
              } else {
                throw new Error("Shared link already exists but not found.");
              }
            } else {
              console.error("Error creating shared link:", err);
              reject(err);
              return;
            }
          }

          // Convert Dropbox shared link to direct PDF view
          if (sharedLink.includes("?dl=0")) {
            sharedLink = sharedLink.replace("?dl=0", "?raw=1");
          } else {
            sharedLink += "?raw=1";
          }

          resolve(sharedLink);
        } catch (uploadErr) {
          console.error("Error uploading or generating link:", uploadErr);
          reject(uploadErr);
        }
      });

      // === Add PDF Content ===
      doc.fontSize(22).text("GST Invoice", { align: "center", underline: true });
      doc.moveDown(1.5);

      doc.fontSize(12).text(`Invoice Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Name: ${booking.name}`);
      doc.text(`Phone: ${booking.phone}`);
      if (booking.address) doc.text(`Address: ${booking.address}`);
      doc.text(`Event: ${booking.event_type}`);
      doc.text(`Date: ${booking.date}`);
      doc.text(`Timings: ${booking.timings}`);
      doc.moveDown();

      const selectedServices = Object.entries(booking.services || {}).filter(([_, v]) => v);
      if (selectedServices.length === 0) {
        doc.text("No additional services selected.");
      } else {
        selectedServices.forEach(([service]) => {
          doc.text(`• ${service.replace(/([A-Z])/g, " $1")}`);
        });
      }

      doc.moveDown();
      doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).text("Billing Summary", { underline: true });
      doc.moveDown(0.5);

      const {
        baseCost = 0,
        gstAmount = 0,
        totalCost = 0,
        generatorHours = 0,
        unitUsed = 0,
        discount = 0,
        cost = 0,
        gstIncluded = true,
      } = booking;

      const generatorRate = 700;
      const unitRate = 20;
      const generatorCost = generatorHours * generatorRate;
      const electricityCost = unitUsed * unitRate;

      const summaryData = [
        ["Base Cost", `₹ ${parseFloat(cost || 0).toFixed(2)}`],
        ["Generator Hours", `${generatorHours} × ₹${generatorRate} = ₹${generatorCost.toFixed(2)}`],
        ["Electricity Units", `${unitUsed} × ₹${unitRate} = ₹${electricityCost.toFixed(2)}`],
        ["Discount", `- ₹${parseFloat(discount).toFixed(2)}`],
      ];

      if (gstIncluded) {
        summaryData.push(["GST (18%)", `₹ ${parseFloat(gstAmount).toFixed(2)}`]);
      }

      summaryData.push(["Total Payable", `₹ ${parseFloat(totalCost).toFixed(2)}`]);

      summaryData.forEach(([label, value]) => {
        doc.text(`${label.padEnd(20)}: ${value}`);
      });

      doc.moveDown(2);
      doc.fontSize(10).text("Thank you for booking with us!", { align: "center" });

      doc.end();
    } catch (error) {
      console.error("Error generating GST PDF:", error);
      reject(error);
    }
  });
}

module.exports = generateGSTBillPDF;
