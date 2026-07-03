import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} hasArrow>
      <IconButton
        aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        size="sm"
        variant="ghost"
        onClick={toggleColorMode}
      />
    </Tooltip>
  );
}
