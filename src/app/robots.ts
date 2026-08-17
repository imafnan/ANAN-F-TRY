import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://forrabix.afnanalamanan.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/cart',
          '/checkout',
          '/order-success/'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
