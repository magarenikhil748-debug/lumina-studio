import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT || 9550);
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

const chromePath = CHROME_PATHS.find((candidate) => fs.existsSync(candidate));
if (!chromePath) throw new Error('Chrome or Edge executable was not found. Set CHROME_PATH to run public page tests.');

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumina-public-e2e-'));
const stamp = Date.now();
const email = `public-page-${stamp}@lumina.test`;
const password = 'Test@12345';
const results = [];

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.id;
    this.id += 1;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws?.close();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (predicate, label, timeout = 12000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await predicate();
    if (value) return value;
    await sleep(180);
  }
  throw new Error(`${label} timed out`);
};

const waitForChrome = async () => waitFor(async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}, 'Chrome debug endpoint');

const createPage = async () => {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Could not create Chrome page: ${response.status}`);
  const target = await response.json();
  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return cdp;
};

const evaluate = async (cdp, fn, ...args) => {
  const result = await cdp.send('Runtime.evaluate', {
    expression: `(${fn})(...${JSON.stringify(args)})`,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    const exception = result.exceptionDetails.exception;
    throw new Error(exception?.description || exception?.value || result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result.value;
};

const navigate = async (cdp, url) => {
  await cdp.send('Page.navigate', { url });
  await waitFor(() => evaluate(cdp, (targetUrl) => window.location.href.startsWith(targetUrl), url), `navigation ${url}`);
  await waitFor(() => evaluate(cdp, () => document.readyState === 'complete'), `load ${url}`);
};

const record = async (name, action, assertion) => {
  try {
    const details = await action();
    results.push({ name, passed: Boolean(await assertion(details)), details });
  } catch (error) {
    results.push({ name, passed: false, details: error.message });
  }
};

const api = async (pathName, options = {}) => {
  const response = await fetch(`${BACKEND_URL}${pathName}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${pathName} failed: ${response.status} ${JSON.stringify(data)}`);
  return { response, data };
};

const register = await api('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'Public Page Tester', email, password })
});
const authHeader = { Authorization: `Bearer ${register.data.accessToken}` };
const portfolio = await api('/api/portfolios', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({
    name: 'Public Page Tester',
    title: 'Portfolio Experience Designer',
    location: 'Bengaluru, India',
    email,
    linkedin: 'https://linkedin.com/in/publicpagetester',
    github: 'https://github.com/publicpagetester',
    selectedBio: 'I build public portfolio systems that make creative proof clear, credible, and easy to share.',
    bioVersions: ['I build public portfolio systems that make creative proof clear, credible, and easy to share.'],
    tagline: 'Useful proof, packaged beautifully.',
    skills: [
      { name: 'React', category: 'Frontend' },
      { name: 'Design Systems', category: 'Design' },
      { name: 'Analytics', category: 'Other' }
    ],
    projects: [
      {
        title: 'Public Portfolio System',
        description: 'A share-ready portfolio page with SEO metadata, analytics, and polished layout rendering.',
        techStack: 'React, Express, MongoDB',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/example/repo'
      }
    ],
    layout: 'creative',
    colorPalette: { primary: '#a78bfa', secondary: '#2dd4bf', accent: '#fb7185', bg: '#08080d', text: '#f8fafc' },
    plan: 'free'
  })
});

const slug = portfolio.data.data.slug;
const id = portfolio.data.data.id;
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank'
], { stdio: 'ignore' });

let cdp;
try {
  await waitForChrome();
  cdp = await createPage();

  await record('Public portfolio renders', async () => {
    await navigate(cdp, `${FRONTEND_URL}/p/${slug}`);
    return waitFor(() => evaluate(cdp, () => {
      const images = Array.from(document.querySelectorAll('img')).map((img) => ({
        loading: img.loading,
        width: img.getAttribute('width'),
        height: img.getAttribute('height')
      }));
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        structuredData: Boolean(document.querySelector('script[type="application/ld+json"]')),
        imageDimensionsOk: images.every((image) => image.loading === 'lazy' && image.width && image.height),
        text: document.body.textContent
      };
    }).then((state) => state.h1.includes('Public Page Tester') ? state : null), 'public portfolio content');
  }, (state) => (
    state.title.includes('Public Page Tester')
    && state.canonical === `https://lumina.so/p/${slug}`
    && state.ogTitle.includes('Public Page Tester')
    && state.structuredData
    && state.imageDimensionsOk
    && state.text.includes('Made with Lumina')
  ));

  await record('Invalid public slug renders clean 404', async () => {
    await navigate(cdp, `${FRONTEND_URL}/p/not-a-real-${stamp}`);
    return waitFor(() => evaluate(cdp, () => ({
      h1: document.querySelector('h1')?.textContent || '',
      text: document.body.textContent
    })).then((state) => state.text.includes('Page not found') || state.text.includes('404') ? state : null), '404 page');
  }, (state) => state.text.includes('Page not found') || state.text.includes('404'));
} finally {
  cdp?.close();
  chrome.kill();
  try {
    await api(`/api/portfolios/${id}`, { method: 'DELETE', headers: authHeader });
  } catch {
    // The portfolio may already have been removed during a failed cleanup retry.
  }
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  } catch {
    // Windows can briefly hold Chrome profile files after process shutdown.
  }
}

console.table(results.map((result) => ({
  Test: result.name,
  Result: result.passed ? 'PASS' : 'FAIL',
  Observed: typeof result.details === 'string' ? result.details : result.details.h1 || result.details.title
})));

const failed = results.filter((result) => !result.passed);
if (failed.length) {
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
