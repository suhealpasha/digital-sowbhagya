const path = require("path");
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

      // Register Inter fonts (adjust the path to your font files)
      doc.registerFont(
        "Inter-Regular",
        path.join(__dirname, "fonts", "Inter-Regular.ttf")
      );
      doc.registerFont(
        "Inter-Bold",
        path.join(__dirname, "fonts", "Inter-Bold.ttf")
      );
      doc.registerFont(
        "Inter-Light",
        path.join(__dirname, "fonts", "Inter-Light.ttf")
      );
      doc.registerFont(
        "InterDisplay-LigthItalic",
        path.join(__dirname, "fonts", "InterDisplay-LightItalic.ttf")
      );
      doc.registerFont(
        "InterDisplay-BoldItalic",
        path.join(__dirname, "fonts", "InterDisplay-BoldItalic.ttf")
      );

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

          let sharedLink;
          try {
            const sharedLinkRes = await dbx.sharingCreateSharedLinkWithSettings(
              { path: filePath }
            );
            sharedLink = sharedLinkRes.result.url;
          } catch (err) {
            if (
              err?.error?.error_shared_link_already_exists ||
              err?.error?.[".tag"] === "shared_link_already_exists"
            ) {
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

      // === Start PDF Content ===

      const {
        _id,
        name,
        address,
        phone,
        alternative_phone,
        date,
        days,
        event_type,
        religion,
        timings,
        cost = 0,
        generatorHours = 0,
        unitUsed = 0,
        discount = 0,
        advance = 0,
        baseCost = 0,
        gstAmount = 0,
        totalCost = 0,
        balance = 0,
        gstIncluded = false,
      } = booking;

      const pageWidth = doc.page.width;
      const margin = doc.page.margins.left;

      // ===== INVOICE NO & DATE =====
      const invoiceNo = Math.floor(10000 + Math.random() * 90000);
      const today = new Date().toLocaleDateString();

      doc.font("Inter-Regular").fontSize(10);

      const invoiceText = `Invoice No: ${invoiceNo}`;
      const dateText = `Date: ${today}`;

      const invoiceY = doc.y;
      doc.text(invoiceText, margin, invoiceY);

      const dateTextWidth = doc.widthOfString(dateText);
      const dateX = pageWidth - margin - dateTextWidth;
      doc.text(dateText, dateX, invoiceY);

      doc.moveDown(); // go to next line
      doc.text("", margin);

      // ===== HEADER =====
      doc
        .font("Inter-Bold")
        .fontSize(24)
        .text("Sowbhagya Kalyana Mantapa", { align: "center" });
      doc.moveDown(0.1);

      doc
        .font("Inter-Light")
        .fontSize(8)
        .text("Bahadurpura, Hosur Main Road, Anekal, Bengaluru – 562106", {
          align: "center",
        });
      doc.moveDown(1);
      if (gstIncluded) {
        doc
          .fontSize(10)
          .font("InterDisplay-BoldItalic") // Bold applied after italic to ensure both effects
          .text("SAC Code: 996601, GSTIN : 2323-12334-343-233", {
            align: "center",
          });

        doc.moveDown(); // Adds spacing before contact info
      }

      doc.moveDown(1);

      // ===== CONTACT INFO LEFT & RIGHT =====
      const leftText = "Suheal Pasha (+91-8892364643)";
      const rightText = "Waseem Akram (+91-9620443936)";
      const contactY = doc.y;

      doc.font("Inter-Bold").fontSize(8).text(leftText, margin, contactY);
      const rightTextWidth = doc.widthOfString(rightText);
      const rightX = pageWidth - margin - rightTextWidth;
      doc.text(rightText, rightX, contactY);

      doc.moveDown(); // move to next line
      doc.text("", margin); // reset x

      // ===== TITLE =====
      doc
        .font("Inter-Bold")
        .fontSize(16)
        .text("Invoice", { align: "center", underline: true });
      doc.moveDown();

      drawTable(doc, "Customer & Event Details", [
        ["Name", name],
        ["Address", address],
        ["Phone", phone],
        [
          "Event Date",
          days > 1
            ? `${new Date(date).toLocaleDateString()} - ${new Date(new Date(date).setDate(new Date(date).getDate() + days - 1)).toLocaleDateString()}`
            : new Date(date).toLocaleDateString(),
        ],
        ["Event Type", event_type],
      ]);

      const costBreakdownData = [
        ["Hall & Services Cost", `₹ ${cost.toFixed(2)}`],
        ["Other Charges", `₹ ${(baseCost - cost).toFixed(2)}`],
        ["Subtotal", `₹ ${(cost + (baseCost - cost)).toFixed(2)}`],
        ["Discount", `-₹ ${discount.toFixed(2)}`],
        ["Base Cost", `₹ ${baseCost.toFixed(2)}`],
      ];
      
      if (gstIncluded) {
        costBreakdownData.push([
          "GST (Included: @18%)",
          `₹ ${gstAmount.toFixed(2)}`,
        ]);
      }
      
      costBreakdownData.push(["Total Amount", `₹ ${totalCost.toFixed(2)}`]);
      
      drawTable(doc, "Cost Breakdown", costBreakdownData);

      drawTable(doc, "Payment Details", [
        ["Advance Paid", `₹ ${advance.toFixed(2)}`],
        ["Balance Due", `₹ ${balance.toFixed(2)}`],
      ]);

      doc.moveDown(2);

      const sigY = doc.y;
      const sigLeftText = "Vendor Signature: ____________________";
      const sigRightText = "Customer Signature: ____________________";

      doc.font("Inter-Regular").fontSize(10).text(sigLeftText, margin, sigY);

      const sigRightTextWidth = doc.widthOfString(sigRightText);
      const sigRightX = pageWidth - margin - sigRightTextWidth;
      doc.text(sigRightText, sigRightX, sigY);

      doc.moveDown(2);
      doc.text("", margin);
      doc
        .font("InterDisplay-LigthItalic")
        .fontSize(10)
        .text("Thank you for booking with us!", { align: "center" });

      doc.moveDown(1);
      if (unitUsed === 0) {
        doc.moveDown(1);
        doc.font("Inter-Bold").fontSize(8).text("Note:", { underline: true });
        doc.moveDown(1); 

        doc.font("InterDisplay-BoldItalic").fontSize(8);

        const dashX = margin;
        const textX = dashX + 10;
        const dashYOffset = 3;

        let y = doc.y + dashYOffset;
        doc.text(
          "1. KEB amount based on number of units (₹20 per unit) and Generator cost per hour (₹700) extra charges.",
          textX,
          doc.y - dashYOffset,
          { width: pageWidth - margin * 2 - 20, align: "left" }
        );
        doc.moveDown(0.2);
        y = doc.y + dashYOffset;
        doc.text(
          "2. Once booking is made, advance can't be refunded.",
          textX,
          doc.y - dashYOffset,
          { width: pageWidth - margin * 2 - 20, align: "left" }
        );

        doc.moveDown(1);
      }

      doc.end();
    } catch (error) {
      console.error("Error generating GST PDF:", error);
      reject(error);
    }
  });
}

module.exports = generateGSTBillPDF;
function drawTable(doc, title, data) {
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const tableTop = doc.y;
  const tableWidth = pageWidth - margin * 2;
  const col1Width = tableWidth * 0.25; 
  const col2Width = tableWidth * 0.75; 
  const col1X = margin;
  const col2X = margin + col1Width;
  const rowHeight = 20;
  const titleHeight = 25;

  // Draw header background
  doc.lineWidth(0.5);
  doc.rect(col1X, tableTop, tableWidth, titleHeight).fill("#f0f0f0").stroke();

  // Write header title (colspan)
  doc
    .fillColor("black")
    .font("Inter-Bold")
    .fontSize(10)
    .text(title, col1X + 5, tableTop + 6);

  let currentY = tableTop + titleHeight;

  data.forEach(([label, value]) => {
    // Draw row border
    doc.rect(col1X, currentY, tableWidth, rowHeight).stroke();

    const boldLabels = ["Name", "Total Amount", "Balance Due"];

    // Draw label
    if (boldLabels.includes(label)) {
      doc.font("Inter-Bold").fontSize(10);
    } else {
      doc.font("InterDisplay-LigthItalic").fontSize(10);
    }
    doc.fillColor("black").text(label, col1X + 5, currentY + 6, {
      width: col1Width - 10,
      align: "left",
    });

    // Draw value
    if (boldLabels.includes(label)) {
      doc.font("Inter-Bold").fontSize(10);
    } else {
      doc.font("InterDisplay-LigthItalic").fontSize(10);
    }
    doc.text(value, col2X + 5, currentY + 6, {
      width: col2Width - 10,
      align: "left",
    });

    currentY += rowHeight;
  });

  doc.moveDown(2);
  doc.y = currentY + 10;
}