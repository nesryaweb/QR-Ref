import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;

    // =========================================
    // VALIDATE REFERENCE
    // =========================================

    if (!reference || !/^\d{7}$/.test(reference)) {
      return new Response("Invalid transcript reference.", {
        status: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // =========================================
    // FIND TRANSCRIPT
    // =========================================

    const transcript = await prisma.transcript.findUnique({
      where: {
        referenceId: reference,
      },
      select: {
        referenceId: true,
        pngUrl: true,
      },
    });

    if (!transcript) {
      return new Response("Transcript not found.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // =========================================
    // CHECK IMAGE URL
    // =========================================

    if (!transcript.pngUrl) {
      return new Response("Transcript image has not been generated yet.", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // =========================================
    // HTML VIEWER
    // =========================================

    const title = `${reference}.png (PNG image 891 X 646)`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>${title}</title>

          <meta
            name="description"
            content="Student transcript reference ${reference}"
          />

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
              width: 891px;
              height: 646px;
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

              .container img {
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
              src="/api/transcripts/${reference}/image"
              alt="Student Transcript ${reference}"
              width="891"
              height="646"
            />
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Public transcript viewer failed:", error);

    return new Response("Failed to load transcript.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
