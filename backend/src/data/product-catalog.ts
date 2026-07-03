// Product catalog with relational structure
// Each product has license cost, usage cost, ServiceType, vendor/CSP, platform

export interface Product {
  id: string;
  name: string;
  vendor: string;
  platform: 'Cloud' | 'On-Prem';
  serviceType: 'SaaS' | 'IaaS' | 'PaaS' | 'COTS' | 'Custom' | 'Open Source';
  // Monthly license cost (for SaaS/subscription products)
  monthlyLicenseCost: number;
  // Usage cost per unit (for pay-as-you-go products)
  usageCostPerUnit: number;
  // Default usage units per month
  defaultUsageUnits: number;
}

export const productCatalog: Product[] = [
  // Microsoft Products
  { id: 'microsoft-office365', name: 'Office 365', vendor: 'Microsoft', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 12.50, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'microsoft-azure', name: 'Azure Services', vendor: 'Microsoft', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.05, defaultUsageUnits: 5000 },
  { id: 'microsoft-teams', name: 'Microsoft Teams', vendor: 'Microsoft', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 5.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'microsoft-sql', name: 'SQL Server', vendor: 'Microsoft', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 1500.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'microsoft-windows', name: 'Windows Server', vendor: 'Microsoft', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 800.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // AWS Products
  { id: 'aws-cloud', name: 'AWS Cloud Services', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.08, defaultUsageUnits: 6000 },
  { id: 'aws-ec2', name: 'EC2', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.10, defaultUsageUnits: 4000 },
  { id: 'aws-s3', name: 'S3', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.023, defaultUsageUnits: 10000 },
  { id: 'aws-rds', name: 'RDS', vendor: 'AWS', platform: 'Cloud', serviceType: 'PaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.15, defaultUsageUnits: 2000 },
  
  // Google Cloud Products
  { id: 'gcp-workspace', name: 'Google Workspace', vendor: 'Google Cloud', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 6.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'gcp-services', name: 'GCP Services', vendor: 'Google Cloud', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.07, defaultUsageUnits: 5500 },
  { id: 'gcp-platform', name: 'Google Cloud Platform', vendor: 'Google Cloud', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.09, defaultUsageUnits: 4500 },
  
  // Oracle Products
  { id: 'oracle-db', name: 'Oracle Database', vendor: 'Oracle', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 2000.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'oracle-oci', name: 'Oracle Cloud Infrastructure', vendor: 'Oracle', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.12, defaultUsageUnits: 3000 },
  { id: 'oracle-java', name: 'Java Enterprise', vendor: 'Oracle', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 500.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // Salesforce Products
  { id: 'salesforce-crm', name: 'Salesforce CRM', vendor: 'Salesforce', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 150.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'salesforce-platform', name: 'Salesforce Platform', vendor: 'Salesforce', platform: 'Cloud', serviceType: 'PaaS', monthlyLicenseCost: 25.00, usageCostPerUnit: 0.02, defaultUsageUnits: 1000 },
  
  // Adobe Products
  { id: 'adobe-creative', name: 'Adobe Creative Cloud', vendor: 'Adobe', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 52.99, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'adobe-acrobat', name: 'Adobe Acrobat', vendor: 'Adobe', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 14.99, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // ServiceNow Products
  { id: 'servicenow-itsm', name: 'ServiceNow ITSM', vendor: 'ServiceNow', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 100.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'servicenow-platform', name: 'ServiceNow Platform', vendor: 'ServiceNow', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 50.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // Splunk Products
  { id: 'splunk-enterprise', name: 'Splunk Enterprise', vendor: 'Splunk', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 150.00, usageCostPerUnit: 0.05, defaultUsageUnits: 500 },
  { id: 'splunk-cloud', name: 'Splunk Cloud', vendor: 'Splunk', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 200.00, usageCostPerUnit: 0.03, defaultUsageUnits: 800 },
  
  // Datadog Products
  { id: 'datadog-apm', name: 'Datadog APM', vendor: 'Datadog', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 31.00, usageCostPerUnit: 0.01, defaultUsageUnits: 2000 },
  { id: 'datadog-infra', name: 'Datadog Infrastructure', vendor: 'Datadog', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 15.00, usageCostPerUnit: 0.005, defaultUsageUnits: 3000 },
  
  // New Relic Products
  { id: 'newrelic-monitoring', name: 'New Relic Monitoring', vendor: 'New Relic', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 25.00, usageCostPerUnit: 0.008, defaultUsageUnits: 2500 },
  { id: 'newrelic-one', name: 'New Relic One', vendor: 'New Relic', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 99.00, usageCostPerUnit: 0.012, defaultUsageUnits: 1500 },
  
  // Atlassian Products
  { id: 'atlassian-jira', name: 'Jira Software', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 7.75, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-jira-sm', name: 'Jira Service Management', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 20.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-confluence', name: 'Confluence', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 5.75, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-bitbucket', name: 'Bitbucket', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 3.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-cloud', name: 'Atlassian Cloud', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 10.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-bamboo', name: 'Bamboo', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 10.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-fisheye', name: 'Fisheye', vendor: 'Atlassian', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 1200.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-crowd', name: 'Crowd', vendor: 'Atlassian', platform: 'On-Prem', serviceType: 'COTS', monthlyLicenseCost: 800.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-sourcetree', name: 'Sourcetree', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'atlassian-opsgenie', name: 'Opsgenie', vendor: 'Atlassian', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 9.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // GitHub Products
  { id: 'github-enterprise', name: 'GitHub Enterprise', vendor: 'GitHub', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 21.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'github-actions', name: 'GitHub Actions', vendor: 'GitHub', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.008, defaultUsageUnits: 4000 },
  
  // Slack Products
  { id: 'slack-enterprise', name: 'Slack Enterprise', vendor: 'Slack', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 12.50, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'slack-business', name: 'Slack Business', vendor: 'Slack', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 8.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // Zoom Products
  { id: 'zoom-business', name: 'Zoom Business', vendor: 'Zoom', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 19.99, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'zoom-enterprise', name: 'Zoom Enterprise', vendor: 'Zoom', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 19.99, usageCostPerUnit: 0.01, defaultUsageUnits: 500 },
  
  // Docker Products
  { id: 'docker-enterprise', name: 'Docker Enterprise', vendor: 'Docker', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 150.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'docker-desktop', name: 'Docker Desktop', vendor: 'Docker', platform: 'Cloud', serviceType: 'SaaS', monthlyLicenseCost: 5.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  
  // VMware Products
  { id: 'vmware-vsphere', name: 'VMware vSphere', vendor: 'VMware', platform: 'On-Prem', serviceType: 'IaaS', monthlyLicenseCost: 1200.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'vmware-cloud', name: 'VMware Cloud', vendor: 'VMware', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.18, defaultUsageUnits: 2500 },
  
  // Homegrown Products
  { id: 'homegrown-analytics', name: 'Internal Analytics Platform', vendor: 'Homegrown', platform: 'On-Prem', serviceType: 'Custom', monthlyLicenseCost: 0, usageCostPerUnit: 0.02, defaultUsageUnits: 1500 },
  { id: 'homegrown-crm', name: 'Custom CRM System', vendor: 'Homegrown', platform: 'On-Prem', serviceType: 'Custom', monthlyLicenseCost: 0, usageCostPerUnit: 0.015, defaultUsageUnits: 2000 },
  { id: 'homegrown-portal', name: 'Enterprise Portal', vendor: 'Homegrown', platform: 'On-Prem', serviceType: 'Custom', monthlyLicenseCost: 0, usageCostPerUnit: 0.025, defaultUsageUnits: 1800 },
  
  // Infrastructure Services (for CSPs)
  { id: 'infra-lambda', name: 'Lambda', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.0000166667, defaultUsageUnits: 1000000 },
  { id: 'infra-cloudwatch', name: 'CloudWatch', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.01, defaultUsageUnits: 5000 },
  { id: 'infra-eks', name: 'EKS', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0.10, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'infra-ecs', name: 'ECS', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.04, defaultUsageUnits: 3000 },
  { id: 'infra-route53', name: 'Route53', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0.50, usageCostPerUnit: 0.0004, defaultUsageUnits: 10000 },
  { id: 'infra-elb', name: 'ELB', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0.0225, usageCostPerUnit: 0.008, defaultUsageUnits: 2000 },
  { id: 'infra-ebs', name: 'EBS', vendor: 'AWS', platform: 'Cloud', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.10, defaultUsageUnits: 1000 },
  { id: 'infra-hyperv', name: 'Hyper-V', vendor: 'Microsoft', platform: 'On-Prem', serviceType: 'IaaS', monthlyLicenseCost: 600.00, usageCostPerUnit: 0, defaultUsageUnits: 0 },
  { id: 'infra-openstack', name: 'OpenStack', vendor: 'Homegrown', platform: 'On-Prem', serviceType: 'IaaS', monthlyLicenseCost: 0, usageCostPerUnit: 0.03, defaultUsageUnits: 1200 },
];

// Helper to get product by name
export function getProductByName(name: string): Product | undefined {
  return productCatalog.find(p => p.name === name);
}

// Helper to get products by vendor
export function getProductsByVendor(vendor: string): Product[] {
  return productCatalog.filter(p => p.vendor === vendor);
}

// Helper to get all unique vendors
export function getAllVendors(): string[] {
  return Array.from(new Set(productCatalog.map(p => p.vendor)));
}

