/**
 * Website Audit Service
 * 
 * Core service for performing automated website audits.
 * Uses Google PageSpeed API for performance metrics and cheerio for HTML parsing.
 * 
 * Note: Requires cheerio package: npm install cheerio
 * Note: Requires NEXT_PUBLIC_GOOGLE_API_KEY or GOOGLE_PAGESPEED_API_KEY environment variable
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import {
  normalizeUrl,
  isValidUrl,
  extractEmail,
  extractPhone,
} from "@/lib/utils/audit-utils";
import type {
  WebsiteAuditResult,
  WebsiteInfo,
  TechStackInfo,
  DetectedTechnology,
  PerformanceMetrics,
  SeoMetrics,
  SiteMetadata,
  ContentAnalysis,
  Recommendation,
} from "@/lib/types/audit";

const AUDIT_TIMEOUT_MS = 30000; // 30 seconds
const PAGESPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/**
 * Set audit status in database
 * Helper function for status tracking
 */
async function setAuditStatus(
  questionnaireResponseId: string | number,
  status: "pending" | "running" | "completed" | "failed",
  extra?: { error?: string; completedAt?: string }
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);
    const update: any = { audit_status: status };

    if (status === "running") {
      // Set audit_started_at when status changes to 'running'
      update.audit_started_at = new Date().toISOString();
    }

    if (extra?.completedAt) {
      update.audit_completed_at = extra.completedAt;
    }

    if (extra?.error) {
      update.audit_error = extra.error;
    }

    const { error } = await (supabase as any)
      .from("questionnaire_responses")
      .update(update)
      .eq("id", questionnaireResponseId);

    if (error) {
      await logger.error("Failed to set audit status", {
        questionnaireResponseId,
        status,
        error: error.message,
      });
    }
  } catch (error) {
    await logger.error("Exception setting audit status", {
      questionnaireResponseId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Main audit function - runs asynchronously
 * Should be called fire-and-forget style
 */
export async function auditWebsiteAsync(
  questionnaireResponseId: string | number,
  websiteUrl: string
): Promise<void> {
  const startTime = Date.now();

  try {
    // Set status to 'running' and record start time
    await setAuditStatus(questionnaireResponseId, "running");

    // Validate URL
    if (!isValidUrl(websiteUrl)) {
      await setAuditStatus(questionnaireResponseId, "failed", {
        error: `Invalid URL format: ${websiteUrl}`,
      });
      return;
    }

    const normalizedUrl = normalizeUrl(websiteUrl);

    await logger.info("Starting website audit", {
      questionnaireResponseId,
      websiteUrl: normalizedUrl,
    });

    // Fetch HTML and parse
    const html = await fetchWebsiteHtml(normalizedUrl);
    if (!html) {
      await setAuditStatus(questionnaireResponseId, "failed", {
        error: "Failed to fetch website HTML",
      });
      return;
    }

    const $ = cheerio.load(html);

    // Extract all information in parallel where possible
    const [websiteInfo, techStack, performance, metadata] = await Promise.all([
      extractWebsiteInfo(normalizedUrl, html, $),
      extractTechStack(html, $, normalizedUrl),
      getPageSpeedMetrics(normalizedUrl, questionnaireResponseId),
      parseHtmlMetadata($, html),
    ]);

    // Extract SEO metrics
    const seo = extractSeoMetrics($, html, normalizedUrl);

    // Analyze content
    const contentAnalysis = analyzeContent($, html, normalizedUrl);

    // Generate recommendations
    const recommendations = generateRecommendations({
      websiteInfo,
      techStack,
      performance,
      seo,
      contentAnalysis,
    });

    // Build complete audit result
    const auditResult: WebsiteAuditResult = {
      websiteInfo,
      techStack,
      performance,
      seo,
      metadata,
      contentAnalysis,
      recommendations,
      auditDate: new Date().toISOString(),
      auditDurationMs: Date.now() - startTime,
    };

    // Save results (this also sets audit_completed_at)
    await saveAuditResults(questionnaireResponseId, auditResult);

    // Set status to 'completed' after successful save
    await setAuditStatus(questionnaireResponseId, "completed", {
      completedAt: new Date().toISOString(),
    });

    await logger.info("Website audit completed successfully", {
      questionnaireResponseId,
      websiteUrl: normalizedUrl,
      durationMs: auditResult.auditDurationMs,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    
    await logger.error("Website audit failed", {
      questionnaireResponseId,
      websiteUrl,
      error: errorMessage,
    });

    // Set status to 'failed' and save error
    await setAuditStatus(questionnaireResponseId, "failed", {
      error: errorMessage,
    });
  }
}

/**
 * Fetch website HTML with timeout
 */
async function fetchWebsiteHtml(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: AUDIT_TIMEOUT_MS,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RockyWebStudio/1.0; +https://rockywebstudio.com.au)",
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
    });

    if (response.status >= 400) {
      await logger.error("Website returned error status", {
        url,
        status: response.status,
      });
      return null;
    }

    return response.data;
  } catch (error) {
    await logger.error("Failed to fetch website HTML", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Extract basic website information
 */
async function extractWebsiteInfo(
  url: string,
  html: string,
  $: cheerio.CheerioAPI
): Promise<WebsiteInfo> {
  const title = $("title").first().text().trim() || undefined;
  const description =
    $('meta[name="description"]').attr("content")?.trim() || undefined;

  // Try to get final URL after redirects
  let finalUrl: string | undefined;
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 5,
    });
    finalUrl = response.request.res.responseUrl || url;
  } catch {
    finalUrl = url;
  }

  return {
    url,
    finalUrl: finalUrl !== url ? finalUrl : undefined,
    title,
    description,
    isAccessible: true,
    httpStatus: 200,
    contentType: "text/html",
    contentLength: html.length,
  };
}

/**
 * Extract technology stack using regex patterns and HTML analysis
 */
function extractTechStack(
  html: string,
  _$: cheerio.CheerioAPI,
  _url: string
): TechStackInfo {
  const techStack: TechStackInfo = {
    analytics: [],
    paymentProcessors: [],
    frameworks: [],
    languages: [],
    otherTechnologies: [],
  };

  // CMS Detection (WordPress, Shopify, etc.)
  const cmsPatterns: Array<{
    name: string;
    patterns: RegExp[];
    confidence: DetectedTechnology["confidence"];
  }> = [
    {
      name: "WordPress",
      patterns: [
        /wp-content/i,
        /wp-includes/i,
        /wordpress/i,
        /\/wp-json\//i,
      ],
      confidence: "high",
    },
    {
      name: "Shopify",
      patterns: [
        /shopify/i,
        /cdn\.shopify\.com/i,
        /\.myshopify\.com/i,
        /shopify\.theme/i,
      ],
      confidence: "high",
    },
    {
      name: "Wix",
      patterns: [/wix\.com/i, /wixstatic\.com/i, /wix-code/i],
      confidence: "high",
    },
    {
      name: "Squarespace",
      patterns: [/squarespace\.com/i, /sqs-cdn/i],
      confidence: "high",
    },
    {
      name: "Webflow",
      patterns: [/webflow\.io/i, /webflow\.com/i],
      confidence: "high",
    },
    {
      name: "Drupal",
      patterns: [/drupal/i, /sites\/all/i],
      confidence: "high",
    },
    {
      name: "Joomla",
      patterns: [/joomla/i, /\/media\/joomla/i],
      confidence: "high",
    },
  ];

  for (const cms of cmsPatterns) {
    if (cms.patterns.some((pattern) => pattern.test(html))) {
      techStack.cms = {
        name: cms.name,
        confidence: cms.confidence,
        detectionMethod: "content-analysis",
      };
      break;
    }
  }

  // E-commerce Detection
  const ecommercePatterns = [
    { name: "WooCommerce", pattern: /woocommerce/i },
    { name: "Magento", pattern: /magento/i },
    { name: "BigCommerce", pattern: /bigcommerce/i },
    { name: "PrestaShop", pattern: /prestashop/i },
  ];

  for (const ecom of ecommercePatterns) {
    if (ecom.pattern.test(html)) {
      techStack.ecommerce = {
        name: ecom.name,
        confidence: "high",
        detectionMethod: "content-analysis",
      };
      break;
    }
  }

  // Analytics Detection
  const analyticsPatterns = [
    { name: "Google Analytics", pattern: /google-analytics|gtag|ga\(/i },
    { name: "Google Tag Manager", pattern: /googletagmanager\.com/i },
    { name: "Facebook Pixel", pattern: /facebook\.net\/en_US\/fbevents/i },
    { name: "Hotjar", pattern: /hotjar\.com/i },
    { name: "Mixpanel", pattern: /mixpanel\.com/i },
  ];

  analyticsPatterns.forEach((analytics) => {
    if (analytics.pattern.test(html)) {
      techStack.analytics?.push({
        name: analytics.name,
        confidence: "high",
        detectionMethod: "script",
      });
    }
  });

  // Payment Processor Detection
  const paymentPatterns = [
    { name: "Stripe", pattern: /stripe\.com|stripejs/i },
    { name: "PayPal", pattern: /paypal\.com|paypalobjects/i },
    { name: "Square", pattern: /square\.com|squareup\.com/i },
    { name: "Afterpay", pattern: /afterpay\.com/i },
    { name: "Klarna", pattern: /klarna\.com/i },
  ];

  paymentPatterns.forEach((payment) => {
    if (payment.pattern.test(html)) {
      techStack.paymentProcessors?.push({
        name: payment.name,
        confidence: "high",
        detectionMethod: "script",
      });
    }
  });

  // Framework Detection
  const frameworkPatterns = [
    { name: "React", pattern: /react|react-dom/i },
    { name: "Vue.js", pattern: /vue\.js|vuejs/i },
    { name: "Angular", pattern: /angular\.js|angularjs/i },
    { name: "Next.js", pattern: /__next|next\.js/i },
    { name: "Gatsby", pattern: /gatsby/i },
  ];

  frameworkPatterns.forEach((framework) => {
    if (framework.pattern.test(html)) {
      techStack.frameworks?.push({
        name: framework.name,
        confidence: "medium",
        detectionMethod: "script",
      });
    }
  });

  // Hosting/CDN Detection
  const hostingPatterns = [
    { name: "Cloudflare", pattern: /cloudflare/i },
    { name: "AWS", pattern: /amazonaws\.com|cloudfront/i },
    { name: "Vercel", pattern: /vercel\.com|_vercel/i },
    { name: "Netlify", pattern: /netlify\.com|_netlify/i },
  ];

  hostingPatterns.forEach((hosting) => {
    if (hosting.pattern.test(html)) {
      techStack.hosting = {
        name: hosting.name,
        confidence: "medium",
        detectionMethod: "header",
      };
    }
  });

  return techStack;
}

/**
 * Get PageSpeed metrics from Google PageSpeed API
 */
async function getPageSpeedMetrics(url: string, questionnaireResponseId?: string | number): Promise<PerformanceMetrics> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    await logger.error("Google PageSpeed API key not configured");
    return {};
  }

  try {
    console.log('🚀 [AUDIT] Starting audit fetch:', {
      responseId: questionnaireResponseId,
      url: url,
      timestamp: new Date().toISOString()
    });
    const startTime = Date.now();

    // Fetch mobile metrics
    const mobileResponse = await axios.get(PAGESPEED_API_URL, {
      params: {
        url,
        key: apiKey,
        strategy: "mobile",
        category: ["performance"],
      },
      timeout: AUDIT_TIMEOUT_MS,
    });

    const mobileData = mobileResponse.data?.lighthouseResult?.categories?.performance?.score;
    const mobileAudits = mobileResponse.data?.lighthouseResult?.audits || {};

    // Fetch desktop metrics
    const desktopResponse = await axios.get(PAGESPEED_API_URL, {
      params: {
        url,
        key: apiKey,
        strategy: "desktop",
        category: ["performance"],
      },
      timeout: AUDIT_TIMEOUT_MS,
    });

    const desktopData = desktopResponse.data?.lighthouseResult?.categories?.performance?.score;

    const auditTime = Date.now() - startTime;
    console.log('✅ [AUDIT] Google API responded:', {
      duration: `${auditTime}ms`,
      status: mobileResponse.status,
      hasData: !!(mobileData || desktopData),
      timestamp: new Date().toISOString()
    });

    const metrics: PerformanceMetrics = {
      mobileScore: mobileData ? Math.round(mobileData * 100) : undefined,
      desktopScore: desktopData ? Math.round(desktopData * 100) : undefined,
      firstContentfulPaint: mobileAudits["first-contentful-paint"]?.numericValue,
      largestContentfulPaint: mobileAudits["largest-contentful-paint"]?.numericValue,
      totalBlockingTime: mobileAudits["total-blocking-time"]?.numericValue,
      cumulativeLayoutShift: mobileAudits["cumulative-layout-shift"]?.numericValue,
      speedIndex: mobileAudits["speed-index"]?.numericValue,
      timeToInteractive: mobileAudits["interactive"]?.numericValue,
    };

    // Calculate overall score
    if (metrics.mobileScore && metrics.desktopScore) {
      metrics.overallScore = Math.round(
        (metrics.mobileScore + metrics.desktopScore) / 2
      );
    } else {
      metrics.overallScore = metrics.mobileScore || metrics.desktopScore;
    }

    return metrics;
  } catch (error) {
    await logger.error("PageSpeed API error", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}

/**
 * Parse HTML metadata
 */
function parseHtmlMetadata(
  $: cheerio.CheerioAPI,
  html: string
): SiteMetadata {
  const metadata: SiteMetadata = {};

  // Basic meta tags
  metadata.title = $("title").first().text().trim() || undefined;
  metadata.description =
    $('meta[name="description"]').attr("content")?.trim() || undefined;
  metadata.keywords = $('meta[name="keywords"]')
    .attr("content")
    ?.split(",")
    .map((k: string) => k.trim())
    .filter(Boolean);
  metadata.author = $('meta[name="author"]').attr("content")?.trim() || undefined;
  metadata.language = $("html").attr("lang") || $('meta[http-equiv="content-language"]').attr("content") || undefined;
  metadata.charset = $('meta[charset]').attr("charset") || undefined;
  metadata.viewport = $('meta[name="viewport"]').attr("content") || undefined;
  metadata.themeColor = $('meta[name="theme-color"]').attr("content") || undefined;

  // Social profiles
  const socialProfiles: SiteMetadata["socialProfiles"] = {};

  // Facebook
  const fbUrl = $('meta[property="og:url"]').attr("content");
  if (fbUrl && fbUrl.includes("facebook.com")) {
    socialProfiles.facebook = { platform: "Facebook", url: fbUrl };
  }

  // Twitter
  const twitterUrl = $('meta[name="twitter:site"]').attr("content");
  if (twitterUrl) {
    socialProfiles.twitter = {
      platform: "Twitter",
      url: twitterUrl.startsWith("@") ? `https://twitter.com/${twitterUrl.slice(1)}` : twitterUrl,
    };
  }

  // Instagram
  const instagramMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (instagramMatch) {
    socialProfiles.instagram = {
      platform: "Instagram",
      url: `https://instagram.com/${instagramMatch[1]}`,
      username: instagramMatch[1],
    };
  }

  // LinkedIn
  const linkedinMatch = html.match(/linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    socialProfiles.linkedin = {
      platform: "LinkedIn",
      url: `https://linkedin.com/${linkedinMatch[1]}/${linkedinMatch[2]}`,
    };
  }

  // YouTube
  const youtubeMatch = html.match(/youtube\.com\/(channel|c|user)\/([a-zA-Z0-9_-]+)/i);
  if (youtubeMatch) {
    socialProfiles.youtube = {
      platform: "YouTube",
      url: `https://youtube.com/${youtubeMatch[1]}/${youtubeMatch[2]}`,
    };
  }

  if (Object.keys(socialProfiles).length > 0) {
    metadata.socialProfiles = socialProfiles;
  }

  // Contact info
  const emails = extractEmail(html);
  const phones = extractPhone(html);

  if (emails.length > 0 || phones.length > 0) {
    metadata.contactInfo = {};
    if (emails.length > 0) metadata.contactInfo.emails = emails;
    if (phones.length > 0) metadata.contactInfo.phones = phones;
  }

  return metadata;
}

/**
 * Extract SEO metrics
 */
function extractSeoMetrics(
  $: cheerio.CheerioAPI,
  html: string,
  url: string
): SeoMetrics {
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim();

  // Check for structured data
  const structuredData = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/i);

  // Check for sitemap
  const sitemapLink = $('link[rel="sitemap"]').attr("href");
  // Note: Would need to fetch robots.txt to verify, but we'll check for reference

  // Count headings
  const h1Count = $("h1").length;
  const h2Count = $("h2").length;

  // Image alt tags
  const images = $("img");
  const totalImages = images.length;
  let withAlt = 0;
  images.each((_index: number, el) => {
    if ($(el).attr("alt")) withAlt++;
  });

  return {
    hasTitleTag: !!title,
    titleLength: title?.length,
    hasMetaDescription: !!description,
    descriptionLength: description?.length,
    hasOpenGraphTags: $('meta[property^="og:"]').length > 0,
    hasTwitterCards: $('meta[name^="twitter:"]').length > 0,
    hasStructuredData: !!structuredData,
    hasSitemap: !!sitemapLink || html.toLowerCase().includes("sitemap.xml"),
    hasRobotsTxt: html.toLowerCase().includes("robots.txt"),
    h1Count,
    h2Count,
    imageAltTags: {
      total: totalImages,
      withAlt,
      withoutAlt: totalImages - withAlt,
    },
    mobileFriendly: $('meta[name="viewport"]').length > 0,
    httpsEnabled: url.startsWith("https://"),
    canonicalUrl: $('link[rel="canonical"]').attr("href") || undefined,
  };
}

/**
 * Analyze content
 */
function analyzeContent(
  $: cheerio.CheerioAPI,
  html: string,
  _url: string
): ContentAnalysis {
  const bodyText = $("body").text();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // Check for common features
  const hasBlog = /blog|news|articles|posts/i.test(html) || $(".blog, .news, .articles").length > 0;
  const hasEcommerce = /cart|checkout|add to cart|buy now/i.test(html) || $(".cart, .checkout, [data-product]").length > 0;
  const hasContactForm = /contact|get in touch|reach out/i.test(html) || $("form, .contact-form").length > 0;
  const hasBookingSystem = /book|booking|appointment|schedule/i.test(html) || $(".booking, .appointment, [data-booking]").length > 0;
  const hasLiveChat = /live chat|chat widget|intercom|drift|zendesk chat/i.test(html);
  const hasNewsletter = /newsletter|subscribe|email signup/i.test(html) || $(".newsletter, .subscribe").length > 0;

  // Estimate page count (rough heuristic)
  const navLinks = $("nav a, .nav a, .menu a").length;
  const estimatedPageCount = Math.max(1, Math.floor(navLinks / 2));

  // Try to extract last updated date
  const lastUpdatedMatch = html.match(/last.?updated?[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : undefined;

  return {
    wordCount,
    hasBlog,
    hasEcommerce,
    hasContactForm,
    hasBookingSystem,
    hasLiveChat,
    hasNewsletter,
    pageCount: estimatedPageCount,
    lastUpdated,
  };
}

/**
 * Generate recommendations based on audit results
 */
function generateRecommendations(audit: {
  websiteInfo: WebsiteInfo;
  techStack: TechStackInfo;
  performance: PerformanceMetrics;
  seo: SeoMetrics;
  contentAnalysis: ContentAnalysis;
}): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Performance recommendations
  if (audit.performance.mobileScore && audit.performance.mobileScore < 50) {
    recommendations.push({
      category: "performance",
      priority: "critical",
      title: "Poor Mobile Performance",
      description: `Mobile performance score is ${audit.performance.mobileScore}/100. This significantly impacts user experience and SEO rankings.`,
      impact: "Improving mobile performance can increase conversions by 20-30%",
      effort: "high",
    });
  }

  if (audit.performance.largestContentfulPaint && audit.performance.largestContentfulPaint > 2500) {
    recommendations.push({
      category: "performance",
      priority: "high",
      title: "Slow Largest Contentful Paint",
      description: `LCP is ${Math.round(audit.performance.largestContentfulPaint)}ms (target: <2500ms). This affects perceived load speed.`,
      impact: "Faster LCP improves user engagement and reduces bounce rate",
      effort: "medium",
    });
  }

  // SEO recommendations
  if (!audit.seo.hasTitleTag) {
    recommendations.push({
      category: "seo",
      priority: "critical",
      title: "Missing Title Tag",
      description: "Your website doesn't have a title tag. This is essential for SEO and browser tabs.",
      impact: "Title tags are the #1 ranking factor for search engines",
      effort: "low",
    });
  }

  if (!audit.seo.hasMetaDescription) {
    recommendations.push({
      category: "seo",
      priority: "high",
      title: "Missing Meta Description",
      description: "Add a meta description to improve click-through rates from search results.",
      impact: "Can increase organic click-through rate by 15-20%",
      effort: "low",
    });
  }

  if (!audit.seo.httpsEnabled) {
    recommendations.push({
      category: "security",
      priority: "critical",
      title: "HTTPS Not Enabled",
      description: "Your website is not using HTTPS. This is a security risk and hurts SEO.",
      impact: "HTTPS is required for modern browsers and improves SEO rankings",
      effort: "low",
    });
  }

  if (audit.seo.imageAltTags && audit.seo.imageAltTags.withoutAlt > 0) {
    const missingAltRatio = audit.seo.imageAltTags.withoutAlt / audit.seo.imageAltTags.total;
    if (missingAltRatio > 0.3) {
      recommendations.push({
        category: "seo",
        priority: "medium",
        title: "Missing Image Alt Tags",
        description: `${audit.seo.imageAltTags.withoutAlt} images are missing alt text. This hurts accessibility and SEO.`,
        impact: "Alt tags improve accessibility and help images rank in image search",
        effort: "medium",
      });
    }
  }

  // Content recommendations
  if (!audit.contentAnalysis.hasContactForm) {
    recommendations.push({
      category: "content",
      priority: "medium",
      title: "No Contact Form Found",
      description: "Consider adding a contact form to make it easier for visitors to reach you.",
      impact: "Contact forms can increase lead generation by 30-40%",
      effort: "low",
    });
  }

  // Technical recommendations
  if (!audit.techStack.cms && !audit.techStack.frameworks?.length) {
    recommendations.push({
      category: "technical",
      priority: "low",
      title: "Consider Modern CMS or Framework",
      description: "Your website may benefit from a modern CMS or framework for easier content management.",
      impact: "Easier content updates and better performance",
      effort: "high",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Save audit results to database
 * Note: Status is set to 'completed' separately by caller using setAuditStatus
 */
async function saveAuditResults(
  questionnaireResponseId: string | number,
  auditResult: WebsiteAuditResult
): Promise<void> {
  try {
    console.log('💾 [AUDIT] Saving to database:', {
      responseId: questionnaireResponseId,
      auditStatus: 'completed',
      timestamp: new Date().toISOString()
    });

    const supabase = createServerSupabaseClient(true);

    const updateResult = await (supabase as any)
      .from("questionnaire_responses")
      .update({
        audit_results: auditResult,
        audit_completed_at: new Date().toISOString(),
        audit_error: null, // Clear any previous error
      })
      .eq("id", questionnaireResponseId);

    console.log('✅ [AUDIT] Database update result:', {
      responseId: questionnaireResponseId,
      status: updateResult.status || 'success',
      error: updateResult.error?.message || null,
      timestamp: new Date().toISOString()
    });

    if (updateResult.error) {
      throw updateResult.error;
    }
  } catch (error) {
    await logger.error("Failed to save audit results", {
      questionnaireResponseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Save audit error to database
 * Note: This function is deprecated in favor of setAuditStatus(status: 'failed', extra: { error })
 * Kept for backward compatibility but status should be set via setAuditStatus
 */
/**
 * Save audit error to database
 * Note: This function is deprecated in favor of setAuditStatus(status: 'failed', extra: { error })
 * Kept for backward compatibility but status should be set via setAuditStatus
 * @deprecated Use setAuditStatus instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment
// @ts-ignore - Deprecated function, kept for backward compatibility
async function saveAuditError(
  questionnaireResponseId: string | number,
  errorMessage: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient(true);

    const { error } = await (supabase as any)
      .from("questionnaire_responses")
      .update({
        audit_error: errorMessage,
        audit_completed_at: null,
      })
      .eq("id", questionnaireResponseId);

    if (error) {
      await logger.error("Failed to save audit error", {
        questionnaireResponseId,
        error: error.message,
      });
    }
  } catch (error) {
    await logger.error("Exception saving audit error", {
      questionnaireResponseId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
