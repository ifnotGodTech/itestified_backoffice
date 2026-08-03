import { cache } from "react";
import { backendBaseUrl } from "@/core/auth/backend";
import type { ShareTestimony } from "@/features/share/domain/entities/share-testimony";

type SharePayload = {
  id: number;
  title: string;
  testimony_type: ShareTestimony["testimonyType"];
  category: string;
  body: string;
  pull_quote: string;
  video_url: string;
  thumbnail_url: string;
};

// Wrapped in React's cache() so generateMetadata and the page component
// (both of which need this same testimony) only issue one fetch per request.
export const getShareTestimony = cache(async (testimonyId: string): Promise<ShareTestimony | null> => {
  const response = await fetch(`${backendBaseUrl}/testimonies/${testimonyId}/share/`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as SharePayload;
  return {
    id: payload.id,
    title: payload.title,
    testimonyType: payload.testimony_type,
    category: payload.category,
    body: payload.body,
    pullQuote: payload.pull_quote,
    videoUrl: payload.video_url,
    thumbnailUrl: payload.thumbnail_url,
  };
});
