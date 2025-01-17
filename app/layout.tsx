import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Blocks",
  description: "Interactive math comparison tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-blue-200">
        {children}
      </body>
    </html>
  );
}