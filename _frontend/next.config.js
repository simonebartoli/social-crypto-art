/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        port: "4000",
        protocol: "http",
        hostname: "localhost",
        pathname: "**/*"
      }
    ]
  }
}

module.exports = nextConfig
