/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
