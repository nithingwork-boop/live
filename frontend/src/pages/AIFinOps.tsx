import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { ScopeDashboard } from '../components/ScopeDashboard';

export default function AIFinOps() {
  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Summary</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <ScopeDashboard
              scope="ai"
              title="AI FinOps"
              subtitle="GenAI and ML workloads: LLM APIs, GPU/accelerators, AI PaaS, and agent workflows."
              kpiLabels={{
                totalSpend: 'Total Spend (30d)',
                allocation: 'Allocation Coverage',
                waste: 'Waste %',
                savings: 'Savings Pipeline',
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
