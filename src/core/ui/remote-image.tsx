import Image, { type ImageProps } from "next/image";
import { canOptimizeImage } from "@/core/lib/image-hosts";

/** next/image for pictures whose host isn't known ahead of time: those on an
 * unlisted host are shown as they are instead of crashing the page. */
export function RemoteImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!canOptimizeImage(src)} {...props} />;
}
