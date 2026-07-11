import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Casino Atlántico Manatí — Piso de Máquinas</title>

        {/* Icons & PWA */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/app-manifest.json" />
        <meta name="theme-color" content="#1a2332" />

        {/* Self-hosted fonts — Playfair Display (display/headers) + Inter (body).
            Variable WOFF2, latin subset (covers Spanish). Served from /fonts so
            this internal tool makes zero runtime requests to third parties
            (no usage leak to Google, no external supply-chain dependency). */}
        <link rel="preload" href="/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/playfair-var-latin.woff2" as="font" type="font/woff2" crossOrigin="" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 300 800;
              font-display: swap;
              src: url(/fonts/inter-var-latin.woff2) format('woff2');
            }
            @font-face {
              font-family: 'Playfair Display';
              font-style: normal;
              font-weight: 700 900;
              font-display: swap;
              src: url(/fonts/playfair-var-latin.woff2) format('woff2');
            }
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; background: #f8f9fa; font-family: 'Inter', system-ui, sans-serif; }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
