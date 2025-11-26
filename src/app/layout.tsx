import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "汪汪法官 - 情侣争吵裁判系统",
  description: "让公正的小法官米粒为你们裁决吧！专业的情侣争吵仲裁平台。",
  openGraph: {
    title: "汪汪法官",
    description: "让公正的小法官米粒为你们裁决吧！",
    images: [
      {
        url: "/judge-dog.png",
        width: 800,
        height: 600,
        alt: "汪汪法官 - 小法官米粒",
      },
    ],
    siteName: "汪汪法官",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "汪汪法官",
    description: "让公正的小法官米粒为你们裁决吧！",
    images: ["/judge-dog.png"],
  },
  icons: {
    icon: "/judge-dog.png",
    shortcut: "/judge-dog.png",
    apple: "/judge-dog.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
