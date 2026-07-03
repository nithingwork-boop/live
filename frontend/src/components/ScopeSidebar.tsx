import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';

/** Align with Layout fixed header padding */
const STICKY_TOP = { base: '168px', md: '156px' };
const SIDEBAR_HEIGHT = { base: 'calc(100vh - 168px - 32px)', md: 'calc(100vh - 156px - 32px)' };

export type ScopeNavItem = {
  path: string;
  label: string;
  icon: ElementType;
  isActive?: (pathname: string) => boolean;
};

type ScopeSidebarProps = {
  items: ScopeNavItem[];
  accentColor?: 'blue' | 'purple';
  storageKey?: string;
  widthExpanded?: number;
  widthCollapsed?: number;
};

function defaultIsActive(pathname: string, path: string, isHome?: boolean) {
  if (isHome) return pathname === path || pathname === path.replace('/home', '');
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function ScopeSidebar({
  items,
  accentColor = 'blue',
  storageKey = 'scope-sidebar',
  widthExpanded = 260,
  widthCollapsed = 56,
}: ScopeSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === 'collapsed';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
  }, [collapsed, storageKey]);

  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue(`${accentColor}.50`, `${accentColor}.900`);
  const activeColor = useColorModeValue(`${accentColor}.600`, `${accentColor}.300`);
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.400');

  const width = collapsed ? widthCollapsed : widthExpanded;

  return (
    <Box
      position="sticky"
      top={STICKY_TOP}
      alignSelf="flex-start"
      flexShrink={0}
      w={`${width}px`}
      h={SIDEBAR_HEIGHT}
      minH={SIDEBAR_HEIGHT}
      maxH={SIDEBAR_HEIGHT}
      display="flex"
      flexDirection="column"
      bg={sidebarBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={2}
      transition="width 0.2s ease"
    >
      <VStack
        align="stretch"
        spacing={1}
        flex={1}
        minH={0}
        overflowY="auto"
        overflowX="hidden"
      >
        {items.map(({ path, label, icon, isActive: isActiveFn }) => {
          const isHome = path.endsWith('/home');
          const isActive = isActiveFn
            ? isActiveFn(location.pathname)
            : defaultIsActive(location.pathname, path, isHome);

          const link = (
            <Flex
              as={RouterLink}
              to={path}
              align="center"
              gap={3}
              px={collapsed ? 2 : 3}
              py={2.5}
              borderRadius="md"
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : 'inherit'}
              fontWeight={isActive ? 'semibold' : 'normal'}
              borderLeft="3px solid"
              borderColor={isActive ? activeColor : 'transparent'}
              _hover={{ bg: isActive ? activeBg : hoverBg, textDecoration: 'none' }}
              justify={collapsed ? 'center' : 'flex-start'}
            >
              <Icon as={icon} boxSize={5} flexShrink={0} />
              {!collapsed && (
                <Box as="span" fontSize="sm" lineHeight="short" noOfLines={2}>
                  {label}
                </Box>
              )}
            </Flex>
          );

          return (
            <Box key={path}>
              {collapsed ? (
                <Tooltip label={label} placement="right" hasArrow openDelay={200} shouldWrapChildren>
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </Box>
          );
        })}
      </VStack>

      <Flex
        flexShrink={0}
        justify={collapsed ? 'center' : 'flex-end'}
        mt="auto"
        pt={2}
        borderTopWidth="1px"
        borderColor={borderColor}
      >
        <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            icon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            color={muted}
            onClick={() => setCollapsed((c) => !c)}
          />
        </Tooltip>
      </Flex>
    </Box>
  );
}

export function ScopePageLayout({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex gap={4} align="flex-start" w="full">
      {sidebar}
      <Box flex={1} minW={0}>
        {children}
      </Box>
    </Flex>
  );
}
