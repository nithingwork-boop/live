// In-memory Database integration for FinOps platform (reverted from SQLite)
import {
  generateCosts,
  generateAnomalies,
  generateAIAnomalies,
  generateRecommendations,
  generateAIRecommendations,
  generateWorkflows,
  generateKPIs,
  generateAuditTrail,
  generateAllocationStats,
  generateSoftwareInventory,
  generateContractsPayload,
} from './mock-data';

// Initialize mock data in-memory on startup
const mockCosts = generateCosts(365 * 5); // 5 years of costs

const standardRecs = generateRecommendations();
const aiRecs = generateAIRecommendations();
const mockRecommendations = [
  ...standardRecs.map((r) => ({ ...r, scope: 'cloud' })),
  ...aiRecs.map((r) => ({ ...r, scope: 'ai' })),
];

const standardAnomalies = generateAnomalies();
const aiAnomalies = generateAIAnomalies();
const mockAnomalies = [
  ...standardAnomalies.map((a) => ({ ...a, scope: 'cloud', amount: a.cost_amount ?? a.amount ?? 0 })),
  ...aiAnomalies.map((a) => ({ ...a, scope: 'ai', amount: a.cost_amount ?? a.amount ?? 0 })),
];

const mockWorkflows = generateWorkflows();
const mockSoftwareInventory = generateSoftwareInventory();
const contractsData = generateContractsPayload();

const mockContracts = contractsData.contracts;
const mockContractOptimizations = contractsData.optimizations;
const mockContractSummary = contractsData.summary;

const mockAuditTrail = generateAuditTrail();
const mockKPIs = generateKPIs();
const mockAllocationStats = generateAllocationStats();

// General DB helpers for application query integration
export const database = {
  // Query all costs matching filter
  getCosts(): any[] {
    return mockCosts;
  },

  // Recommendations methods
  getRecommendations(scope?: string): any[] {
    if (scope) {
      return mockRecommendations.filter((r) => r.scope === scope);
    }
    return mockRecommendations;
  },

  getRecommendationById(id: string): any {
    return mockRecommendations.find((r) => r.id === id) || null;
  },

  updateRecommendationStatus(id: string, status: string, approvedAt?: string): boolean {
    const rec = mockRecommendations.find((r) => r.id === id);
    if (rec) {
      rec.status = status;
      if (approvedAt !== undefined) {
        rec.approved_at = approvedAt;
      }
      return true;
    }
    return false;
  },

  approveRecommendation(id: string, implementationWorkflow?: any): any {
    const rec = mockRecommendations.find((r) => r.id === id);
    if (rec) {
      rec.status = 'approved';
      rec.approved_at = new Date().toISOString();
      if (implementationWorkflow !== undefined) {
        rec.implementation_workflow = implementationWorkflow;
      }
      return rec;
    }
    return null;
  },

  resetRecommendations(scope?: string): void {
    const freshStandard = generateRecommendations();
    const freshAI = generateAIRecommendations();
    const freshRecs = [
      ...freshStandard.map((r) => ({ ...r, scope: 'cloud' })),
      ...freshAI.map((r) => ({ ...r, scope: 'ai' })),
    ];
    if (scope) {
      for (let i = mockRecommendations.length - 1; i >= 0; i--) {
        if (mockRecommendations[i].scope === scope) {
          mockRecommendations.splice(i, 1);
        }
      }
      mockRecommendations.push(...freshRecs.filter((r) => r.scope === scope));
    } else {
      mockRecommendations.length = 0;
      mockRecommendations.push(...freshRecs);
    }
  },

  // Anomalies methods
  getAnomalies(scope?: string): any[] {
    if (scope) {
      return mockAnomalies.filter((a) => a.scope === scope);
    }
    return mockAnomalies;
  },

  getAnomalyById(id: string): any {
    return mockAnomalies.find((a) => a.id === id) || null;
  },

  updateAnomalyStatus(id: string, status: string, resolutionType?: string): boolean {
    const anom = mockAnomalies.find((a) => a.id === id);
    if (anom) {
      anom.status = status;
      if (resolutionType !== undefined) {
        anom.resolution_type = resolutionType;
      }
      return true;
    }
    return false;
  },

  resolveAnomaly(id: string, resolutionType?: string): any {
    const anom = mockAnomalies.find((a) => a.id === id);
    if (anom) {
      anom.status = 'resolved';
      if (resolutionType !== undefined) {
        anom.resolution_type = resolutionType;
      }
      return anom;
    }
    return null;
  },

  resetAnomalies(scope?: string): void {
    const freshStandard = generateAnomalies();
    const freshAI = generateAIAnomalies();
    const freshAnoms = [
      ...freshStandard.map((a) => ({ ...a, scope: 'cloud', amount: a.cost_amount ?? a.amount ?? 0 })),
      ...freshAI.map((a) => ({ ...a, scope: 'ai', amount: a.cost_amount ?? a.amount ?? 0 })),
    ];
    if (scope) {
      for (let i = mockAnomalies.length - 1; i >= 0; i--) {
        if (mockAnomalies[i].scope === scope) {
          mockAnomalies.splice(i, 1);
        }
      }
      mockAnomalies.push(...freshAnoms.filter((a) => a.scope === scope));
    } else {
      mockAnomalies.length = 0;
      mockAnomalies.push(...freshAnoms);
    }
  },

  // Workflows methods
  getWorkflows(): any[] {
    return mockWorkflows;
  },

  getWorkflowById(id: string): any {
    return mockWorkflows.find((w) => w.id === id) || null;
  },

  // Software Inventory methods
  getSoftwareInventory(): any[] {
    return mockSoftwareInventory;
  },

  // Contracts methods
  getContractsPayload(): any {
    return {
      contracts: mockContracts,
      optimizations: mockContractOptimizations,
      summary: mockContractSummary,
    };
  },

  // Audit methods
  getAuditTrail(): any[] {
    return mockAuditTrail;
  },

  getAuditTrailById(id: string): any {
    return mockAuditTrail.find((a) => a.id === id) || null;
  },

  // KPIs methods
  getKPIs(): any {
    return mockKPIs;
  },

  // Allocation Stats methods
  getAllocationStats(): any {
    return mockAllocationStats;
  },
};
