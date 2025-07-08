// next.config.mjs v.1.2 (Aggiunto allowedDevOrigins per CodeSandbox)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.giallozafferano.it",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
  // --- MODIFICA PER CODESANDBOX ---
  // Aggiungiamo l'URL specifico del tuo ambiente di sviluppo CodeSandbox
  // per permettere le richieste cross-origin necessarie a Clerk.
  allowedDevOrigins: ["59x3zw-3000.csb.app"],
  // --- FINE MODIFICA ---
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          "better-sqlite3": "commonjs better-sqlite3",
        },
      ];
    }

    return config;
  },
};

export default nextConfig;
