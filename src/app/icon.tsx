import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#102b3d",
          borderRadius: "14px",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#a9d9cf",
            borderRadius: "4px",
            display: "flex",
            height: "30px",
            position: "relative",
            width: "12px",
          }}
        />
        <div
          style={{
            background: "#a9d9cf",
            borderRadius: "4px",
            display: "flex",
            height: "12px",
            position: "absolute",
            width: "30px",
          }}
        />
        <div
          style={{
            borderBottom: "4px solid #ffffff",
            borderRadius: "0 0 50% 50%",
            bottom: "7px",
            display: "flex",
            height: "8px",
            position: "absolute",
            transform: "rotate(-8deg)",
            width: "38px",
          }}
        />
      </div>
    ),
    size,
  );
}
