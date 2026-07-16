import React from "react";
import { Link } from "react-router-dom";
// import { ArrowRight } from "lucide-react"; // Removed unused

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080808] text-white pt-20 pb-8 px-6 lg:px-12 mt-20 rounded-t-[32px]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-white mb-2">
              CampFire.
            </h2>
            <p className="text-gray-400 text-[11px] leading-relaxed max-w-[250px] font-medium">
              Our mission is to equip modern explorers with cutting-edge, functional, and stylish guides that elevate every adventure.
            </p>
          </div>

          {/* Column 2: About */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold capitalize text-white mb-2">About</h3>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">About Us</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">Blog</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">Career</Link>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold capitalize text-white mb-2">Support</h3>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">Contact Us</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">Return</Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors text-xs font-medium">FAQ</Link>
          </div>

          {/* Column 4: Get Updates */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold capitalize text-white mb-2">Get Updates</h3>
            <div className="flex items-center gap-2 bg-white/10 rounded-md p-1.5 border border-white/20">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent text-white placeholder:text-gray-400 w-full outline-none text-xs px-2"
              />
              <button className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors" title="Instagram">
                <i className="fa-brands fa-instagram text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors" title="Twitter">
                <i className="fa-brands fa-x-twitter text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors" title="Facebook">
                <i className="fa-brands fa-facebook-f text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors" title="Discord">
                <i className="fa-brands fa-discord text-xs"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors" title="TikTok">
                <i className="fa-brands fa-tiktok text-xs"></i>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-medium">
            &copy; 2024 Horizone. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-500 hover:text-white transition-colors text-xs font-medium">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-white transition-colors text-xs font-medium">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
