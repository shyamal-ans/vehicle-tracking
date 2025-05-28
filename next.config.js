/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  /* Redirects */
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/fiscalyear',
        permanent: true,
      },
      {
        source: '/bank',
        destination: '/bank/banks',
        permanent: true,
      }
      ,{
        source:'/accountspayable',
        destination:'/accountspayable/vendors',
        permanent:true
      },
      {
        source: '/AccountsReceivable',
        destination: '/AccountsReceivable/customer',
        permanent: true,
      }
      
    ];
  },

  /* CORS workaround */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api-mw/:path*',
          destination: 'https://api.gasnatural.io/v1.0.1/mw/:path*',
        },
        // {
        //     source: "/assets/:path*",
        //     destination: `${process.env.CMS_BASEURL}/assets/:path*`,
        // },
        // {
        //     source: "/authd/:path*",
        //     destination: `${process.env.CMS_BASEURL}/auth/:path*`,
        // }
      ],
    };
  },
  assetPrefix: process.env.CDN_RESOURCE_BASEURL,
};

module.exports = nextConfig;
