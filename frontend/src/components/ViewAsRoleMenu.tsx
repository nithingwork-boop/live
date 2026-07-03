import {
  Badge,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, ViewIcon } from '@chakra-ui/icons';
import { ROLES } from '../config/roles';
import { useRoleAccess } from '../contexts/RoleContext';

export function ViewAsRoleMenu() {
  const { viewAsRoleId, role, setViewAsRoleId } = useRoleAccess();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        variant="outline"
        leftIcon={<ViewIcon />}
        rightIcon={<ChevronDownIcon />}
      >
        View as: {role.label}
      </MenuButton>
      <MenuList maxH="360px" overflowY="auto" minW="280px">
        <Text px={3} py={2} fontSize="xs" fontWeight="semibold" color={muted} textTransform="uppercase">
          Role
        </Text>
        <MenuDivider my={0} />
        {ROLES.map((r) => (
          <MenuItem
            key={r.id}
            onClick={() => setViewAsRoleId(r.id)}
            bg={r.id === viewAsRoleId ? activeBg : undefined}
            flexDirection="column"
            alignItems="flex-start"
            py={2}
          >
            <HStack align="center" spacing={3} w="full">
              <Text fontWeight={r.id === viewAsRoleId ? 'semibold' : 'normal'} flex={1}>
                {r.label}
              </Text>
              {r.readOnly && (
                <Badge colorScheme="orange" fontSize="2xs">
                  Read-only
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color={muted} mt={0.5} noOfLines={2}>
              {r.description}
            </Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
