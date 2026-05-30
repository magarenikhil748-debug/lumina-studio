import PropTypes from 'prop-types';
import { useState } from 'react';

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  type = 'text',
  style = {},
  inputStyle = {},
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && (
        <label
          htmlFor={props.id}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: focused ? '#a855f7' : 'rgba(255,255,255,0.5)',
            transition: 'color 0.2s ease'
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: focused ? '#a855f7' : 'rgba(255,255,255,0.3)',
              transition: 'color 0.2s ease',
              pointerEvents: 'none'
            }}
          >
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={{
            width: '100%',
            height: '44px',
            background: 'rgba(255,255,255,0.04)',
            border: error
              ? '1px solid rgba(239,68,68,0.5)'
              : focused
                ? '1px solid rgba(168,85,247,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            padding: `0 ${rightElement ? '44px' : '14px'} 0 ${leftIcon ? '40px' : '14px'}`,
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.1)' : 'none',
            fontFamily: 'inherit',
            ...inputStyle
          }}
          {...props}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: '12px' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{hint}</span>}
    </div>
  );
}

Input.propTypes = {
  error: PropTypes.string,
  hint: PropTypes.string,
  inputStyle: PropTypes.object,
  label: PropTypes.string,
  leftIcon: PropTypes.node,
  rightElement: PropTypes.node,
  style: PropTypes.object,
  type: PropTypes.string
};
