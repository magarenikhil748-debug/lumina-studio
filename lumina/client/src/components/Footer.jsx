import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-white/[0.08] px-4 py-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-5 text-white/50 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">(c) 2026 Lumina Studio. AI portfolios that get you noticed.</p>
      <div className="flex gap-3">
        {[Github, Linkedin, Mail].map((Icon, index) => (
          <a key={index} className="rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-2 transition hover:border-neon hover:text-white" href="https://example.com" aria-label="Social link">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
