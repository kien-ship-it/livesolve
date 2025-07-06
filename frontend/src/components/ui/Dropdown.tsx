import React, { useState, useRef, useEffect } from 'react';

export type DropdownItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type DropdownProps = {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <div onClick={() => setOpen((v) => !v)} tabIndex={0} role="button" aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute z-20 min-w-[160px] mt-2 rounded-md shadow-lg bg-white border border-neutral-100 py-1 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                item.disabled ? 'cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              disabled={item.disabled}
              role="menuitem"
              tabIndex={0}
            >
              {item.icon && <span className="mr-2 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown; 