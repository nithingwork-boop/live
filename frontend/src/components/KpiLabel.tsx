import { forwardRef } from 'react';
import { HStack, Icon, StatLabel, Tooltip } from '@chakra-ui/react';

const InfoIcon = forwardRef<SVGSVGElement, Record<string, unknown>>((props, ref) => (
  <Icon viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
    />
  </Icon>
));
InfoIcon.displayName = 'InfoIcon';

export function KpiLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <HStack spacing={1}>
      <StatLabel mb={0} fontSize="xs" color="gray.500">
        {label}
      </StatLabel>
      <Tooltip label={tip} hasArrow placement="top">
        <Icon
          as={InfoIcon}
          color="gray.400"
          w={4}
          h={4}
          cursor="help"
          aria-label={`About ${label}`}
          tabIndex={0}
        />
      </Tooltip>
    </HStack>
  );
}
