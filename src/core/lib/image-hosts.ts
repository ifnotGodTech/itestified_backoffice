/** Hosts next/image may fetch and resize. next.config.ts reads this list. */
export const OPTIMIZED_IMAGE_HOSTS = ["placehold.co", "res.cloudinary.com"] as const;

/** Whether next/image can optimize [src]. Anything else (an image an admin
 * linked from another site, say) must be shown `unoptimized`: next/image
 * throws on an unknown host in development and serves a broken image in
 * production. */
export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && (OPTIMIZED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}
