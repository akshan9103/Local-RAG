"use client";

import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full fixed top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200 transition-all">
      <div className="max-w-8xl mx-auto px-6 py-2">
        <div className="flex justify-between items-center">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Note: Make sure your /logo.png has a transparent background to blend cleanly */}
            <Image
              src="/logo_v2.png"
              alt="Project Logo"
              width={50}
              height={50}
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-xl font-semibold text-slate-800 tracking-tight">
              LocalRAG<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6 list-none m-0 p-0">
              <li>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-sm"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Register
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-md p-1 transition-colors"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 pb-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              <li>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all mt-1"
                >
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;