import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/provider";
import ClientLayout from "@/components/ClientLayout";
import ApolloWrapper from "@/components/ApolloWrapper";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANS",
  description: "Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ApolloWrapper>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </ApolloWrapper>
      </body>
    </html>
  );
}
