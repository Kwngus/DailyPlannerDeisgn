import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import duration from "dayjs/plugin/duration";

dayjs.locale("ko");
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(duration);

export const metadata = {
  title: "Daily Planner",
  description: "나만의 타임테이블 플래너",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily Planner",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/favicon-96x96.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#1A1714",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="style"
          href="/fonts/pretendardvariable-dynamic-subset.css"
        />
        <link
          rel="stylesheet"
          href="/fonts/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
