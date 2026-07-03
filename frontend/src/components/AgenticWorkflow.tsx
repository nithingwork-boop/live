import { Box, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react'

// Simple visual of an agentic flow with current status
const Step = ({title, status}:{title:string,status:'queued'|'running'|'done'|'blocked'}) => (
  <HStack spacing={3}>
    <Badge colorScheme={status==='done'?'green':status==='running'?'blue':status==='blocked'?'red':'gray'}>{status}</Badge>
    <Text>{title}</Text>
  </HStack>
)

export function AgenticWorkflow(){
  return (
    <Box>
      <Heading size='md' mb={4}>Tagging Enforcement (Temporal)</Heading>
      <VStack align='stretch' spacing={2}>
        <Step title='Detect non-compliant resources (>2%)' status='running' />
        <Step title='Create PRs and tickets' status='queued' />
        <Step title='Apply virtual tags (backfill)' status='queued' />
        <Step title='Gate deployments via policy' status='queued' />
        <Step title='Owner approval & auto-remediate' status='queued' />
      </VStack>
      <Heading size='md' mt={8} mb={4}>Idle Cleanup</Heading>
      <VStack align='stretch' spacing={2}>
        <Step title='Identify idle for 72h' status='done' />
        <Step title='Snapshot & stop' status='running' />
        <Step title='Delete after 24h hold (no access)' status='queued' />
      </VStack>
    </Box>
  )
}
