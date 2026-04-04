//app/layout.js
import "./globals.css";

export const metadata = {
  title: "TopNarx",
  description: "Yaqin atrofdagi eng arzon narxlarni toping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-brand-bg text-brand-dark">
        {children}
      </body>
    </html>
  );
}
