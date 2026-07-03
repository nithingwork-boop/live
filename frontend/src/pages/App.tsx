import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { FinOpsProvider } from '../contexts/FinOpsContext';
import { RoleProvider } from '../contexts/RoleContext';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Login from './Login';
import Overview from './Overview';
import AISpendOpsLayout from './ai/AISpendOpsLayout';
import AISpendOpsHome from './ai/AISpendOpsHome';
import AIModelsProviders from './ai/AIModelsProviders';
import AIWorkflowsAgents from './ai/AIWorkflowsAgents';
import AIGPUInfra from './ai/AIGPUInfra';
import AIBudgets from './ai/AIBudgets';
import AIShowChargeback from './ai/AIShowChargeback';
import AIAttribution from './ai/AIAttribution';
import AIObservability from './ai/AIObservability';
import Anomalies from './Anomalies';
import Workflows from './Workflows';
import Recommendations from './Recommendations';
import { AIIntegrationsPage } from './DataIngestion';
import IntegrationsLayout from './IntegrationsLayout';
import Admin from './Admin';
import Software from './software/Software';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <FinOpsProvider>
                <RoleProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/cloud/*" element={<Navigate to="/ai/home" replace />} />
                    <Route path="/onprem" element={<Navigate to="/" replace />} />
                    <Route path="/ai" element={<AISpendOpsLayout />}>
                      <Route index element={<Navigate to="home" replace />} />
                      <Route path="home" element={<AISpendOpsHome />} />
                      <Route path="models" element={<AIModelsProviders />} />
                      <Route path="workflows" element={<AIWorkflowsAgents />} />
                      <Route path="observability" element={<AIObservability />} />
                      <Route path="gpu" element={<AIGPUInfra />} />
                      <Route path="budgets" element={<AIBudgets />} />
                      <Route path="show-chargeback" element={<AIShowChargeback />} />
                      <Route path="attribution" element={<AIAttribution />} />
                      <Route path="budgets-anomalies" element={<Navigate to="/ai/budgets" replace />} />
                      <Route
                        path="anomalies"
                        element={
                          <Anomalies
                            scope="ai"
                            useFinOpsPeriod
                            title="AI Spend Anomalies"
                            subtitle="Detect token spikes, model changes, and retry storms. Resolve with AI agents or human-in-the-loop approval."
                          />
                        }
                      />
                      <Route
                        path="optimization"
                        element={
                          <Recommendations
                            scope="ai"
                            useFinOpsPeriod
                            title="AI Optimization"
                            subtitle="Model tiering, token efficiency, GPU rightsizing, and retry policy improvements for AI workloads."
                          />
                        }
                      />
                    </Route>
                    <Route path="/costs/*" element={<Navigate to="/ai/home" replace />} />
                    <Route path="/cost-estimator" element={<Navigate to="/ai/budgets" replace />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/contracts" element={<Navigate to="/software/contracts" replace />} />
                    <Route path="/anomalies" element={<Navigate to="/ai/anomalies" replace />} />
                    <Route path="/recommendations" element={<Navigate to="/ai/optimization" replace />} />
                    <Route path="/tagging" element={<Navigate to="/ai/attribution" replace />} />
                    <Route path="/software/*" element={<Software />} />
                    <Route path="/data-ingestion" element={<IntegrationsLayout />}>
                      <Route index element={<Navigate to="ai" replace />} />
                      <Route path="cloud" element={<Navigate to="/data-ingestion/ai" replace />} />
                      <Route path="ai" element={<AIIntegrationsPage />} />
                    </Route>
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
                </RoleProvider>
            </FinOpsProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
