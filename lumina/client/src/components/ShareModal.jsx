import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, Download, Linkedin, Mail, MessageCircle, QrCode, Twitter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const openShareWindow = (url) => {
  window.open(url, '_blank', 'width=600,height=400');
};

const ShareModal = ({ isOpen, onClose, portfolio, publicUrl }) => {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const encoded = useMemo(() => encodeURIComponent(publicUrl), [publicUrl]);
  const title = `${portfolio?.name || 'Lumina portfolio'} - ${portfolio?.title || 'Portfolio'}`;
  const encodedTitle = encodeURIComponent(title);
  const twitterText = encodeURIComponent(`Just built my AI-powered portfolio with @LuminaAI ✨\nCheck it out: ${publicUrl}\n#portfolio #design #builtwithAI`);
  const linkedInText = encodeURIComponent(`Excited to share my new portfolio built with Lumina AI.\n${publicUrl}`);
  const whatsAppText = encodeURIComponent(`Hey! Check out my portfolio: ${publicUrl}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Portfolio link copied');
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="share-modal fixed inset-0 z-[90] grid place-items-center bg-black/65 p-4 text-white backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Share your portfolio"
        >
          <motion.section
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
            className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 p-5 shadow-[0_0_48px_rgba(168,85,247,0.24)] backdrop-blur-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#c4b5fd]">Public launch link</p>
                <h2 className="mt-1 font-display text-3xl font-black">Share Your Portfolio</h2>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/[0.08] hover:text-white" aria-label="Close share modal">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
              <input readOnly value={publicUrl} className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" aria-label="Public portfolio URL" />
              <button type="button" onClick={copyUrl} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0a0a0f]">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => openShareWindow(`https://linkedin.com/shareArticle?url=${encoded}&title=${linkedInText || encodedTitle}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold hover:bg-white/[0.06]">
                <Linkedin className="h-4 w-4" aria-hidden="true" /> LinkedIn
              </button>
              <button type="button" onClick={() => openShareWindow(`https://twitter.com/intent/tweet?url=${encoded}&text=${twitterText}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold hover:bg-white/[0.06]">
                <Twitter className="h-4 w-4" aria-hidden="true" /> Twitter/X
              </button>
              <button type="button" onClick={() => openShareWindow(`https://wa.me/?text=${whatsAppText}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold hover:bg-white/[0.06]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </button>
              <button type="button" onClick={() => openShareWindow(`mailto:?subject=${encodeURIComponent(`${portfolio?.name || 'My'}'s Portfolio`)}&body=${encodeURIComponent(`Check out my portfolio: ${publicUrl}`)}`)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-3 font-bold hover:bg-white/[0.06]">
                <Mail className="h-4 w-4" aria-hidden="true" /> Email
              </button>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 sm:grid-cols-[150px_1fr] sm:items-center">
              <img src={qrUrl} alt="QR code for public portfolio URL" width="150" height="150" loading="lazy" className="rounded-xl bg-white p-2" />
              <div>
                <p className="flex items-center gap-2 font-bold"><QrCode className="h-4 w-4 text-[#c4b5fd]" aria-hidden="true" /> QR code</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Use this for resumes, pitch decks, event badges, and client handoffs.</p>
                <a href={qrUrl} download={`${portfolio?.slug || 'lumina-portfolio'}-qr.png`} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2 text-sm font-bold hover:bg-white/[0.06]">
                  <Download className="h-4 w-4" aria-hidden="true" /> Download QR
                </a>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ShareModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  portfolio: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string
  }),
  publicUrl: PropTypes.string.isRequired
};

export default ShareModal;
