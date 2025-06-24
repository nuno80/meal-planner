// next.config.mjs v.1.1 (Integrato)
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- NUOVA SEZIONE PER LE IMMAGINI ---
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
  // --- FINE NUOVA SEZIONE ---

  experimental: {
    typedRoutes: true,
  },
  allowedDevOrigins: ["*"],
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
