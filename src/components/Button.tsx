import React from 'react';

interface ButtonProps {
  label: string;
  primary?: boolean;
  onClick?: () => void;
}

export const Button = ({ label, primary = false, ...props }: ButtonProps) => {
  const mode = primary ? 'btn-primary' : 'btn-secondary';
  return (
    <button type="button" className={`btn ${mode}`} {...props}>
      {label}
    </button>
  );
};
