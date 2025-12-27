'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Main Navigation Component
 * 
 * Responsive navigation header with mobile menu
 * WCAG 2.1 AA compliant
 */

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/case-studies', label: 'Case Studies' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/accessibility', label: 'Accessibility & Compliance' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-brand-foreground focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2 rounded"
              aria-label="Rocky Web Studio Home"
            >
              Rocky Web Studio
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2 rounded px-2 py-1 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/questionnaire"
              className="bg-brand-foreground text-background px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-foreground/90 focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2 transition-colors"
            >
              Start a Project
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-foreground hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-foreground/10 bg-background"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/questionnaire"
              className="block px-3 py-2 rounded-md text-base font-medium bg-brand-foreground text-background hover:bg-brand-foreground/90 focus:outline-none focus:ring-2 focus:ring-brand-foreground focus:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Start a Project
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

