import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, GripVertical, Plus, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { calculateQuality, createId, defaultDraft, plans, templates } from '../utils/helpers';

const categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Other'];
const tones = ['Professional', 'Luxury', 'Minimal', 'Bold', 'Friendly'];
const audiences = ['Recruiters', 'Clients', 'Agencies', 'Investors'];
const draftKey = 'lumina-studio-draft';
const categoryColors = {
  Frontend: 'bg-[#3b82f6]/15 text-blue-100 border-[#3b82f6]/30',
  Backend: 'bg-[#a855f7]/15 text-purple-100 border-[#a855f7]/30',
  Design: 'bg-[#ec4899]/15 text-pink-100 border-[#ec4899]/30',
  DevOps: 'bg-[#3b82f6]/15 text-blue-100 border-[#a855f7]/30',
  Other: 'bg-white/[0.05] text-white/80 border-white/[0.08]'
};

const steps = [
  { id: 1, name: 'Profile' },
  { id: 2, name: 'Skills' },
  { id: 3, name: 'Projects' },
  { id: 4, name: 'AI Strategy' },
  { id: 5, name: 'Template' }
];

const emptyProject = () => ({ id: createId(), title: '', description: '', techStack: '', liveUrl: '', githubUrl: '' });

const PortfolioForm = ({ onComplete, isGenerating, onStepChange }) => {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(() => ({ ...defaultDraft, projects: [emptyProject()] }));
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Frontend');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draggedProject, setDraggedProject] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) setHasSavedDraft(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    onStepChange(step);
  }, [onStepChange, step]);

  const quality = useMemo(() => calculateQuality(draft), [draft]);

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const resumeDraft = () => {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    setDraft({ ...defaultDraft, projects: [emptyProject()], ...parsed });
    setHasSavedDraft(false);
  };

  const resetDraft = () => {
    localStorage.removeItem(draftKey);
    setDraft({ ...defaultDraft, projects: [emptyProject()] });
    setHasSavedDraft(false);
  };

  const addSkill = () => {
    const next = skillName.trim();
    if (!next || (draft.skills || []).some((skill) => skill.name.toLowerCase() === next.toLowerCase())) return;
    updateDraft({ skills: [...(draft.skills || []), { name: next, category: skillCategory }] });
    setSkillName('');
  };

  const updateProject = (id, field, value) => {
    updateDraft({ projects: (draft.projects || []).map((project) => project.id === id ? { ...project, [field]: value } : project) });
  };

  const reorderProject = (targetId) => {
    if (!draggedProject || draggedProject === targetId) return;
    const projects = [...(draft.projects || [])];
    const from = projects.findIndex((project) => project.id === draggedProject);
    const to = projects.findIndex((project) => project.id === targetId);
    const [moved] = projects.splice(from, 1);
    projects.splice(to, 0, moved);
    updateDraft({ projects });
  };

  const completed = {
    1: Boolean(draft.name && draft.title && draft.email),
    2: (draft.skills || []).length >= 3,
    3: (draft.projects || []).some((project) => project.title && project.description),
    4: Boolean(draft.tone && draft.audience),
    5: Boolean(draft.template && draft.plan)
  };

  const canGenerate = completed[1] && completed[3];

  const submit = () => {
    const payload = {
      ...draft,
      projects: (draft.projects || []).map(({ id, ...project }) => project).filter((project) => project.title.trim()),
      qualityScore: quality.score,
      suggestions: quality.suggestions
    };
    onComplete(payload);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <motion.aside
        whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="h-fit rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="font-bold text-white">Builder progress</p>
          <span className="rounded-full bg-[#a855f7]/15 px-3 py-1 text-sm font-bold text-[#c084fc]">{quality.score}/100</span>
        </div>
        <div className="space-y-2">
          {steps.map((item) => (
            <button key={item.id} type="button" onClick={() => setStep(item.id)} className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left transition ${step === item.id ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white/50 hover:bg-white/[0.08] hover:text-white'}`}>
              <span>{item.name}</span>
              {completed[item.id] && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
          <p className="text-sm font-bold text-white">Quality suggestions</p>
          {quality.suggestions.length ? (
            <div className="mt-3 space-y-2 text-sm text-white/50">
              {quality.suggestions.map((suggestion) => <p key={suggestion}>- {suggestion}</p>)}
            </div>
          ) : <p className="mt-3 text-sm text-[#c084fc]">Looks strong. Ready for AI polish.</p>}
        </div>
      </motion.aside>

      <motion.section
        whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 backdrop-blur-xl sm:p-8"
      >
        {hasSavedDraft && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#a855f7]/15 via-[#3b82f6]/15 to-[#ec4899]/15 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-white">A saved draft is available. Resume it or keep your current session.</p>
            <div className="flex gap-2">
              <button type="button" onClick={resumeDraft} className="btn-primary rounded-full px-4 py-2 font-bold">Resume draft</button>
              <button type="button" onClick={resetDraft} className="rounded-full border border-white/[0.08] px-4 py-2 font-bold text-white"><RotateCcw className="mr-1 inline h-4 w-4" />Reset</button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="profile" initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-sm font-bold text-[#c084fc]">Step 1</p>
                <h2 className="text-3xl font-black text-white">Position your work clearly.</h2>
                <p className="mt-2 text-white/50">Strong portfolios start with trust signals: name, role, contact, and where you can be verified.</p>
              </div>
              {[
                ['name', 'Full name'], ['title', 'Title or role'], ['location', 'Location'], ['email', 'Email'],
                ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL'], ['photoUrl', 'Profile photo URL']
              ].map(([field, label]) => (
                <label key={field} className="grid gap-2 text-sm font-semibold text-white/50">
                  {label}
                  <input value={draft[field] || ''} onChange={(event) => updateDraft({ [field]: event.target.value })} className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white" />
                </label>
              ))}
              <label className="grid gap-2 text-sm font-semibold text-white/50 md:col-span-2">
                Bio notes <span className="font-normal text-white/40">{(draft.bioNotes || '').length}/700</span>
                <textarea value={draft.bioNotes || ''} onChange={(event) => updateDraft({ bioNotes: event.target.value.slice(0, 700) })} rows="5" className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white" />
              </label>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="skills" initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div>
                <p className="text-sm font-bold text-[#c084fc]">Step 2</p>
                <h2 className="text-3xl font-black text-white">Add credibility signals.</h2>
                <p className="mt-2 text-white/50">Group skills so AI can present you as a specialist instead of a generic list.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <input value={skillName} onChange={(event) => setSkillName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} placeholder="Type skill and press Enter" className="focus-ring rounded-full border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white" />
                <select value={skillCategory} onChange={(event) => setSkillCategory(event.target.value)} className="focus-ring rounded-full border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white">
                  {categories.map((category) => <option className="bg-ink" key={category}>{category}</option>)}
                </select>
                <button type="button" onClick={addSkill} className="btn-primary rounded-full px-5 py-3 font-bold"><Plus className="mr-1 inline h-4 w-4" />Add</button>
              </div>
              <div className="flex min-h-20 flex-wrap gap-3 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4">
                {(draft.skills || []).length === 0 && <p className="text-white/50">Your skill tags will appear here.</p>}
                {(draft.skills || []).map((skill) => (
                  <motion.button layout={!reduceMotion} key={skill.name} type="button" onClick={() => updateDraft({ skills: (draft.skills || []).filter((item) => item.name !== skill.name) })} whileHover={reduceMotion ? undefined : { scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} className={`rounded-full border px-4 py-2 ${categoryColors[skill.category]}`}>
                    {skill.name} <X className="ml-2 inline h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="projects" initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-4">
              <div>
                <p className="text-sm font-bold text-[#c084fc]">Step 3</p>
                <h2 className="text-3xl font-black text-white">Show proof, then reorder by impact.</h2>
                <p className="mt-2 text-white/50">Drag cards to change the story. Put the project with the strongest outcome first.</p>
              </div>
              <AnimatePresence>
                {(draft.projects || []).map((project, index) => (
                  <motion.div
                    layout={!reduceMotion}
                    draggable
                    onDragStart={() => setDraggedProject(project.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => reorderProject(project.id)}
                    key={project.id}
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    whileHover={reduceMotion ? undefined : { y: -8, boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}
                    className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-white/40" aria-hidden="true" />
                        <h3 className="font-bold">Project {index + 1}</h3>
                      </div>
                      <button type="button" onClick={() => updateDraft({ projects: (draft.projects || []).filter((item) => item.id !== project.id) })} className="rounded-full p-2 hover:bg-white/10" aria-label="Remove project"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {['title', 'techStack', 'liveUrl', 'githubUrl'].map((field) => <input key={field} value={project[field]} onChange={(event) => updateProject(project.id, field, event.target.value)} placeholder={field.replace(/([A-Z])/g, ' $1')} className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white" />)}
                      <textarea value={project.description} onChange={(event) => updateProject(project.id, 'description', event.target.value)} placeholder="Result-driven description" className="focus-ring rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 px-4 py-3 text-white md:col-span-2" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button disabled={(draft.projects || []).length >= 5} type="button" onClick={() => updateDraft({ projects: [...(draft.projects || []), emptyProject()] })} className="rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white disabled:opacity-40"><Plus className="mr-1 inline h-4 w-4" />Add Project</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="strategy" initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div>
                <p className="text-sm font-bold text-[#c084fc]">Step 4</p>
                <h2 className="text-3xl font-black text-white">Tell AI who this is for.</h2>
                <p className="mt-2 text-white/50">Tone and audience create sharper output than a generic prompt.</p>
              </div>
              <div>
                <h3 className="mb-3 font-bold text-white">Tone</h3>
                <div className="flex flex-wrap gap-2">
                  {tones.map((tone) => <button key={tone} type="button" onClick={() => updateDraft({ tone })} className={`rounded-full px-4 py-2 font-semibold ${draft.tone === tone ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white/50'}`}>{tone}</button>)}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-bold text-white">Audience</h3>
                <div className="flex flex-wrap gap-2">
                  {audiences.map((audience) => <button key={audience} type="button" onClick={() => updateDraft({ audience })} className={`rounded-full px-4 py-2 font-semibold ${draft.audience === audience ? 'btn-primary' : 'bg-[rgba(255,255,255,0.05)] text-white/50'}`}>{audience}</button>)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/60 p-5">
                <p className="font-bold text-white">Upgrade nudge</p>
                <p className="mt-2 leading-7 text-white/50">Free portfolios include a watermark. Pro unlocks no-watermark HTML export; Studio is ready for client portfolio delivery.</p>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="template" initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="space-y-6">
              <div>
                <p className="text-sm font-bold text-[#c084fc]">Step 5</p>
                <h2 className="text-3xl font-black text-white">Pick the product surface.</h2>
                <p className="mt-2 text-white/50">You can change templates again in preview, but this helps AI recommend structure.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {templates.map((template) => <button key={template.id} type="button" onClick={() => updateDraft({ template: template.id, layout: template.id })} className={`rounded-2xl border p-4 text-left ${draft.template === template.id ? 'border-[#a855f7] bg-[#a855f7]/15' : 'border-white/[0.08] bg-[#0a0a0f]/60'}`}><span className="font-bold text-white">{template.name}</span><span className="mt-1 block text-sm text-white/50">{template.description}</span></button>)}
              </div>
              <div>
                <h3 className="mb-3 font-bold text-white">Plan</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.values(plans).map((plan) => <button key={plan.id} type="button" onClick={() => updateDraft({ plan: plan.id })} className={`rounded-2xl border p-4 text-left ${draft.plan === plan.id ? 'border-[#a855f7] bg-gradient-to-r from-[#a855f7]/20 via-[#3b82f6]/20 to-[#ec4899]/20 text-white' : 'border-white/[0.08] bg-[#0a0a0f]/60 text-white'}`}><span className="font-bold">{plan.name}</span><span className="mt-1 block text-sm opacity-70">{plan.price}/{plan.cadence}</span></button>)}
                </div>
              </div>
              <button type="button" disabled={!canGenerate || isGenerating} onClick={submit} className="btn-primary inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 font-bold disabled:opacity-50">
                <Sparkles className="h-5 w-5" /> Generate with AI <ArrowRight className="h-5 w-5" />
              </button>
              {!canGenerate && <p className="text-center text-sm text-amber-200">Add profile basics and at least one project to generate.</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} className="rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white">Back</button>
          {step < 5 && <button type="button" onClick={() => setStep((current) => Math.min(5, current + 1))} className="btn-primary rounded-full px-5 py-3 font-bold">Next</button>}
        </div>
      </motion.section>
    </div>
  );
};

PortfolioForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  onStepChange: PropTypes.func
};

PortfolioForm.defaultProps = {
  onStepChange: () => {}
};

export default PortfolioForm;
