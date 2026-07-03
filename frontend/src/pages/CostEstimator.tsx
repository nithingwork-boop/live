import { Box, Heading, Text, Card, CardBody, useColorModeValue } from '@chakra-ui/react';

export default function CostEstimator() {
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box>
      <Heading size="lg" mb={2}>Cost Estimator (AI Non‑Manpower)</Heading>
      <Text color={muted} mb={6}>
        E0 (AUoW cost bands) and E1 (per‑agent/workflow) estimators. Phase 4.
      </Text>
      <Card bg={bg}>
        <CardBody>
          <Text color={muted}>
            E0 and E1 estimator UIs will be implemented in Phase 4.
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
