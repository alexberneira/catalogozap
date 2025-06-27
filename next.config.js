/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tsxiksjkgotyaypozqhn.supabase.co'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
