/**
 * Sitemap Generation
 * Week 8.1: Performance Optimization - SEO
 * 
 * Automatically generates sitemap.xml for search engines
 */

import { MetadataRoute } from 'next';
import { getAllCaseStudies } from '@/lib/supabase/case-studies';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://rockywebstudio.com.au';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/ai-automation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/website-design-development`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/website-redesign-refresh`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/seo-performance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/crm-integration`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/ecommerce`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/support-maintenance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/custom-songs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic case study pages
  let caseStudyPages: MetadataRoute.Sitemap = [];
  try {
    const caseStudies = await getAllCaseStudies();
    caseStudyPages = caseStudies
      .filter(cs => cs.status === 'published')
      .map(cs => ({
        url: `${baseUrl}/case-studies/${cs.slug}`,
        lastModified: cs.updated_at ? new Date(cs.updated_at) : new Date(cs.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error('[SITEMAP] Error fetching case studies:', error);
  }

  return [...staticPages, ...caseStudyPages];
}

