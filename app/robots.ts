/**
 * Robots.txt Generation
 * Week 8.1: Performance Optimization - SEO
 * 
 * Controls search engine crawling behavior
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://rockywebstudio.com.au';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/consciousness/',
          '/discovery/',
          '/questionnaire/',
          '/book/',
          '/confirmation/',
          '/test-ai',
          '/test-avob',
          '/_next/',
          '/.next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

