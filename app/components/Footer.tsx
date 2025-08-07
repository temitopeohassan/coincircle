"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Shield, 
  Users, 
  TrendingUp,
  Heart,
  ExternalLink
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.jpeg"
                alt="CoinCircle Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-white">CoinCircle</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering communities through decentralized savings groups. 
              Build wealth together with transparency and security.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://twitter.com/coincircle" 
                className="text-slate-400 hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://github.com/coincircle" 
                className="text-slate-400 hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com/company/coincircle" 
                className="text-slate-400 hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:hello@coincircle.com" 
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/how-it-works" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/features" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/roadmap" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/documentation" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center"
                >
                  Documentation
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center"
                >
                  API Reference
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/tutorials" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/support" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/status" 
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  System Status
                </Link>
              </li>
              <li>
                <Link 
                  href="/discord" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Discord Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Secure & Transparent</h4>
                <p className="text-slate-400 text-xs">Smart contracts ensure trust</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Community Driven</h4>
                <p className="text-slate-400 text-xs">Build wealth together</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Automated Payouts</h4>
                <p className="text-slate-400 text-xs">Fair distribution system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-slate-400">
                © {currentYear} CoinCircle. All rights reserved.
              </span>
              <Link 
                href="/privacy" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-400" />
              <span>for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;