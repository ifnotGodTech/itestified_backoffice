import { Card, CardDescription, CardTitle } from "@/core/ui/card";

const sections = [
  {
    title: "Written",
    description: "Moderate and review written testimonies with status visibility.",
  },
  {
    title: "Video Testimony",
    description: "Track submitted video testimonies and preview detail states.",
  },
  {
    title: "Manage settings (testimony)",
    description: "Control verification and publishing settings for testimony content.",
  },
  {
    title: "Notifications",
    description: "Mark read/unread, filter, and delete single/all notifications.",
  },
];

export function WebHomeBase() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" data-testid="web-home-base">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardTitle>{section.title}</CardTitle>
          <CardDescription>{section.description}</CardDescription>
        </Card>
      ))}
    </div>
  );
}
