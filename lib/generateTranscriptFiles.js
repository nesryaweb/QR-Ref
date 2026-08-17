import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

export async function generateTranscriptFiles(referenceId) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const transcriptUrl = `${baseUrl}/transcript/${referenceId}`;

  const outputDirectory = path.join(
    process.cwd(),
    "public",
    "transcripts",
    referenceId,
  );

  await fs.mkdir(outputDirectory, {
    recursive: true,
  });

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    await page.goto(transcriptUrl, {
      waitUntil: "networkidle0",
    });

    await page.evaluate(() => document.fonts.ready);

    const transcriptElement = await page.$(
      "#transcript-document",
    );

    if (!transcriptElement) {
      throw new Error(
        "Transcript document container was not found.",
      );
    }

    // Give images a chance to finish loading.
    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((image) => {
          if (image.complete) {
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
    });

    const pngPath = path.join(
      outputDirectory,
      "transcript.png",
    );

    const pdfPath = path.join(
      outputDirectory,
      "transcript.pdf",
    );

    // Generate PNG
    await transcriptElement.screenshot({
      path: pngPath,
      type: "png",
    });

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return {
      pngPath,
      pdfPath,
      pngUrl: `/transcripts/${referenceId}/transcript.png`,
      pdfUrl: `/transcripts/${referenceId}/transcript.pdf`,
    };
  } finally {
    await browser.close();
  }
}