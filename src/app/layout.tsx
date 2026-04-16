import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Get Started - ALKEME Insurance",
  description: "Answer a few quick questions to get your insurance quote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Runs before React hydration — suppress landing page flash when embedded as modal */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(window.location.search);if(p.get('vertical')||p.get('embed')){document.documentElement.classList.add('embed-mode');}}catch(e){}})();`,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `html.embed-mode body{background:transparent !important;}html.embed-mode .landing-view{display:none !important;}` }} />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
