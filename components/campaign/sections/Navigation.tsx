"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG, NAV_LINKS } from "@/lib/campaign-constants";
import Image from "next/image";

interface NavigationProps {
  onOpenForm: () => void;
}

const Navigation = ({ onOpenForm }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            aria-label="Rocky Web Studio Home"
          >
            <Image src="/images/rws-logo-transparent.png" alt="Rocky Web Studio" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <span className="font-display font-bold text-lg md:text-xl">
              {SITE_CONFIG.name}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Button variant="nav" size="sm" onClick={onOpenForm}>
              Book a Call
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-80" : "max-h-0"
          }`}
        >
          <div className="py-4 space-y-4 border-t border-border">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Button
              variant="cta"
              className="w-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenForm();
              }}
            >
              Book Your Free Call
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
