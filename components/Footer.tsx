"use client";

import React from "react";
import Link from "next/link";
import { Shield, FileText, RefreshCw, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { name: "Terms & Conditions", href: "/tnc", icon: FileText },
    { name: "Refund Policy", href: "/refund_policy", icon: RefreshCw },
    { name: "Privacy Policy", href: "/privacy_policy", icon: Shield },
  ];

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 pt-12 pb-8 mt-20">
      <div className="container-page max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              ThriftVault
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Empowering sustainable fashion at IIT Ropar. Secure payments 
              powered by PhonePe.
            </p>
          </div>

          {/* Legal Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                Legal & Compliance
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <link.icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                Support
              </h3>
              <Link 
                href="/Support"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Help Center <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} ThriftVault. All rights reserved. Registered as a 
            Proprietary MSME.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em]">
               Built for IIT Ropar
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;