"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG, COPY } from "@/lib/campaign-constants";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-wide py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/images/rws-logo-transparent.png" alt="Rocky Web Studio" width={40} height={40} className="object-contain" />
              <span className="font-display font-bold text-xl">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              {COPY.footer.tagline}
            </p>
            
            {/* AVOB Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-foreground/10 rounded-lg">
              <Image src="/images/avob-logo-transparent.png" alt="Australian Veteran Owned Business" width={40} height={40} className="object-contain bg-white rounded" />
              <div className="text-sm">
                <div className="font-medium">Veteran Owned</div>
                <div className="text-primary-foreground/60 text-xs">Australian Veteran Owned Business</div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-primary-foreground/70">
                  <MapPin className="w-4 h-4" />
                  {SITE_CONFIG.address}
                </div>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {COPY.footer.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            {COPY.footer.copyright}
          </p>
          <p className="text-primary-foreground/60 text-sm">
            Built with ❤️ in Central Queensland
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
