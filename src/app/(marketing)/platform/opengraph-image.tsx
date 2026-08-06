import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tradez Glint — Enterprise Multi-Tenant eCommerce SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        <div>Tradez Glint</div>
        <div style={{ fontSize: 28, fontWeight: 400, opacity: 0.8, marginTop: 20 }}>
          Enterprise Multi-Tenant eCommerce SaaS
        </div>
      </div>
    ),
    { ...size }
  );
}
