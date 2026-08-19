import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import sharp from "sharp";
import { put } from "@vercel/blob";

export async function generateTranscriptFiles(reference) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const transcriptUrl = `${baseUrl}/transcript/${reference}`;

  // =========================================
  // SOURCE DOCUMENT SIZE
  // =========================================

  const imageWidth = 891;
  const imageHeight = 646;

  // =========================================
  // LAUNCH BROWSER
  // =========================================

  const isProduction = process.env.NODE_ENV === "production";

  let browser;

  if (isProduction) {
    const executablePath = await chromium.executablePath();

    console.log("Using Vercel Chromium");
    console.log("Chromium executable:", executablePath);

    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath,
      headless: true,
    });
  } else {
    console.log("Using local Puppeteer Chromium");

    browser = await puppeteer.launch({
      headless: true,
    });
  }

  try {
    const page = await browser.newPage();

    // =========================================
    // INITIAL VIEWPORT
    // =========================================

    await page.setViewport({
      width: imageWidth,
      height: imageHeight,
      deviceScaleFactor: 1,
    });

    // =========================================
    // INTERNAL TRANSCRIPT ACCESS
    // =========================================

    await page.setExtraHTTPHeaders({
      "x-transcript-secret": process.env.TRANSCRIPT_INTERNAL_SECRET || "",
    });

    // =========================================
    // LOAD TRANSCRIPT PAGE
    // =========================================

    console.log("Generating transcript:", reference);
    console.log("Transcript URL:", transcriptUrl);

    const response = await page.goto(transcriptUrl, {
      waitUntil: "networkidle0",
    });

    console.log("Puppeteer status:", response?.status());
    console.log("Puppeteer URL:", page.url());

    if (!response || !response.ok()) {
      throw new Error(
        `Transcript page failed to load. Status: ${response?.status()}`,
      );
    }

    // =========================================
    // WAIT FOR DOCUMENT
    // =========================================

    await page.waitForSelector("#transcript-document", {
      timeout: 10000,
    });

    // =========================================
    // WAIT FOR IMAGES AND FONTS
    // =========================================

    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((image) => {
          if (image.complete && image.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            image.addEventListener("load", resolve, {
              once: true,
            });

            image.addEventListener("error", resolve, {
              once: true,
            });
          });
        }),
      );

      if (document.fonts) {
        await document.fonts.ready;
      }

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });

    // =========================================
    // GET TRANSCRIPT ELEMENT
    // =========================================

    const transcriptElement = await page.$("#transcript-document");

    if (!transcriptElement) {
      throw new Error("Transcript document container was not found.");
    }

    // =========================================
    // PNG GENERATION
    // =========================================

    await page.setViewport({
      width: imageWidth,
      height: imageHeight,
      deviceScaleFactor: 2,
    });

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });

    const highResolutionPng = await transcriptElement.screenshot({
      type: "png",
      omitBackground: false,
      captureBeyondViewport: true,
    });

    // =========================================
    // FINAL PNG BUFFER
    // =========================================

    const pngBuffer = await sharp(highResolutionPng)
      .resize(imageWidth, imageHeight, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toBuffer();

    // =========================================
    // BLOB ENVIRONMENT DEBUG
    // =========================================

    console.log("Blob environment:", {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,

      hasBlobStoreId: !!process.env.BLOB_STORE_ID,

      hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,

      vercelEnv: process.env.VERCEL_ENV,

      nodeEnv: process.env.NODE_ENV,
    });

    // =========================================
    // UPLOAD PNG TO VERCEL BLOB
    // =========================================

    const pngBlob = await put(
      `transcripts/${reference}/transcript.png`,
      pngBuffer,
      {
        access: "private",
        contentType: "image/png",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      },
    );

    console.log("PNG uploaded:", pngBlob.url);

    // =========================================
    // PREPARE PDF
    // =========================================

    await page.setViewport({
      width: 1122,
      height: 793,
      deviceScaleFactor: 1,
    });

    await page.evaluate(() => {
      const transcript = document.getElementById("transcript-document");

      if (!transcript) {
        throw new Error("Transcript document not found.");
      }

      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";

      document.body.style.margin = "0";
      document.body.style.padding = "0";

      document.body.style.width = "1122px";
      document.body.style.height = "793px";

      document.body.style.overflow = "hidden";

      const pdfCanvas = document.createElement("div");

      pdfCanvas.id = "pdf-canvas";

      pdfCanvas.style.position = "relative";

      pdfCanvas.style.width = "1122px";
      pdfCanvas.style.height = "793px";

      pdfCanvas.style.margin = "0";
      pdfCanvas.style.padding = "0";

      pdfCanvas.style.overflow = "hidden";

      document.body.innerHTML = "";

      document.body.appendChild(pdfCanvas);

      pdfCanvas.appendChild(transcript);

      // =====================================
      // SOURCE SIZE
      // =====================================

      const sourceWidth = 891;
      const sourceHeight = 646;

      // =====================================
      // A4 LANDSCAPE
      // =====================================

      const pdfWidth = 1122;
      const pdfHeight = 793;

      // =====================================
      // SCALE
      // =====================================

      const scaleX = pdfWidth / sourceWidth;
      const scaleY = pdfHeight / sourceHeight;

      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = sourceWidth * scale;

      const scaledHeight = sourceHeight * scale;

      const left = (pdfWidth - scaledWidth) / 2;

      const top = (pdfHeight - scaledHeight) / 2;

      // =====================================
      // POSITION
      // =====================================

      transcript.style.position = "absolute";

      transcript.style.left = `${left}px`;

      transcript.style.top = `${top}px`;

      transcript.style.width = `${sourceWidth}px`;

      transcript.style.height = `${sourceHeight}px`;

      transcript.style.margin = "0";

      transcript.style.boxSizing = "border-box";

      transcript.style.transformOrigin = "top left";

      transcript.style.transform = `scale(${scale})`;
    });

    // =========================================
    // GENERATE PDF INTO BUFFER
    // =========================================

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,

      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },

      pageRanges: "1",

      preferCSSPageSize: false,
    });

    // =========================================
    // UPLOAD PDF TO VERCEL BLOB
    // =========================================

    const pdfBlob = await put(
      `transcripts/${reference}/transcript.pdf`,
      pdfBuffer,
      {
        access: "private",
        contentType: "application/pdf",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      },
    );

    console.log("PDF uploaded:", pdfBlob.url);

    // =========================================
    // RETURN URLS
    // =========================================

    return {
      pngUrl: pngBlob.url,
      pdfUrl: pdfBlob.url,
    };
  } finally {
    await browser.close();
  }
}
