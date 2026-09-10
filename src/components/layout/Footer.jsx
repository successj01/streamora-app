import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowUp } from "lucide-react";

import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Explore: [
      { name: "Home", path: "/" },
      { name: "Browse", path: "/browse" },
      { name: "Live", path: "/live" },
      { name: "Categories", path: "/categories" },
      { name: "Search", path: "/search" },
    ],

    Streamora: [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Contact", path: "/contact" },
      { name: "Help Center", path: "/help" },
    ],

    Legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "#",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
    },
    {
      name: "X",
      icon: FaXTwitter,
      href: "#",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "#",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-white/10 bg-[#0b0b0d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tight"
            >
              Stream<span className="text-red-500">ora</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
              Your entertainment destination for movies, series,
              live streams and unforgettable experiences.
            </p>

            {/* Newsletter */}
            <div className="mt-6 max-w-sm">
              <p className="mb-3 text-sm font-medium text-gray-300">
                Stay updated
              </p>

              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                <div className="flex flex-1 items-center">
                  <Mail
                    size={17}
                    className="ml-3 shrink-0 text-gray-600"
                  />

                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </div>

                <button
                  type="button"
                  className="bg-red-600 px-4 text-sm font-semibold transition hover:bg-red-700"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">
                {title}
              </h3>

              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-500 transition hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-gray-600">
            © {currentYear} Streamora. All rights reserved.
          </p>

          <div className="flex items-center gap-3">

            {/* Social Links */}
            {socialLinks.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-gray-500 transition hover:bg-red-600 hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}

            {/* Back To Top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-gray-500 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowUp size={17} />
            </button>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;