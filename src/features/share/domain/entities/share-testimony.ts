export type ShareTestimonyType = "written" | "video";

export type ShareTestimony = {
  id: number;
  title: string;
  testimonyType: ShareTestimonyType;
  category: string;
  body: string;
  pullQuote: string;
  videoUrl: string;
  thumbnailUrl: string;
};
