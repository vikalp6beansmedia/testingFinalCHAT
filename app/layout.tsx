import "./globals.css";
import { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "CreatorFarm",
  description: "Exclusive content, member drops, and direct creator chat.",
  openGraph: {
    title: "CreatorFarm",
    description: "Exclusive content, member drops, and direct creator chat.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
