import { chromium } from "playwright";

export async function renderTranscriptToPng(transcript) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1240,
        height: 1754,
      },
      deviceScaleFactor: 1,
    });

    const transcriptData = encodeURIComponent(
      JSON.stringify(transcript)
    );

    await page.goto(
      `${process.env.NEXT_PUBLIC_APP_URL}/transcript/render?data=${transcriptData}`,
      {
        waitUntil: "networkidle",
      }
    );

    const document = page.locator("[data-transcript-document]");

    await document.waitFor();

    const png = await document.screenshot({
      type: "png",
    });

    return png;
  } finally {
    await browser.close();
  }
}