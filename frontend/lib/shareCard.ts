import { track } from "@/lib/track";

const W = 1080;
const H = 1920;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function render(content: string, username: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#7c3aed");
  bg.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Message card
  ctx.font = "600 56px system-ui, sans-serif";
  const lines = wrap(ctx, content, 800).slice(0, 12);
  const cardH = 220 + lines.length * 76;
  const top = (H - cardH) / 2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(80, top, W - 160, cardH, 48);
  ctx.fill();

  ctx.fillStyle = "#7c3aed";
  ctx.font = "700 40px system-ui, sans-serif";
  ctx.fillText(`👻 anonymous message to @${username}`, 140, top + 100);

  ctx.fillStyle = "#111827";
  ctx.font = "600 56px system-ui, sans-serif";
  lines.forEach((l, i) => ctx.fillText(l, 140, top + 190 + i * 76));

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 44px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Send me an anonymous message on Gwam", W / 2, H - 200);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("render failed"))), "image/png"),
  );
}

/** Shares the card via the native share sheet, or downloads it where file sharing isn't supported. */
export async function shareMessageCard(content: string, username: string) {
  const blob = await render(content, username);
  const file = new File([blob], "gwam-message.png", { type: "image/png" });
  track("share_card");

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] }).catch(() => {});
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gwam-message.png";
  a.click();
  URL.revokeObjectURL(a.href);
}
