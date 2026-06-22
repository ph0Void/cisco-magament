import type { Metadata } from "next";
import { Roboto, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import SonnerToast from "@/component/ui/SonnerToast";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cisco Dashboard",
  description: "Proyecto academico de gestión de redes.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn("antialiased", roboto.variable, "font-sans", geist.variable)}>
      <body className={`${roboto.className} min-h-full flex flex-col`}>
        {children}
        <SonnerToast />
      </body>
    </html>
  );
}
