import Providers from "@/lib/react-query";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";
import { NetworkStatus } from "@/components/ui/network-status";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning={true}
        className="bg-white font-display text-slate-900 h-screen overflow-hidden flex flex-col antialiased"
      >
        <Providers>
          <ToastProvider>
            <NetworkStatus />
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
