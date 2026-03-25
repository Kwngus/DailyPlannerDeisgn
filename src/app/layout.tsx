import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";

export const metadata = {
  title: "Daily Planner",
  description: "나만의 타임테이블 플래너",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1A1714",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
