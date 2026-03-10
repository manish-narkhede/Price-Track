/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  images: {
    remotePatterns: [
      {protocol: "https", hostname: "**.amazon.com"},
      {protocol: "https", hostname: "**.amazon.in"},
      {protocol: "https", hostname: "**.ssl-images-amazon.com"},
      {protocol: "https", hostname: "**.media-amazon.com"},
      {protocol: "https", hostname: "**.flipkart.com"},
      {protocol: "https", hostname: "rukminim**.flixcart.com"},
    ],
  },
  webpack: (config, {isServer}) => {
    if (!isServer) {
      // @firebase/auth's node-esm build imports undici (Node-only, uses private
      // class fields that webpack 5 can't parse). Alias it to the browser ESM
      // build which is undici-free.
      const authNodeEsm = path.resolve(
        __dirname,
        "node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/index.js"
      );
      const authBrowser = path.resolve(
        __dirname,
        "node_modules/firebase/node_modules/@firebase/auth/dist/esm2017/index.js"
      );
      config.resolve.alias = {
        ...config.resolve.alias,
        [authNodeEsm]: authBrowser,
        "@firebase/auth$": authBrowser,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
