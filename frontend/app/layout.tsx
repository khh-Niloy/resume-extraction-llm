import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Extractor",
  description: "Turn a resume image into a structured profile.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
