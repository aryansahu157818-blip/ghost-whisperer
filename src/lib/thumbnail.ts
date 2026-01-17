export function generateThumbnailUrl(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, " ").trim().slice(0, 250);
  const encoded = encodeURIComponent(cleaned);

  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&nologo=true&seed=${Math.floor(
    Math.random() * 100000
  )}`;
}
