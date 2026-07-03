import { Icon, useColorModeValue } from '@chakra-ui/react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
}

export function Logo({ size = 32, variant = 'full' }: LogoProps) {
  const iconColor = useColorModeValue('blue.600', 'blue.400');

  const LogoIcon = () => (
    <Icon viewBox="0 0 100 100" width={`${size}px`} height={`${size}px`} color={iconColor}>
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      
      {/* Flowing lines representing data/workflow */}
      <path
        d="M 20 30 Q 35 20, 50 30 T 80 30"
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 20 50 Q 35 40, 50 50 T 80 50"
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 20 70 Q 35 60, 50 70 T 80 70"
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Arrow at the end showing forward movement */}
      <path
        d="M 75 30 L 85 35 L 75 40 Z"
        fill="currentColor"
      />
      <path
        d="M 75 50 L 85 55 L 75 60 Z"
        fill="currentColor"
      />
      <path
        d="M 75 70 L 85 75 L 75 80 Z"
        fill="currentColor"
      />
      
      {/* Circular nodes representing data points */}
      <circle cx="20" cy="30" r="4" fill="currentColor" />
      <circle cx="50" cy="30" r="4" fill="currentColor" />
      <circle cx="20" cy="50" r="4" fill="currentColor" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <circle cx="20" cy="70" r="4" fill="currentColor" />
      <circle cx="50" cy="70" r="4" fill="currentColor" />
    </Icon>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  return (
    <LogoIcon />
  );
}

