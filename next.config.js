/** @type {import("next").NextConfig} */

const nextConfig = {
  serverExternalPackages: [
    "@sparticuz/chromium",
    "puppeteer-core",
    "puppeteer",
  ],

  outputFileTracingIncludes: {
    "/api/transcripts": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

module.exports = nextConfig;