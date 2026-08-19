import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
      select: {
        referenceId: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
      });
    }

    const imagePath = path.join(
      process.cwd(),
      "public",
      "transcripts",
      reference,
      "transcript.png",
    );

    try {
      await fs.access(imagePath);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Student Transcript</title>

            <style>
              * {
                box-sizing: border-box;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                min-height: 100%;
                background: #f3f4f6;
              }

              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 30px;
              }

              .container {
                width: 891px;
                height: 646px;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              }

              .container img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
              }

              @media (max-width: 940px) {
                body {
                  padding: 10px;
                }

                .container {
                  width: 100%;
                  height: auto;
                  aspect-ratio: 891 / 646;
                }
              }
            </style>
          </head>

          <body>
            <div class="container">
              <img
                src="/transcripts/${reference}/transcript.png"
                alt="Student Transcript"
              />
            </div>
          </body>
        </html>
      `;

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return new Response("Transcript image has not been generated yet.", {
          status: 404,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Public transcript image failed:", error);

    return new Response("Failed to load transcript.", {
      status: 500,
    });
  }
}
