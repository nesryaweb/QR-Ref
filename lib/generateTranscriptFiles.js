import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function generateTranscriptFiles(reference) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const transcriptUrl = `${baseUrl}/transcript/${reference}`;

  // =========================================
  // OUTPUT DIRECTORY
  // =========================================

  const outputDirectory = path.join(
    process.cwd(),
    "public",
    "transcripts",
    reference,
  );

  await fs.mkdir(outputDirectory, {
    recursive: true,
  });

  // =========================================
  // LAUNCH BROWSER
  // =========================================

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // =========================================
    // SOURCE DOCUMENT SIZE
    // =========================================

    const imageWidth = 891;
    const imageHeight = 646;

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
    // DEBUG
    // =========================================

    console.log("=========================================");
    console.log("TRANSCRIPT GENERATION DEBUG");
    console.log("=========================================");

    console.log("TRANSCRIPT URL:", transcriptUrl);

    console.log(
      "SECRET EXISTS:",
      Boolean(process.env.TRANSCRIPT_INTERNAL_SECRET),
    );

    console.log(
      "SECRET LENGTH:",
      process.env.TRANSCRIPT_INTERNAL_SECRET?.length || 0,
    );

    // =========================================
    // LOAD TRANSCRIPT PAGE
    // =========================================

    const response = await page.goto(transcriptUrl, {
      waitUntil: "networkidle0",
    });

    console.log("PUPPETEER URL:", page.url());
    console.log("PUPPETEER STATUS:", response?.status());
    console.log("PUPPETEER TITLE:", await page.title());

    console.log(
      "PUPPETEER BODY:",
      await page.$eval("body", (body) => body.innerText),
    );

    console.log(
      "TRANSCRIPT EXISTS:",
      await page.evaluate(() => {
        return Boolean(document.getElementById("transcript-document"));
      }),
    );

    // =========================================
    // WAIT FOR TRANSCRIPT
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

      // Wait for fonts
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Give Chromium two paint cycles
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
    // OUTPUT PATHS
    // =========================================

    const pngPath = path.join(outputDirectory, "transcript.png");

    const pdfPath = path.join(outputDirectory, "transcript.pdf");

    // =========================================
    // PNG GENERATION
    // =========================================
    //
    // Source:
    // 891 × 646 CSS pixels
    //
    // Render:
    // deviceScaleFactor = 2
    //
    // Temporary:
    // 1782 × 1292 pixels
    //
    // Final:
    // 891 × 646 pixels
    //
    // Sharp performs high-quality downsampling.
    // =========================================

    await page.setViewport({
      width: imageWidth,
      height: imageHeight,
      deviceScaleFactor: 2,
    });

    // Wait for Chromium to repaint
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });

    // =========================================
    // HIGH-RESOLUTION SCREENSHOT
    // =========================================

    const highResolutionPng = await transcriptElement.screenshot({
      type: "png",
      omitBackground: false,
      captureBeyondViewport: true,
    });

    // =========================================
    // RESIZE TO EXACT DIMENSIONS
    // =========================================

    await sharp(highResolutionPng)
      .resize(imageWidth, imageHeight, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(pngPath);

    // =========================================
    // VERIFY PNG
    // =========================================

    const pngMetadata = await sharp(pngPath).metadata();

    console.log(
      "GENERATED PNG SIZE:",
      `${pngMetadata.width}x${pngMetadata.height}`,
    );

    // =========================================
    // PDF VIEWPORT
    // =========================================

    await page.setViewport({
      width: 1122,
      height: 793,
      deviceScaleFactor: 1,
    });

    // =========================================
    // PREPARE PDF CANVAS
    // =========================================

    await page.evaluate(() => {
      const transcript = document.getElementById("transcript-document");

      if (!transcript) {
        throw new Error("Transcript document not found.");
      }

      // =====================================
      // RESET PAGE
      // =====================================

      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";

      document.body.style.margin = "0";
      document.body.style.padding = "0";

      document.body.style.width = "1122px";
      document.body.style.height = "793px";

      document.body.style.overflow = "hidden";

      // =====================================
      // CREATE PDF CANVAS
      // =====================================

      const pdfCanvas = document.createElement("div");

      pdfCanvas.id = "pdf-canvas";

      pdfCanvas.style.position = "relative";

      pdfCanvas.style.width = "1122px";
      pdfCanvas.style.height = "793px";

      pdfCanvas.style.margin = "0";
      pdfCanvas.style.padding = "0";

      pdfCanvas.style.overflow = "hidden";

      // =====================================
      // REPLACE BODY CONTENT
      // =====================================

      document.body.innerHTML = "";

      document.body.appendChild(pdfCanvas);

      pdfCanvas.appendChild(transcript);

      // =====================================
      // ORIGINAL TRANSCRIPT SIZE
      // =====================================

      const sourceWidth = 891;
      const sourceHeight = 646;

      // =====================================
      // A4 LANDSCAPE CSS SIZE
      // =====================================

      const pdfWidth = 1122;
      const pdfHeight = 793;

      // =====================================
      // CALCULATE SCALE
      // =====================================

      const scaleX = pdfWidth / sourceWidth;

      const scaleY = pdfHeight / sourceHeight;

      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = sourceWidth * scale;

      const scaledHeight = sourceHeight * scale;

      // =====================================
      // CENTER DOCUMENT
      // =====================================

      const left = (pdfWidth - scaledWidth) / 2;

      const top = (pdfHeight - scaledHeight) / 2;

      // =====================================
      // POSITION TRANSCRIPT
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
    // GENERATE PDF
    // =========================================

    await page.pdf({
      path: pdfPath,

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
    // FINAL LOG
    // =========================================

    console.log("=========================================");
    console.log("TRANSCRIPT FILES GENERATED");
    console.log("=========================================");

    console.log({
      reference,
      pngPath,
      pdfPath,
      pngSize: `${imageWidth}x${imageHeight}`,
      pdfSize: "A4 Landscape",
    });

    return {
      pngPath,
      pdfPath,
    };
  } finally {
    // =========================================
    // ALWAYS CLOSE BROWSER
    // =========================================

    await browser.close();
  }
}
