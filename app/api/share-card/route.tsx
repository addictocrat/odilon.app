import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

function truncateAtSentence(
  text: string,
  minLength = 336,
  hardLimit = 456,
): string {
  if (text.length <= minLength) return text;
  const regex = /[.!?]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index >= minLength) {
      if (match.index <= hardLimit) {
        return text.slice(0, match.index + 1).trim();
      }
      break;
    }
  }
  return text.slice(0, hardLimit).trim() + "…";
}

function truncateQuestion(text: string, hardLimit = 120): string {
  if (text.length <= hardLimit) return text;
  const regex = /[.!?]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index >= 80 && match.index <= hardLimit) {
      return text.slice(0, match.index + 1).trim();
    }
  }
  return text.slice(0, hardLimit).trim() + "…";
}

async function fetchFont(family: string): Promise<ArrayBuffer> {
  // Satori supports TTF, OTF, WOFF — but NOT WOFF2.
  // We try two User-Agents: Android 2.x (TTF) then Chrome 36 (WOFF).
  const uaList = [
    "Mozilla/5.0 (Linux; U; Android 2.2; en-us) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
    "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36",
  ];

  const apiUrl = `https://fonts.googleapis.com/css?family=${family.replace(/ /g, "+")}:400`;

  for (const ua of uaList) {
    const css = await fetch(apiUrl, { headers: { "User-Agent": ua } }).then(
      (r) => r.text(),
    );
    const match = css.match(/url\((https?:\/\/[^)]+\.(ttf|otf|woff))\)/i);
    if (match) return fetch(match[1]).then((r) => r.arrayBuffer());
  }

  throw new Error(
    `No supported font format (TTF/OTF/WOFF) found for ${family}`,
  );
}

export async function POST(req: NextRequest) {
  const {
    imageId,
    question,
    answer,
    artworkTitle,
    artistName,
    clientImageDataUrl,
  } = await req.json();

  console.log("Generating share card for imageId:", imageId);
  const artImageUrl = imageId
    ? `https://www.artic.edu/iiif/2/${imageId}/full/600,/0/default.jpg`
    : null;

  const artImageUrlFallback = imageId
    ? `https://artic.edu/iiif/2/${imageId}/full/600,/0/default.jpg`
    : null;

  if (clientImageDataUrl) {
    console.log("Using client-provided image data URL");
  } else if (artImageUrl) {
    console.log("Fetching artwork image from:", artImageUrl);
  }

  const [gloockFont, breeSerifFont, assistantFont, imageDataUrl] =
    await Promise.all([
      fetchFont("Gloock"),
      fetchFont("Bree Serif"),
      fetchFont("Assistant"),
      clientImageDataUrl
        ? Promise.resolve(clientImageDataUrl)
        : artImageUrl
          ? fetch(artImageUrl, {
              headers: {
                "User-Agent": "OdilonApp/1.0 (https://odilon.app)",
                Accept: "image/jpeg,image/webp,*/*",
                "Cache-Control": "no-cache",
                Referer: "https://odilon.app/",
              },
              cache: "no-store",
            })
              .then(async (r) => {
                if (!r.ok && artImageUrlFallback) {
                  console.warn(
                    `Primary image fetch failed (${r.status}), trying fallback...`,
                  );
                  return fetch(artImageUrlFallback, {
                    headers: { "User-Agent": "OdilonApp/1.0" },
                  });
                }
                return r;
              })
              .then(async (r) => {
                if (!r.ok) {
                  console.error(
                    `Image fetch failed with status: ${r.status} ${r.statusText}`,
                  );
                  return null;
                }
                const contentType =
                  r.headers.get("content-type") ?? "image/jpeg";

                // Ensure it's actually an image and not an error page/HTML
                if (contentType.includes("html")) {
                  console.error("Received HTML instead of image");
                  return null;
                }

                const buf = await r.arrayBuffer();
                console.log(
                  "Image fetch successful, size:",
                  buf.byteLength,
                  "type:",
                  contentType,
                );
                return `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`;
              })
              .catch((err) => {
                console.error("Image fetch failed:", err);
                return null;
              })
          : Promise.resolve(null),
    ]);

  if (artImageUrl && !imageDataUrl && !clientImageDataUrl) {
    console.warn("Art image URL was set but all fetch attempts failed");
  }

  const truncatedAnswer = truncateAtSentence(answer ?? "");
  const truncatedQuestion = truncateQuestion(question ?? "");

  return new ImageResponse(
    <div
      style={{
        width: 1080,
        height: 1440,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6E6CB",
      }}
    >
      {/* Painting Image Container (40% of 1440 = 576) */}
      <div
        style={{
          height: 576,
          width: 1080,
          backgroundColor: "#483434",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: "Bree Serif",
              fontSize: 42,
              color: "rgba(246,230,203,0.3)",
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* Artwork Info Bar */}
      <div
        style={{
          height: 120,
          backgroundColor: "#E7D4B5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div
          style={{ fontFamily: "Bree Serif", fontSize: 30, color: "#483434" }}
        >
          {artworkTitle ?? ""}
        </div>
        <div
          style={{
            fontFamily: "Assistant",
            fontSize: 22,
            color: "#6B4F4F",
            marginTop: 4,
          }}
        >
          {artistName ?? ""}
        </div>
      </div>

      {/* Content (Remaining height - Footer) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: 48,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        {/* Question */}
        <div
          style={{ display: "flex", flexDirection: "column", marginBottom: 36 }}
        >
          <div
            style={{
              fontFamily: "Bree Serif",
              fontSize: 36,
              color: "#483434",
              lineHeight: "1.45",
            }}
          >
            {truncatedQuestion}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 2,
            backgroundColor: "rgba(182,199,170,0.5)",
            marginBottom: 36,
          }}
        />

        {/* Answer */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Assistant",
              fontSize: 33,
              color: "#6B4F4F",
              lineHeight: "1.65",
            }}
          >
            {truncatedAnswer}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: 140,
          backgroundColor: "#483434",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <div style={{ fontFamily: "Gloock", fontSize: 44, color: "#F6E6CB" }}>
          odilon.app
        </div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1440,
      fonts: [
        { name: "Gloock", data: gloockFont, weight: 400, style: "normal" },
        {
          name: "Bree Serif",
          data: breeSerifFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Assistant",
          data: assistantFont,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
