const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate a fully static export so it can be viewed without a Node.js server
  output: "export",
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

module.exports = nextConfig;
