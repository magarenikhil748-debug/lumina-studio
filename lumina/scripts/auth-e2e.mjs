import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT || 9333);
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

const chromePath = CHROME_PATHS.find((candidate) => fs.existsSync(candidate));
if (!chromePath) {
  throw new Error('Chrome or Edge executable was not found. Set CHROME_PATH to run browser auth tests.');
}

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumina-auth-e2e-'));
const email = `auth-ui-${Date.now()}@lumina.test`;
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
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.id;
    this.id += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  close() {
    this.ws?.close();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (predicate, label, timeout = 10000) => {
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeout) {
    lastValue = await predicate();
    if (lastValue) return lastValue;
    await sleep(180);
  }
  throw new Error(`${label} timed out${lastValue ? `: ${JSON.stringify(lastValue)}` : ''}`);
};

const waitForChrome = async () => waitFor(async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}, 'Chrome debug endpoint', 12000);

const createPage = async () => {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Could not create Chrome page: ${response.status}`);
  const target = await response.json();
  const cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  return cdp;
};

const evaluate = async (cdp, fn, ...args) => {
  const expression = `(${fn})(...${JSON.stringify(args)})`;
  const result = await cdp.send('Runtime.evaluate', {
    expression,
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

const clearBrowserState = async (cdp) => {
  await cdp.send('Network.clearBrowserCookies');
  await evaluate(cdp, () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      return true;
    }
    return true;
  });
};

const fillInput = (name, value) => {
  const input = document.querySelector(`input[name="${name}"]`);
  if (!input) throw new Error(`Missing input ${name}`);
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};

const hasInput = (name) => Boolean(document.querySelector(`input[name="${name}"]`));

const setCheckbox = (name, checked) => {
  const input = document.querySelector(`input[name="${name}"]`);
  if (!input) throw new Error(`Missing checkbox ${name}`);
  if (input.checked !== checked) input.click();
  return true;
};

const clickButton = (text, position = 'last') => {
  const normalized = (value) => value.replace(/\s+/g, ' ').trim();
  const buttons = Array.from(document.querySelectorAll('button, a')).filter((button) => normalized(button.textContent).includes(text));
  if (!buttons.length) throw new Error(`No button/link found for ${text}`);
  const target = position === 'first' ? buttons[0] : buttons[buttons.length - 1];
  target.click();
  return { count: buttons.length, clicked: normalized(target.textContent) };
};

const hasButton = (text) => {
  const normalized = (value) => value.replace(/\s+/g, ' ').trim();
  return Array.from(document.querySelectorAll('button, a')).some((button) => normalized(button.textContent).includes(text));
};

const pageState = () => ({
  url: window.location.href,
  text: document.body?.textContent?.replace(/\s+/g, ' ').trim() || '',
  hasAvatarMenu: Boolean(document.querySelector('button[aria-haspopup="menu"]'))
});

const submitRegister = async (cdp, userEmail, userPassword) => {
  await waitFor(() => evaluate(cdp, hasInput, 'name'), 'register form');
  await evaluate(cdp, fillInput, 'name', 'Auth Ui Tester');
  await evaluate(cdp, fillInput, 'email', userEmail);
  await evaluate(cdp, fillInput, 'password', userPassword);
  await evaluate(cdp, fillInput, 'confirmPassword', userPassword);
  await evaluate(cdp, setCheckbox, 'terms', true);
  await evaluate(cdp, clickButton, 'Create Account', 'last');
};

const submitLogin = async (cdp, userEmail, userPassword) => {
  await waitFor(() => evaluate(cdp, hasInput, 'email'), 'login form');
  await evaluate(cdp, fillInput, 'email', userEmail);
  await evaluate(cdp, fillInput, 'password', userPassword);
  await evaluate(cdp, clickButton, 'Sign In', 'last');
};

const record = async (name, action, expected, assertion) => {
  try {
    const details = await action();
    const passed = await assertion(details);
    results.push({ name, expected, passed: Boolean(passed), details });
  } catch (error) {
    results.push({ name, expected, passed: false, details: error.message });
  }
};

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

  await record('Register', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/login?mode=create`);
    await submitRegister(cdp, email, password);
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('/dashboard') ? state : null), 'register redirect');
  }, 'Redirects to /dashboard', (state) => state.url.includes('/dashboard'));

  await record('Duplicate email', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/login?mode=create`);
    await submitRegister(cdp, email, password);
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.text.includes('Email already registered') ? state : null), 'duplicate email toast');
  }, 'Toast "Email already registered"', (state) => state.text.includes('Email already registered'));

  await record('Weak password', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/login?mode=create`);
    await submitRegister(cdp, `weak-${email}`, 'abc123');
    await sleep(500);
    return evaluate(cdp, pageState);
  }, 'Form error before submit', (state) => state.url.includes('/login') && state.text.includes('Use 8+ chars'));

  await record('Login wrong password', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/login`);
    await submitLogin(cdp, email, 'Wrong@12345');
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.text.includes('Invalid credentials') ? state : null), 'wrong password toast');
  }, 'Toast "Invalid credentials"', (state) => state.text.includes('Invalid credentials'));

  await record('Login correct', async () => {
    await navigate(cdp, `${FRONTEND_URL}/login`);
    await submitLogin(cdp, email, password);
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('/dashboard') ? state : null), 'login redirect');
  }, 'Redirects to /dashboard', (state) => state.url.includes('/dashboard'));

  await record('Stay logged in', async () => {
    await cdp.send('Page.reload');
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('/dashboard') && state.text.includes('Welcome back') ? state : null), 'session persistence');
  }, 'Still logged in', (state) => state.url.includes('/dashboard') && state.text.includes('Welcome back'));

  await record('Protected route', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/dashboard`);
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('/login') ? state : null), 'protected route redirect');
  }, 'Redirects to /login', (state) => state.url.includes('/login'));

  await record('Redirect back', async () => {
    await submitLogin(cdp, email, password);
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('/dashboard') ? state : null), 'redirect back to dashboard');
  }, 'Goes back to /dashboard', (state) => state.url.includes('/dashboard'));

  await record('Logout', async () => {
    await evaluate(cdp, () => {
      const menu = document.querySelector('button[aria-haspopup="menu"]');
      if (!menu) throw new Error('Avatar menu button missing');
      menu.click();
      return true;
    });
    await sleep(250);
    await evaluate(cdp, clickButton, 'Logout', 'last');
    const state = await waitFor(() => evaluate(cdp, pageState).then((current) => current.url === `${FRONTEND_URL}/` ? current : null), 'logout home redirect');
    const authStatus = await evaluate(cdp, async (backendUrl) => {
      const response = await fetch(`${backendUrl}/api/auth/me`, { credentials: 'include' });
      return response.status;
    }, BACKEND_URL);
    return { ...state, authStatus };
  }, 'Redirects to home, cookie cleared', (state) => state.url === `${FRONTEND_URL}/` && state.authStatus === 401);

  await record('Google OAuth', async () => {
    await clearBrowserState(cdp);
    await navigate(cdp, `${FRONTEND_URL}/login`);
    await waitFor(() => evaluate(cdp, hasButton, 'Continue with Google'), 'Google button');
    await evaluate(cdp, clickButton, 'Continue with Google', 'last');
    return waitFor(() => evaluate(cdp, pageState).then((state) => state.url.includes('accounts.google.com') ? state : null), 'Google OAuth screen');
  }, 'Google screen appears', (state) => state.url.includes('accounts.google.com'));
} finally {
  cdp?.close();
  chrome.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  } catch {
    // Windows can briefly hold Chrome profile files after process shutdown.
  }
}

console.table(results.map((result) => ({
  Test: result.name,
  Result: result.passed ? 'PASS' : 'FAIL',
  Expected: result.expected,
  Observed: typeof result.details === 'string' ? result.details : result.details.url || result.details.text?.slice(0, 90)
})));

const failed = results.filter((result) => !result.passed);
if (failed.length) {
  console.error(JSON.stringify(failed, null, 2));
  process.exit(1);
}
