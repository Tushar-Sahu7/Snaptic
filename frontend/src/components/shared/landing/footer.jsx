"use client";

import React from "react";
import { Link } from "react-router";
import { Logo } from "@/components/shared/Logo";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Face AI", href: "#link" },
    { name: "Scheduling", href: "#link" },
  ],
  company: [
    { name: "About Us", href: "https://github.com/Tushar-Sahu7" },
    { name: "Contact", href: "mailto:sahutushar532@gmail.com" },
    { name: "Careers", href: "#link" },
    { name: "Blog", href: "#link" },
  ],
  resources: [
    { name: "Documentation", href: "https://snaptic-ray7.onrender.com/api-docs/" },
    { name: "Help Center", href: "#link" },
    { name: "Privacy Policy", href: "#link" },
    { name: "Terms of Service", href: "#link" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://x.com/Tushar_Sahu7" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/tushar-sahu-8b39b4290/" },
  { name: "GitHub", icon: Github, href: "https://github.com/Tushar-Sahu7" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/killermac.7/" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Logo />
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Empowering educators with seamless AI-powered attendance tracking.
              Smart, secure, and built for modern classrooms.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 flex items-center justify-center rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                  aria-label={social.name}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">
              Product
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    onClick={(e) => {
                      if (link.href.startsWith("#")) {
                        e.preventDefault();
                        document
                          .getElementById(link.href.substring(1))
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("http") || link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">
              Resources
            </h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith("http") || link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="size-4 mt-0.5 text-primary" />
                <a href="mailto:sahutushar532@gmail.com" className="hover:text-primary transition-colors">
                  sahutushar532@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="size-4 mt-0.5 text-primary" />
                <a href="tel:+917275007737" className="hover:text-primary transition-colors">
                  +91 7275007737
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="size-4 mt-0.5 text-primary" />
                <span>Ayodhya, UP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Snaptic. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="#link" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#link" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="#link" className="hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
