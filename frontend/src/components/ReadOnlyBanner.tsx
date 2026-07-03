import { Alert, AlertDescription, AlertIcon, AlertTitle, CloseButton, useDisclosure } from '@chakra-ui/react';
import { useRoleAccess } from '../contexts/RoleContext';

export function ReadOnlyBanner() {
  const { isReadOnly, role } = useRoleAccess();
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  if (!isReadOnly || !isOpen) return null;

  return (
    <Alert status="info" variant="left-accent" mb={4} borderRadius="md">
      <AlertIcon />
      <AlertTitle fontSize="sm">Viewing as {role.label}</AlertTitle>
      <AlertDescription fontSize="sm">
        Read-only access for this role.
      </AlertDescription>
      <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={onClose} />
    </Alert>
  );
}
