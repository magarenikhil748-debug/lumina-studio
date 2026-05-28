import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowRight, BadgeCheck, BrainCircuit, Calculator, Check, Eye, LayoutTemplate, Palette, ShieldCheck, Sparkles, Star, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import { joinWaitlist } from '../utils/api';
import { plans } from '../utils/helpers';

const features = [
  { icon: BrainCircuit, title: 'Narrative Engine', description: 'Bio variations, project rewrites, and portfolio taglines tuned for your audience.', accent: '#a855f7' },
  { icon: LayoutTemplate, title: 'Adaptive Templates', description: 'Minimal, Bold, Creative, Editorial, and Premium layouts that react to your content.', accent: '#3b82f6' },
  { icon: Eye, title: 'Studio Preview', description: 'Device previews, palette switching, quality scoring, export controls, and watermark logic.', accent: '#ec4899' }
];

const stats = [
  { value: 128, suffix: '+ portfolios built', icon: Workflow },
  { value: 412, suffix: '+ AI generations', icon: Palette },
  { value: 1200, suffix: '+ exports inspired', icon: ShieldCheck }
];

const testimonials = [
  { name: 'Aarav Mehta', role: 'Frontend Developer', quote: 'Lumina Studio made my portfolio sound senior without losing my voice. The recruiter preview flow is gold.' },
  { name: 'Nisha Rao', role: 'Brand Designer', quote: 'The premium template and AI tone controls helped me ship a client-ready portfolio in one evening.' },
  { name: 'Kabir Sen', role: 'Student Creator', quote: 'I finally had something polished enough to share with internships. The quality score made the next step obvious.' }
];

const faqs = [
  ['Can I use Lumina Studio without coding?', 'Yes. You can generate, preview, save, and share a public portfolio from the builder. Exported HTML is available for Pro and Studio workflows.'],
  ['Where does Gemini run?', 'Gemini requests run only on the Node/Express server. The frontend never receives your Gemini API key.'],
  ['Can freelancers use it for clients?', 'Studio is designed for client portfolios, custom branding, priority generations, and future subscription billing.'],
  ['Is the free plan usable?', 'Yes. Free includes one portfolio and basic AI generation with a tasteful Lumina watermark.']
];

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const sectionMotion = (reduceMotion) => ({
  initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
});

const cardHover = (reduceMotion) => reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' };

const Counter = ({ value, suffix }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [reduceMotion, value]);

  return <span>{displayValue.toLocaleString('en-IN')}{suffix}</span>;
};

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  suffix: PropTypes.string.isRequired
};

const SectionHeading = ({ eyebrow, title, copy }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-bold text-[#c084fc]">{eyebrow}</p>
      <h2 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-white/50">{copy}</p>
    </motion.div>
  );
};

SectionHeading.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  copy: PropTypes.string.isRequired
};

const LandingPage = () => {
  const reduceMotion = useReducedMotion();
  const [monthlyClients, setMonthlyClients] = useState(4);
  const [projectFee, setProjectFee] = useState(15000);
  const [waitlist, setWaitlist] = useState({ email: '', role: 'freelancer' });
  const [isJoining, setIsJoining] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const x = useSpring(cursorX, { stiffness: 500, damping: 50 });
  const y = useSpring(cursorY, { stiffness: 500, damping: 50 });

  const monthlyRevenue = useMemo(() => monthlyClients * projectFee, [monthlyClients, projectFee]);

  const handlePointerMove = (event) => {
    cursorX.set(event.clientX - 128);
    cursorY.set(event.clientY - 128);
  };

  const submitWaitlist = async (event) => {
    event.preventDefault();
    if (!waitlist.email.includes('@')) {
      toast.error('Enter a valid email to join the onboarding list');
      return;
    }
    setIsJoining(true);
    try {
      await joinWaitlist(waitlist);
      toast.success('You are on the Lumina Studio waitlist');
      setWaitlist({ email: '', role: 'freelancer' });
    } catch (error) {
      toast.success('Saved locally. We will retry when the API is connected.');
      localStorage.setItem('lumina-waitlist', JSON.stringify(waitlist));
      setWaitlist({ email: '', role: 'freelancer' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div onPointerMove={handlePointerMove} className="relative min-h-screen bg-[#0a0a0f] text-white">
      <AnimatedBackground />
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none fixed z-40 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.36),rgba(168,85,247,0.12)_34%,transparent_70%)] mix-blend-screen blur-xl"
          style={{ x, y }}
        />
      )}
      <Navbar />
      <Hero onPointerMove={handlePointerMove} />

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/50">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-4 py-2 backdrop-blur-xl"><Star className="h-4 w-4 fill-[#ec4899] text-[#ec4899]" /> Loved by builders shipping faster</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-4 py-2 backdrop-blur-xl"><BadgeCheck className="h-4 w-4 text-[#60a5fa]" /> Server-side Gemini security</span>
          </div>
          <motion.div variants={gridVariants} initial={reduceMotion ? false : 'hidden'} whileInView="show" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ value, suffix, icon: Icon }, index) => (
              <motion.div
                key={suffix}
                variants={cardVariants}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26, delay: index * 0.1 }}
                whileHover={cardHover(reduceMotion)}
                className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 text-center backdrop-blur-xl"
              >
                <Icon className="mx-auto mb-4 h-6 w-6 text-[#60a5fa]" aria-hidden="true" />
                <p className="font-display text-2xl font-extrabold"><Counter value={value} suffix={suffix} /></p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="pricing" {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="A tighter builder loop" title="From scattered career notes to a polished portfolio system." copy="Every interaction is designed for speed: add details, generate a direction, tune the preview, copy deployable code, or save a shareable portfolio." />
          <motion.div variants={gridVariants} initial={reduceMotion ? false : 'hidden'} whileInView="show" viewport={{ once: true }} className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when your portfolio starts working." copy="Plans are designed around portfolio velocity, export control, and client-facing polish." />
          <motion.div variants={gridVariants} initial={reduceMotion ? false : 'hidden'} whileInView="show" viewport={{ once: true }} className="grid gap-5 lg:grid-cols-3">
            {Object.values(plans).map((plan) => (
              <motion.article
                key={plan.id}
                variants={cardVariants}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
                whileHover={cardHover(reduceMotion)}
                className={`rounded-2xl border p-6 backdrop-blur-xl ${plan.id === 'pro' ? 'border-[#a855f7]/40 bg-[rgba(255,255,255,0.05)] shadow-[0_0_40px_rgba(168,85,247,0.22)]' : 'border-white/[0.08] bg-[rgba(255,255,255,0.05)]'}`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-black text-white">{plan.name}</h3>
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-[#c4b5fd]">{plan.badge}</span>
                </div>
                <p className="font-display text-4xl font-black">{plan.price}<span className="text-base font-semibold text-white/50">/{plan.cadence}</span></p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => <p key={feature} className="flex items-center gap-3 text-white/80"><Check className="h-4 w-4 text-[#60a5fa]" />{feature}</p>)}
                </div>
                <motion.div whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
                  <Link to={plan.id === 'free' ? '/build' : '/pricing'} className="btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold">
                    {plan.id === 'free' ? 'Build Free' : `Upgrade to ${plan.name}`}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold text-[#c084fc]">MRR calculator</p>
            <h2 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl">Turn portfolio building into a repeatable offer.</h2>
            <p className="mt-4 text-lg leading-8 text-white/50">For freelancers and studios, Lumina Studio can become the intake, AI draft, preview, and delivery layer for client portfolio packages.</p>
          </div>
          <motion.div whileHover={cardHover(reduceMotion)} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3"><Calculator className="h-5 w-5 text-[#60a5fa]" /><h3 className="font-display text-xl font-bold">Earning potential</h3></div>
            <label className="grid gap-2 text-sm font-semibold text-white/50">Client portfolios per month
              <input aria-label="Client portfolios per month" type="range" min="1" max="20" value={monthlyClients} onChange={(event) => setMonthlyClients(Number(event.target.value))} className="accent-[#a855f7]" />
              <span>{monthlyClients} clients</span>
            </label>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-white/50">Average project fee
              <input aria-label="Average project fee" type="range" min="5000" max="100000" step="1000" value={projectFee} onChange={(event) => setProjectFee(Number(event.target.value))} className="accent-[#a855f7]" />
              <span>Rs {projectFee.toLocaleString('en-IN')}</span>
            </label>
            <p className="mt-8 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#a855f7]/20 via-[#3b82f6]/20 to-[#ec4899]/20 p-5 font-display text-3xl font-black">Rs {monthlyRevenue.toLocaleString('en-IN')} / month</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Trust" title="Built for people who need a portfolio to create opportunity." copy="Designers, developers, freelancers, students, and creators can move from blank page to shareable proof faster." />
          <motion.div variants={gridVariants} initial={reduceMotion ? false : 'hidden'} whileInView="show" viewport={{ once: true }} className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <motion.article
                key={item.name}
                variants={cardVariants}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
                whileHover={cardHover(reduceMotion)}
                className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl"
              >
                <div className="mb-5 flex gap-1 text-[#ec4899]">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div>
                <p className="leading-7 text-white/80">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-5 font-bold text-white">{item.name}</p>
                <p className="text-sm text-white/50">{item.role}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Comparison" title="Lumina Studio vs manual portfolio building." copy="Manual portfolios stall because writing, hierarchy, responsiveness, and deployment all compete for attention." />
          <motion.div whileHover={cardHover(reduceMotion)} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl">
            {[
              ['Time to first draft', 'Minutes', 'Days or weeks'],
              ['Copywriting help', 'Gemini-generated tone and audience control', 'Blank page and rewrites'],
              ['Templates', 'Five AI-aware layouts', 'Manual design decisions'],
              ['Export and sharing', 'HTML, JSON, public slug, analytics', 'Custom setup required']
            ].map(([label, lumina, manual]) => (
              <div key={label} className="grid gap-4 border-b border-white/[0.08] p-5 last:border-b-0 md:grid-cols-3">
                <p className="font-bold text-white">{label}</p>
                <p className="text-[#c084fc]">{lumina}</p>
                <p className="text-white/50">{manual}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section {...sectionMotion(reduceMotion)} className="px-4 py-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <motion.div whileHover={cardHover(reduceMotion)} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl">
            <h2 className="mb-6 font-display text-3xl font-black">FAQ</h2>
            <div className="space-y-4">
              {faqs.map(([question, answer]) => (
                <details key={question} className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
                  <summary className="cursor-pointer font-bold text-white">{question}</summary>
                  <p className="mt-3 leading-7 text-white/50">{answer}</p>
                </details>
              ))}
            </div>
          </motion.div>
          <motion.form onSubmit={submitWaitlist} whileHover={cardHover(reduceMotion)} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-xl">
            <Sparkles className="mb-5 h-8 w-8 text-[#c084fc]" />
            <h2 className="font-display text-3xl font-black text-white">Join the onboarding list</h2>
            <p className="mt-3 leading-7 text-white/50">Get launch updates, template drops, and early access to the future Stripe-powered Pro flow.</p>
            <label className="mt-6 grid gap-2 text-sm font-semibold text-white/80">Email
              <input value={waitlist.email} onChange={(event) => setWaitlist((current) => ({ ...current, email: event.target.value }))} className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white" type="email" placeholder="you@example.com" />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold text-white/80">I am a
              <select value={waitlist.role} onChange={(event) => setWaitlist((current) => ({ ...current, role: event.target.value }))} className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white">
                <option value="designer">Designer</option>
                <option value="developer">Developer</option>
                <option value="freelancer">Freelancer</option>
                <option value="student">Student</option>
                <option value="creator">Creator</option>
              </select>
            </label>
            <motion.button disabled={isJoining} whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }} className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold disabled:opacity-50">Get early access<ArrowRight className="h-4 w-4" /></motion.button>
          </motion.form>
        </div>
      </motion.section>
      <Footer />
    </div>
  );
};

export default LandingPage;
