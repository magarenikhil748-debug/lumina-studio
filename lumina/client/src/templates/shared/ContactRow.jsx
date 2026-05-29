import PropTypes from 'prop-types';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';

const ContactRow = ({ portfolio, className = '', linkClassName = '' }) => {
  const items = [
    portfolio.location ? { label: portfolio.location, icon: MapPin } : null,
    portfolio.email ? { label: portfolio.email, href: `mailto:${portfolio.email}`, icon: Mail } : null,
    portfolio.linkedin ? { label: 'LinkedIn', href: portfolio.linkedin, icon: Linkedin } : null,
    portfolio.github ? { label: 'GitHub', href: portfolio.github, icon: Github } : null
  ].filter(Boolean);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </>
        );
        return item.href ? (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${linkClassName}`}
          >
            {content}
          </a>
        ) : (
          <span key={item.label} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${linkClassName}`}>
            {content}
          </span>
        );
      })}
    </div>
  );
};

ContactRow.propTypes = {
  portfolio: PropTypes.shape({
    location: PropTypes.string,
    email: PropTypes.string,
    linkedin: PropTypes.string,
    github: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  linkClassName: PropTypes.string
};

export default ContactRow;
