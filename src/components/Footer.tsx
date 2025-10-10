import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#14314F] text-[#ABD2BE] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[#47682d] mb-4">⭐ Grade Ranger</h3>
            <p className="text-sm">
              Industry-leading AI-powered card grading and market research platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">AI Scanner</a></li>
              <li><a href="#" className="hover:text-white transition">Deal Finder</a></li>
              <li><a href="#" className="hover:text-white transition">Market Research</a></li>
              <li><a href="#" className="hover:text-white transition">Grading History</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Grading Guide</a></li>
              <li><a href="#" className="hover:text-white transition">Market Reports</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#47682d]/30 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 Grade Ranger. All rights reserved. Built for AWS deployment.</p>
        </div>
      </div>
    </footer>
  );
}
