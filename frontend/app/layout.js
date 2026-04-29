import "./globals.css";

export const metadata = {
  title: "TopNarx",
  description: "Yaqin atrofdagi eng arzon narxlarni toping",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: "#0e0e0e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-dark">
        {children}
      </body>
    </html>
  );
}