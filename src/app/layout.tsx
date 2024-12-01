import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Giga Chat",
    template: "%s | Giga Chat"
  },
  description: "Chat with your friends and family in real-time. Create groups, share messages, and stay connected with Giga Chat's modern messaging platform.",
  keywords: [
    "chat",
    "messaging",
    "real-time chat",
    "group chat",
    "instant messaging",
    "communication",
    "social",
    "friends",
    "family"
  ],
  authors: [
    {
      name: "Martin Hetzschold",
      url: "https://giga-chat-rose.vercel.app",
    }
  ],
  creator: "Martin Hetzschold",
  publisher: "Giga Chat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icon.svg",
        href: "/icon.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icon.svg",
        href: "/icon.svg",
      }
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-x3.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  applicationName: "Giga Chat",
  category: "communication",
  classification: "chat application",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    siteName: "Giga Chat",
    title: "Giga Chat - Modern Real-time Messaging",
    description: "Connect with friends and family through instant messaging and group chats.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Giga Chat Preview",
      }
    ],
    locale: "en_US",
  },
  
  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Giga Chat - Modern Real-time Messaging",
    description: "Connect with friends and family through instant messaging and group chats.",
    creator: "@murtin_dopamine",
    images: ["/twitter-image.png"],
  },
  
  // Verification for search engines and services
  verification: {
    other: {
      me: ["martin.hetzschold@gmail.com"],
    },
  },
  
  // App specific metadata
  appleWebApp: {
    capable: true,
    title: "Giga Chat",
    statusBarStyle: "black-translucent",
  },
  
  // Alternate language versions
  alternates: {
    canonical: "https://giga-chat-rose.vercel.app",
    languages: {
    },
  },
  
  // Robot directives
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}