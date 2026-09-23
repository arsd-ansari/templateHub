import { createHash, type Hash } from "crypto";
import type { NextConfig } from "next";

class Sha256Hash {
  private hash: Hash;

  constructor() {
    this.hash = createHash("sha256");
  }

  update(data?: string | Buffer, inputEncoding?: BufferEncoding) {
    if (data == null) return this;
    if (typeof data === "string") {
      if (inputEncoding) this.hash.update(data, inputEncoding);
      else this.hash.update(data);
    } else {
      this.hash.update(data);
    }
    return this;
  }

  digest(encoding?: "hex" | "base64" | "base64url" | "binary") {
    return encoding ? this.hash.digest(encoding) : this.hash.digest();
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  outputFileTracingIncludes: {
    "/api/pack/download": ["./content/packs/**/*"]
  },
  async redirects() {
    return [{ source: "/affiliate-disclosure", destination: "/privacy", permanent: true }];
  },
  webpack: (config) => {
    // Next.js's default build hash uses a wasm md4 implementation that
    // intermittently crashes. Node crypto sha256 is stable; skip null updates
    // that otherwise throw ERR_INVALID_ARG_TYPE on Vercel.
    config.output.hashFunction = Sha256Hash;
    return config;
  }
};

export default nextConfig;
