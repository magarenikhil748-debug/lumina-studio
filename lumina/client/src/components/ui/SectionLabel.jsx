import PropTypes from 'prop-types';

export default function SectionLabel({ children, style = {} }) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        ...style
      }}
    >
      {children}
    </span>
  );
}

SectionLabel.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object
};
