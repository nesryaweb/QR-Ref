import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function renderTranscript(transcript) {
  const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: null,
  executablePath: await chromium.executablePath(),
  headless: true,
});

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    // We will render the TranscriptDocument here.
    await page.setContent(
      `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Student Transcript</title>

            <style>
              * {
                box-sizing: border-box;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                background: white;
              }

              body {
                font-family: Arial, Helvetica, sans-serif;
              }
            </style>
          </head>

          <body>
            <div id="transcript"></div>
          </body>
        </html>
      `,
      {
        waitUntil: "networkidle0",
      },
    );

    return {
      browser,
      page,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
