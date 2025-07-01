import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconProps = {
  iconName: keyof typeof LucideIcons;
  size?: number | string;
  color?: string;
  className?: string;
  [x: string]: any;
};

/**
 * Icon wrapper for Lucide icons. Usage:
 * <Icon iconName="Star" size={20} color="#333" />
 */
export const Icon: React.FC<IconProps> = ({
  iconName,
  size = 20,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  const LucideIcon = LucideIcons[iconName];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} className={className} {...props} />;
};

export default Icon;
