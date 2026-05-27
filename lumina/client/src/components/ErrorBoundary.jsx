import { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 py-16 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-8 text-center shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/[0.1] bg-[#0a0a0f]/70 text-[#c4b5fd]">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="gradient-text mt-6 font-display text-4xl font-black">We hit a small snag.</h1>
          <p className="mt-3 leading-7 text-white/60">
            Your workspace is safe. Refresh Lumina Studio or head home and continue from your saved draft.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={this.handleReload} className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
            </button>
            <Link className="inline-flex items-center justify-center rounded-full border border-white/[0.08] px-5 py-3 font-bold text-white hover:bg-white/[0.06]" to="/">
              Go home
            </Link>
          </div>
        </section>
      </main>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
