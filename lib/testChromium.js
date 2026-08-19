import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs/promises";
export async function testChromium() {
  console.log("CHROMIUM TEST");
  console.log("Chromium package loaded");

  const executablePath = await chromium.executablePath();

  console.log("EXECUTABLE PATH:", executablePath);
  console.log("=================================");
  console.log("CHROMIUM DEBUG");
  console.log("=================================");

  console.log("Chromium args:", chromium.args);

  console.log("Chromium executable:", executablePath);

  console.log(
    "Chromium executable exists:",
    await fs
      .access(executablePath)
      .then(() => true)
      .catch(() => false),
  );

  console.log("=================================");
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

  console.log("BROWSER LAUNCHED");

  const page = await browser.newPage();

  await page.goto("https://example.com", {
    waitUntil: "networkidle0",
  });

  console.log("PAGE TITLE:", await page.title());

  await browser.close();

  console.log("CHROMIUM TEST SUCCESS");
}
