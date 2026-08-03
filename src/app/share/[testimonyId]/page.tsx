import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShareTestimony } from "@/features/share/data/services/get-share-testimony";
import { ShareTestimonyPage, truncate } from "@/features/share/presentation/components/share-testimony-page";

type Props = {
  params: Promise<{ testimonyId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testimonyId } = await params;
  const testimony = await getShareTestimony(testimonyId);

  if (!testimony) return { title: "Testimony not found | iTestified" };

  const description = testimony.pullQuote || truncate(testimony.body, 200);
  const title = `${testimony.title} | iTestified`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "iTestified",
      images: testimony.thumbnailUrl ? [{ url: testimony.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: testimony.thumbnailUrl ? [testimony.thumbnailUrl] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { testimonyId } = await params;
  const testimony = await getShareTestimony(testimonyId);

  if (!testimony) notFound();

  return <ShareTestimonyPage testimony={testimony} />;
}
