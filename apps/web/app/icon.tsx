import { ImageResponse } from "next/og"

export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ]
}

export default function Icon({ id }: { id: string }) {
  const size = id === "192" ? 192 : 512
  const fontSize = size * 0.48

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: size * 0.2,
        }}
      >
        <span
          style={{
            fontSize,
            color: "#e8d5b7",
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          ॐ
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
