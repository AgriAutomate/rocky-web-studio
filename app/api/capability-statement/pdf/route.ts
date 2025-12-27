/**
 * API Route: Generate Capability Statement PDF
 * GET /api/capability-statement/pdf
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { CapabilityStatement } from '@/components/pdf/CapabilityStatement';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBuffer = await renderToBuffer(React.createElement(CapabilityStatement));
    
    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Capability-Statement-Gov-Enterprise.pdf"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[SERVER] PDF generation error:', error);
    return new Response('Error generating PDF', { status: 500 });
  }
}

