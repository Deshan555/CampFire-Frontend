import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-charcoal text-white border-t border-neutral-900 transition-colors duration-300 py-12 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-10">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Logo & Tagline */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-widest uppercase mb-1.5 select-none">
              THE CANVES
            </h2>
            <p className="text-xs text-neutral-400 font-sans tracking-wide uppercase">
              Blog about art, music, and design.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-3">
            {[
              { icon: "fa-instagram", label: "Instagram", url: "#" },
              { icon: "fa-youtube", label: "YouTube", url: "#" },
              { icon: "fa-facebook", label: "Facebook", url: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.url}
                className="w-9 h-9 rounded-full bg-accent-coral hover:bg-accent-coral-dark text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title={s.label}
              >
                <i className={`fa-brands ${s.icon} text-sm`}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-[1px] bg-neutral-800"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left font-sans text-xs text-neutral-400">
          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2.5 justify-center md:justify-start">
            <Link to="#" className="hover:text-accent-coral transition-colors">
              Terms & Conditions
            </Link>
            <Link to="#" className="hover:text-accent-coral transition-colors">
              Cookie & Policy
            </Link>
            <span className="hidden md:inline text-neutral-700">|</span>
            {["Latest", "Trending", "Art", "Design", "Music", "Podcast"].map((cat) => (
              <Link key={cat} to="/" className="hover:text-accent-coral transition-colors">
                {cat}
              </Link>
            ))}
          </div>

          {/* Copyright Info */}
          <p className="text-center md:text-right">
            All rights reserved. © {new Date().getFullYear()} The Canves
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
