import { database } from './db';
import { AI_MODEL_CATALOG, blendedCostPer1k, tierLabel } from './ai-models';
const PROVIDER_SERVICES = {
    OpenAI: 'OpenAI API',
    'Azure OpenAI': 'Azure OpenAI',
    Anthropic: 'Anthropic API',
    'Vertex AI': 'Vertex AI',
    'AWS Bedrock': 'Bedrock',
};
const CATEGORY_SPLIT = [
    { name: 'Training', pct: 18 },
    { name: 'Inference', pct: 62 },
    { name: 'Evaluation', pct: 12 },
    { name: 'Other', pct: 8 },
];
const MODELS_BASE = AI_MODEL_CATALOG.map((m) => ({
    id: m.id,
    model: m.model,
    provider: m.provider,
    service: m.service,
    weight: m.weight,
    promptRatio: m.promptRatio,
    costPer1k: blendedCostPer1k(m),
    latency: m.latency,
    errorRate: m.errorRate,
    tier: tierLabel(m.tier),
    modelType: m.modelType,
    inputPerM: m.inputPerM,
    outputPerM: m.outputPerM,
}));
const WORKFLOWS_BASE = [
    {
        id: '1',
        name: 'Simple Complaint Intake',
        description: 'Single-step intake and routing',
        agents: 'CQ → IC → CA',
        costPerExec: 0.38,
        monthlyVolume: 5500,
        monthlyCost: 2090,
        p50: 0.35,
        p90: 0.45,
        p99: 0.58,
        breakdown: [
            { agent: 'CQ', model: 'GPT-4.1 Nano', costPerIter: 0.08, itersPerCase: 1, costPerCase: 0.08 },
            { agent: 'IC', model: 'GPT-4.1 Nano', costPerIter: 0.1, itersPerCase: 1, costPerCase: 0.1 },
            { agent: 'CA', model: 'GPT-4.1 Nano', costPerIter: 0.2, itersPerCase: 1, costPerCase: 0.2 },
        ],
    },
    {
        id: '2',
        name: 'Escalated Case',
        description: 'Multi-step escalation flow',
        agents: 'CA → CC → CQ',
        costPerExec: 0.52,
        monthlyVolume: 3400,
        monthlyCost: 1768,
        p50: 0.48,
        p90: 0.62,
        p99: 0.78,
        breakdown: [
            { agent: 'CA', model: 'GPT-4.1 Nano', costPerIter: 0.2, itersPerCase: 1, costPerCase: 0.2 },
            { agent: 'CC', model: 'Claude Sonnet 4.6', costPerIter: 0.22, itersPerCase: 1, costPerCase: 0.22 },
            { agent: 'CQ', model: 'GPT-4.1 Nano', costPerIter: 0.1, itersPerCase: 1, costPerCase: 0.1 },
        ],
    },
    {
        id: '3',
        name: 'Document Triage',
        description: 'Batch document classification and routing',
        agents: 'DT → CA',
        costPerExec: 0.24,
        monthlyVolume: 8200,
        monthlyCost: 1968,
        p50: 0.22,
        p90: 0.31,
        p99: 0.4,
        breakdown: [
            { agent: 'DT', model: 'Gemini 2.5 Flash', costPerIter: 0.12, itersPerCase: 1, costPerCase: 0.12 },
            { agent: 'CA', model: 'GPT-4.1 Nano', costPerIter: 0.12, itersPerCase: 1, costPerCase: 0.12 },
        ],
    },
];
const AGENTS_BASE = [
    { id: '1', name: 'Customer Assistant (CA)', purpose: 'First-line response and triage', model: 'GPT-4.1 Nano', costPerExec: 0.12, monthlyExec: 12000, monthlyCost: 1440, team: 'Support' },
    { id: '2', name: 'Complaint Qualifier (CQ)', purpose: 'Classify and route complaints', model: 'GPT-4.1 Nano', costPerExec: 0.08, monthlyExec: 8900, monthlyCost: 712, team: 'Support' },
    { id: '3', name: 'Escalation Agent (CC)', purpose: 'Escalation and handoff', model: 'Claude Sonnet 4.6', costPerExec: 0.22, monthlyExec: 3400, monthlyCost: 748, team: 'Support' },
    { id: '4', name: 'Document Triage (DT)', purpose: 'Classify inbound documents', model: 'Gemini 2.5 Flash', costPerExec: 0.12, monthlyExec: 8200, monthlyCost: 984, team: 'ML' },
];
const GPU_CLUSTERS_BASE = [
    { id: '1', name: 'ml-training-prod', location: 'us-east-1', provider: 'AWS', gpuType: 'A100', provisionedHours: 720, usedHours: 520, costWeight: 0.52, trainingPct: 70, inferencePct: 30 },
    { id: '2', name: 'inference-pool', location: 'us-west-2', provider: 'AWS', gpuType: 'T4', provisionedHours: 2160, usedHours: 1890, costWeight: 0.14, trainingPct: 0, inferencePct: 100 },
    { id: '3', name: 'vertex-gpu-pool', location: 'us-central1', provider: 'GCP', gpuType: 'V100', provisionedHours: 480, usedHours: 410, costWeight: 0.34, trainingPct: 50, inferencePct: 50 },
];
const BUDGETS_BASE = [
    { project: 'Support AI', budget: 15000, actualWeight: 0.38, forecastWeight: 0.39 },
    { project: 'ML Training', budget: 25000, actualWeight: 0.35, forecastWeight: 0.36 },
    { project: 'Inference API', budget: 8000, actualWeight: 0.27, forecastWeight: 0.28 },
];
const ROI_BASE = [
    { name: 'Complaint automation', aiSpendWeight: 0.45, metricChange: 'Saved 120 FTE hrs/mo', roi: '3.2x' },
    { name: 'Escalation triage', aiSpendWeight: 0.35, metricChange: '30% faster resolution', roi: '2.1x' },
    { name: 'Document triage', aiSpendWeight: 0.2, metricChange: '85% auto-routed', roi: '2.8x' },
];
function isAICost(c) {
    return c.cloud === 'AI';
}
function filterAI(from, to, provider) {
    let rows = database.getCosts().filter(isAICost);
    if (from)
        rows = rows.filter((c) => c.date >= from);
    if (to)
        rows = rows.filter((c) => c.date <= to);
    if (provider && provider !== 'All') {
        const service = PROVIDER_SERVICES[provider] || provider;
        rows = rows.filter((c) => c.service === service);
    }
    return rows;
}
function periodDays(from, to) {
    const a = new Date(from);
    const b = new Date(to);
    return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (86400000)));
}
function previousRange(from, to) {
    const days = periodDays(from, to);
    const fromDate = new Date(from);
    const prevTo = new Date(fromDate);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - days);
    return {
        prevFrom: prevFrom.toISOString().split('T')[0],
        prevTo: prevTo.toISOString().split('T')[0],
    };
}
function sumAmount(rows) {
    return rows.reduce((s, c) => s + c.cost_amount, 0);
}
function dailySeries(rows) {
    const map = {};
    rows.forEach((c) => {
        map[c.date] = (map[c.date] || 0) + c.cost_amount;
    });
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }));
}
function scaleByPeriod(rows, from, to) {
    const periodSpend = sumAmount(rows);
    const days = periodDays(from, to);
    const monthFactor = days / 30;
    return { periodSpend, monthFactor };
}
function estimateTokens(spend, costPer1k) {
    if (!costPer1k)
        return 0;
    return Math.round((spend / costPer1k) * 1000);
}
export function generateAIHome(from, to, provider) {
    const rows = filterAI(from, to, provider);
    const periodSpend = sumAmount(rows);
    const { prevFrom, prevTo } = previousRange(from, to);
    const prevSpend = sumAmount(filterAI(prevFrom, prevTo, provider));
    const spendDeltaPct = prevSpend ? ((periodSpend - prevSpend) / prevSpend) * 100 : 0;
    const categories = CATEGORY_SPLIT.map((c) => ({
        name: c.name,
        pct: c.pct,
        amount: parseFloat(((periodSpend * c.pct) / 100).toFixed(2)),
    }));
    const totalTokens = Math.round(periodSpend * 3200);
    const costPer1kTokens = totalTokens ? parseFloat(((periodSpend / totalTokens) * 1000).toFixed(3)) : 0;
    const requestCount = Math.round(totalTokens / 850);
    const gpuUsed = GPU_CLUSTERS_BASE.reduce((s, c) => s + c.usedHours, 0);
    const gpuProvisioned = GPU_CLUSTERS_BASE.reduce((s, c) => s + c.provisionedHours, 0);
    const gpuUtilization = gpuProvisioned ? parseFloat(((gpuUsed / gpuProvisioned) * 100).toFixed(1)) : 0;
    const workflowMonthly = WORKFLOWS_BASE.reduce((s, w) => s + w.monthlyCost, 0);
    const workflowVolume = WORKFLOWS_BASE.reduce((s, w) => s + w.monthlyVolume, 0);
    const costPerAUoW = workflowVolume ? parseFloat((workflowMonthly / workflowVolume).toFixed(2)) : 0.42;
    const daily = dailySeries(rows);
    const tokenTrend = daily.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: d.amount,
        promptTokens: Math.round(d.amount * 3200 * 0.58),
        completionTokens: Math.round(d.amount * 3200 * 0.42),
        tokens: Math.round(d.amount * 3200),
    }));
    const byService = {};
    rows.forEach((c) => {
        byService[c.service] = (byService[c.service] || 0) + c.cost_amount;
    });
    const topModels = MODELS_BASE.map((m) => {
        const serviceCost = byService[m.service] ?? periodSpend * m.weight;
        const tokens = estimateTokens(serviceCost, m.costPer1k);
        return {
            name: m.model,
            provider: m.provider,
            value: parseFloat(serviceCost.toFixed(2)),
            pct: periodSpend ? parseFloat(((serviceCost / periodSpend) * 100).toFixed(1)) : 0,
            tokens,
            costPer1k: m.costPer1k,
            latency: m.latency,
            errorRate: m.errorRate,
        };
    }).sort((a, b) => b.value - a.value);
    const { monthFactor } = scaleByPeriod(rows, from, to);
    const workflows = WORKFLOWS_BASE.map((w) => ({
        name: w.name,
        agents: w.agents,
        costPerExec: w.costPerExec,
        monthlyCost: parseFloat((w.monthlyCost * monthFactor).toFixed(0)),
    }));
    return {
        from,
        to,
        provider: provider || 'All',
        period_spend: parseFloat(periodSpend.toFixed(2)),
        previous_period_spend: parseFloat(prevSpend.toFixed(2)),
        spend_delta_pct: parseFloat(spendDeltaPct.toFixed(1)),
        categories,
        tokens: {
            total: totalTokens,
            cost_per_1k: costPer1kTokens,
            requests: requestCount,
        },
        gpu_utilization: gpuUtilization,
        gpu_used_hours: gpuUsed,
        gpu_provisioned_hours: gpuProvisioned,
        cost_per_auow: costPerAUoW,
        token_trend: tokenTrend,
        top_models: topModels,
        workflows,
        providers: Object.entries(byService)
            .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
            .sort((a, b) => b.amount - a.amount),
    };
}
export function generateAIModels(from, to, provider) {
    const rows = filterAI(from, to, provider);
    const periodSpend = sumAmount(rows);
    const byService = {};
    rows.forEach((c) => {
        byService[c.service] = (byService[c.service] || 0) + c.cost_amount;
    });
    const models = MODELS_BASE.filter((m) => !provider || provider === 'All' || m.provider === provider).map((m) => {
        const cost = byService[m.service] ?? periodSpend * m.weight;
        const tokens = estimateTokens(cost, m.costPer1k);
        const promptTokens = Math.round(tokens * m.promptRatio);
        const completionTokens = tokens - promptTokens;
        const calls = Math.max(1, Math.round(tokens / 850));
        return {
            ...m,
            cost: parseFloat(cost.toFixed(2)),
            promptTokens,
            completionTokens,
            calls,
        };
    }).sort((a, b) => b.cost - a.cost);
    const totalTokens = models.reduce((s, m) => s + m.promptTokens + m.completionTokens, 0);
    const totalCalls = models.reduce((s, m) => s + m.calls, 0);
    const avgLatency = models.length
        ? parseFloat((models.reduce((s, m) => s + m.latency * m.cost, 0) / Math.max(periodSpend, 1)).toFixed(0))
        : 0;
    const premiumSpend = models.filter((m) => m.tier === 'Premium').reduce((s, m) => s + m.cost, 0);
    const byProviderMap = {};
    models.forEach((m) => {
        if (!byProviderMap[m.provider])
            byProviderMap[m.provider] = { cost: 0, tokens: 0 };
        byProviderMap[m.provider].cost += m.cost;
        byProviderMap[m.provider].tokens += m.promptTokens + m.completionTokens;
    });
    const by_provider = Object.entries(byProviderMap)
        .map(([name, v]) => ({ name, cost: parseFloat(v.cost.toFixed(2)), tokens: v.tokens }))
        .sort((a, b) => b.cost - a.cost);
    const tier_split = [
        { name: 'Premium', value: parseFloat(premiumSpend.toFixed(2)) },
        { name: 'Economy', value: parseFloat((periodSpend - premiumSpend).toFixed(2)) },
    ];
    const daily = dailySeries(rows);
    const cost_trend = daily.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: d.amount,
        tokens: Math.round(d.amount * 3200),
    }));
    const cost_by_model = models.map((m) => ({
        name: m.model.length > 14 ? `${m.model.slice(0, 12)}…` : m.model,
        fullName: m.model,
        cost: m.cost,
        tokens: m.promptTokens + m.completionTokens,
    }));
    return {
        from,
        to,
        period_spend: parseFloat(periodSpend.toFixed(2)),
        models,
        summary: {
            active_models: models.length,
            total_tokens: totalTokens,
            total_calls: totalCalls,
            avg_latency_ms: avgLatency,
            blended_cost_per_1k: totalTokens ? parseFloat(((periodSpend / totalTokens) * 1000).toFixed(3)) : 0,
            premium_spend_pct: periodSpend ? parseFloat(((premiumSpend / periodSpend) * 100).toFixed(1)) : 0,
        },
        by_provider,
        tier_split,
        cost_trend,
        cost_by_model,
    };
}
export function generateAIWorkflows(from, to) {
    const rows = filterAI(from, to);
    const periodSpend = sumAmount(rows);
    const { monthFactor } = scaleByPeriod(rows, from, to);
    const workflows = WORKFLOWS_BASE.map((w) => ({
        ...w,
        monthlyVolume: Math.round(w.monthlyVolume * monthFactor),
        monthlyCost: parseFloat((w.monthlyCost * monthFactor).toFixed(0)),
    }));
    const agents = AGENTS_BASE.map((a) => ({
        ...a,
        monthlyExec: Math.round(a.monthlyExec * monthFactor),
        monthlyCost: parseFloat((a.monthlyCost * monthFactor).toFixed(0)),
    }));
    const agentChart = agents.map((a) => ({ name: a.name.split('(')[0].trim(), cost: a.monthlyCost }));
    const workflowCostChart = workflows.map((w) => ({
        name: w.name.length > 16 ? `${w.name.slice(0, 14)}…` : w.name,
        fullName: w.name,
        cost: w.monthlyCost,
        volume: w.monthlyVolume,
    }));
    const totalMonthlyCost = workflows.reduce((s, w) => s + w.monthlyCost, 0);
    const totalVolume = workflows.reduce((s, w) => s + w.monthlyVolume, 0);
    const modelMap = {};
    agents.forEach((a) => {
        modelMap[a.model] = (modelMap[a.model] || 0) + a.monthlyCost;
    });
    const model_distribution = Object.entries(modelMap).map(([name, cost]) => ({ name, cost }));
    const teamMap = {};
    agents.forEach((a) => {
        teamMap[a.team] = (teamMap[a.team] || 0) + a.monthlyCost;
    });
    const team_spend = Object.entries(teamMap).map(([name, cost]) => ({ name, cost }));
    const auow_bands = workflows.flatMap((w) => [
        { workflow: w.name, band: 'P50', cost: w.p50 },
        { workflow: w.name, band: 'P90', cost: w.p90 },
        { workflow: w.name, band: 'P99', cost: w.p99 },
    ]);
    return {
        from,
        to,
        period_spend: parseFloat(periodSpend.toFixed(2)),
        workflows,
        agents,
        agent_chart: agentChart,
        summary: {
            workflow_count: workflows.length,
            agent_count: agents.length,
            total_monthly_cost: totalMonthlyCost,
            total_executions: totalVolume,
            avg_cost_per_exec: totalVolume ? parseFloat((totalMonthlyCost / totalVolume).toFixed(2)) : 0,
            avg_p50_auow: workflows.length
                ? parseFloat((workflows.reduce((s, w) => s + w.p50, 0) / workflows.length).toFixed(2))
                : 0,
        },
        workflow_cost_chart: workflowCostChart,
        model_distribution,
        team_spend,
        auow_bands,
    };
}
export function generateAIGPU(from, to) {
    const rows = filterAI(from, to);
    const periodSpend = sumAmount(rows);
    const gpuSpend = periodSpend * 0.35;
    const clusters = GPU_CLUSTERS_BASE.map((c) => {
        const cost = gpuSpend * c.costWeight;
        const utilPct = c.provisionedHours ? (c.usedHours / c.provisionedHours) * 100 : 0;
        return {
            ...c,
            cost: parseFloat(cost.toFixed(2)),
            utilization_pct: parseFloat(utilPct.toFixed(1)),
        };
    });
    const daily = dailySeries(rows).slice(-14);
    const trend = daily.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: parseFloat((d.amount * 0.35).toFixed(2)),
    }));
    const forecast = [
        { project: 'model-training-v2', gpuFamily: 'A100', forecastCost: parseFloat((gpuSpend * 0.52 * 1.05).toFixed(0)) },
        { project: 'batch-inference', gpuFamily: 'T4', forecastCost: parseFloat((gpuSpend * 0.14 * 1.02).toFixed(0)) },
        { project: 'realtime-api', gpuFamily: 'V100', forecastCost: parseFloat((gpuSpend * 0.34 * 1.08).toFixed(0)) },
    ];
    const aggregateUtil = clusters.reduce((s, c) => s + c.usedHours, 0) /
        Math.max(1, clusters.reduce((s, c) => s + c.provisionedHours, 0));
    const totalUsed = clusters.reduce((s, c) => s + c.usedHours, 0);
    const totalProvisioned = clusters.reduce((s, c) => s + c.provisionedHours, 0);
    const idleHours = totalProvisioned - totalUsed;
    const idleCost = gpuSpend * (idleHours / Math.max(totalProvisioned, 1));
    const util_by_cluster = clusters.map((c) => ({
        name: c.name,
        utilization: c.utilization_pct,
        cost: c.cost,
    }));
    const costByType = {};
    clusters.forEach((c) => {
        costByType[c.gpuType] = (costByType[c.gpuType] || 0) + c.cost;
    });
    const cost_by_gpu_type = Object.entries(costByType).map(([name, cost]) => ({ name, cost: parseFloat(cost.toFixed(2)) }));
    let trainingWeighted = 0;
    let inferenceWeighted = 0;
    clusters.forEach((c) => {
        trainingWeighted += c.cost * (c.trainingPct / 100);
        inferenceWeighted += c.cost * (c.inferencePct / 100);
    });
    const workload_split = [
        { name: 'Training', value: parseFloat(trainingWeighted.toFixed(2)) },
        { name: 'Inference', value: parseFloat(inferenceWeighted.toFixed(2)) },
    ];
    const util_trend = trend.map((d, i) => ({
        ...d,
        utilization: parseFloat((aggregateUtil * 100 + Math.sin(i) * 4).toFixed(1)),
    }));
    return {
        from,
        to,
        period_spend: parseFloat(periodSpend.toFixed(2)),
        gpu_spend: parseFloat(gpuSpend.toFixed(2)),
        aggregate_utilization_pct: parseFloat((aggregateUtil * 100).toFixed(1)),
        clusters,
        trend,
        util_trend,
        forecast,
        summary: {
            cluster_count: clusters.length,
            gpu_hours_used: totalUsed,
            gpu_hours_provisioned: totalProvisioned,
            idle_hours: idleHours,
            idle_cost: parseFloat(idleCost.toFixed(2)),
            gpu_share_of_ai_pct: periodSpend ? parseFloat(((gpuSpend / periodSpend) * 100).toFixed(1)) : 0,
        },
        util_by_cluster,
        cost_by_gpu_type,
        workload_split,
    };
}
export function generateAIBudgets(from, to) {
    const rows = filterAI(from, to);
    const periodSpend = sumAmount(rows);
    const { monthFactor } = scaleByPeriod(rows, from, to);
    const budgets = BUDGETS_BASE.map((b) => {
        const actual = periodSpend * b.actualWeight;
        const forecast = periodSpend * b.forecastWeight * 1.02;
        const variance = actual - b.budget;
        const variancePct = b.budget ? (variance / b.budget) * 100 : 0;
        return {
            project: b.project,
            budget: b.budget,
            actual: parseFloat(actual.toFixed(2)),
            forecast: parseFloat(forecast.toFixed(2)),
            variance: parseFloat(variance.toFixed(2)),
            variancePct: parseFloat(variancePct.toFixed(1)),
        };
    });
    const roi = ROI_BASE.map((r) => ({
        name: r.name,
        aiSpend: parseFloat((periodSpend * r.aiSpendWeight).toFixed(2)),
        metricChange: r.metricChange,
        roi: r.roi,
        roiValue: parseFloat(r.roi.replace('x', '')),
    }));
    const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
    const totalActual = budgets.reduce((s, b) => s + b.actual, 0);
    const totalForecast = budgets.reduce((s, b) => s + b.forecast, 0);
    const overallVariancePct = totalBudget ? ((totalActual - totalBudget) / totalBudget) * 100 : 0;
    const budget_chart = budgets.map((b) => ({
        project: b.project,
        budget: b.budget,
        actual: b.actual,
        forecast: b.forecast,
    }));
    const spend_mix = [
        { name: 'LLM APIs', value: parseFloat((periodSpend * 0.55).toFixed(2)) },
        { name: 'GPU Compute', value: parseFloat((periodSpend * 0.35).toFixed(2)) },
        { name: 'AI PaaS', value: parseFloat((periodSpend * 0.1).toFixed(2)) },
    ];
    return {
        from,
        to,
        period_spend: parseFloat(periodSpend.toFixed(2)),
        budgets,
        roi,
        summary: {
            total_budget: totalBudget,
            total_actual: parseFloat(totalActual.toFixed(2)),
            total_forecast: parseFloat(totalForecast.toFixed(2)),
            overall_variance_pct: parseFloat(overallVariancePct.toFixed(1)),
            avg_roi: roi.length
                ? parseFloat((roi.reduce((s, r) => s + r.roiValue, 0) / roi.length).toFixed(1))
                : 0,
            projects_on_track: budgets.filter((b) => b.variance <= 0).length,
        },
        budget_chart,
        spend_mix,
    };
}
const AI_TEAM_ALLOCATIONS = [
    { team: 'Support', workflow: 'Complaint Intake & Escalation', weight: 0.42, owner: 'Sarah Chen', allocationModel: 'Usage-based (tokens + AUoW)' },
    { team: 'ML', workflow: 'Document Triage & Training', weight: 0.31, owner: 'Miguel Alvarez', allocationModel: 'Workflow attribution' },
    { team: 'Platform', workflow: 'Shared inference & tooling', weight: 0.17, owner: 'Jordan Lee', allocationModel: 'Shared services pool' },
    { team: 'Data Science', workflow: 'Batch eval & experiments', weight: 0.1, owner: 'Priya Srinivasan', allocationModel: 'Project code chargeback' },
];
export function generateAIChargeback(from, to) {
    const rows = filterAI(from, to);
    const scale = periodDays(from, to) / 30;
    const total = sumAmount(rows) || 42000 * scale;
    const allocations = AI_TEAM_ALLOCATIONS.map((t, i) => {
        const showback = total * t.weight;
        const chargeback = showback * (0.92 + (i % 4) * 0.025);
        return {
            team: t.team,
            workflow: t.workflow,
            showback: parseFloat(showback.toFixed(2)),
            chargeback: parseFloat(chargeback.toFixed(2)),
            variance: parseFloat((chargeback - showback).toFixed(2)),
            varianceRate: parseFloat((((chargeback - showback) / showback) * 100).toFixed(1)),
            allocationModel: t.allocationModel,
            owner: t.owner,
            lastUpdated: to,
        };
    }).sort((a, b) => b.showback - a.showback);
    const showbackSum = allocations.reduce((s, a) => s + a.showback, 0);
    const chargebackSum = allocations.reduce((s, a) => s + a.chargeback, 0);
    const recovery_buckets = [
        { bucket: 'LLM Inference (tokens)', amount: total * 0.48, coverage: 0.91 },
        { bucket: 'GPU Compute', amount: total * 0.28, coverage: 0.86 },
        { bucket: 'Model API & provider fees', amount: total * 0.16, coverage: 0.94 },
        { bucket: 'Training & evaluation', amount: total * 0.08, coverage: 0.78 },
    ];
    const days = periodDays(from, to);
    const bucketCount = days <= 7 ? 4 : days <= 30 ? 6 : 8;
    const trend = Array.from({ length: bucketCount }, (_, i) => {
        const growth = 1 + i * 0.028;
        return {
            month: days <= 7 ? `D${i + 1}` : `W${i + 1}`,
            showback: showbackSum * growth * (0.86 + i * 0.02),
            chargeback: chargebackSum * growth * (0.84 + i * 0.02),
        };
    });
    return {
        from,
        to,
        total_showback: parseFloat(showbackSum.toFixed(2)),
        total_chargeback: parseFloat(chargebackSum.toFixed(2)),
        net_variance: parseFloat((chargebackSum - showbackSum).toFixed(2)),
        recovery_rate: showbackSum ? chargebackSum / showbackSum : 0,
        allocations,
        recovery_buckets: recovery_buckets.map((b) => ({
            ...b,
            amount: parseFloat(b.amount.toFixed(2)),
        })),
        trend,
    };
}
export function generateAIAttribution(from, to, dimension = 'team') {
    const rows = filterAI(from, to);
    const scale = periodDays(from, to) / 30;
    const periodSpend = sumAmount(rows) || 42000 * scale;
    const coveragePct = 88.4;
    const targetCoverage = 92;
    const unallocatedSpend = parseFloat((periodSpend * (1 - coveragePct / 100)).toFixed(2));
    const byTeam = AI_TEAM_ALLOCATIONS.map((t) => {
        const value = periodSpend * t.weight;
        return {
            name: t.team,
            value: parseFloat(value.toFixed(2)),
            pct: parseFloat(((value / periodSpend) * 100).toFixed(1)),
            owner: t.owner,
            allocationModel: t.allocationModel,
        };
    }).sort((a, b) => b.value - a.value);
    const byWorkflow = WORKFLOWS_BASE.map((w) => {
        const value = w.monthlyCost * scale;
        return {
            name: w.name,
            value: parseFloat(value.toFixed(2)),
            pct: parseFloat(((value / periodSpend) * 100).toFixed(1)),
            agents: w.agents,
            costPerExec: w.costPerExec,
        };
    }).sort((a, b) => b.value - a.value);
    const byModel = MODELS_BASE.map((m) => {
        const value = periodSpend * m.weight;
        const tokens = estimateTokens(value, m.costPer1k);
        return {
            name: m.model,
            provider: m.provider,
            service: m.service,
            value: parseFloat(value.toFixed(2)),
            pct: parseFloat(((value / periodSpend) * 100).toFixed(1)),
            tokens,
            tier: m.tier,
        };
    }).sort((a, b) => b.value - a.value);
    const providerMap = {};
    byModel.forEach((m) => {
        providerMap[m.provider] = (providerMap[m.provider] || 0) + m.value;
    });
    const byProvider = Object.entries(providerMap)
        .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        pct: parseFloat(((value / periodSpend) * 100).toFixed(1)),
    }))
        .sort((a, b) => b.value - a.value);
    const byAgent = AGENTS_BASE.map((a) => ({
        name: a.name,
        model: a.model,
        team: a.team,
        value: parseFloat((a.monthlyCost * scale).toFixed(2)),
        pct: parseFloat(((a.monthlyCost * scale / periodSpend) * 100).toFixed(1)),
        monthlyExec: a.monthlyExec,
    })).sort((a, b) => b.value - a.value);
    const dimensionRows = {
        team: byTeam,
        workflow: byWorkflow,
        model: byModel,
        provider: byProvider,
        agent: byAgent,
    };
    const workflowVolume = WORKFLOWS_BASE.reduce((s, w) => s + w.monthlyVolume, 0) * scale;
    const totalTokens = Math.round(periodSpend * 3200);
    const agentExecs = AGENTS_BASE.reduce((s, a) => s + a.monthlyExec, 0) * scale;
    const unitEconomics = [
        {
            title: 'Cost per AUoW',
            value: workflowVolume ? parseFloat((periodSpend / workflowVolume).toFixed(3)) : 0,
            target: 0.42,
            status: periodSpend / workflowVolume <= 0.45 ? 'green' : 'yellow',
        },
        {
            title: 'Cost per 1k tokens',
            value: totalTokens ? parseFloat(((periodSpend / totalTokens) * 1000).toFixed(4)) : 0,
            target: 0.12,
            status: 'green',
        },
        {
            title: 'Cost per agent execution',
            value: agentExecs ? parseFloat((periodSpend / agentExecs).toFixed(4)) : 0,
            target: 0.15,
            status: 'green',
        },
    ];
    const issues = [
        {
            scope: 'GPU Compute',
            unallocated: parseFloat((unallocatedSpend * 0.42).toFixed(2)),
            missing: 'Workflow tag missing on 18% of GPU hours',
            suggested_owner: 'Platform Engineering',
        },
        {
            scope: 'Shared inference pool',
            unallocated: parseFloat((unallocatedSpend * 0.31).toFixed(2)),
            missing: 'Team/BU not assigned on batch eval workloads',
            suggested_owner: 'Data Science',
        },
        {
            scope: 'LLM API (multi-provider)',
            unallocated: parseFloat((unallocatedSpend * 0.27).toFixed(2)),
            missing: 'Model + workflow metadata incomplete on 11% of traces',
            suggested_owner: 'AI Platform Team',
        },
    ];
    const coverageByKey = [
        { key: 'team', label: 'Team / BU', coverage: 91.2, missing: 4 },
        { key: 'workflow', label: 'Workflow', coverage: 86.5, missing: 9 },
        { key: 'model', label: 'Model', coverage: 94.8, missing: 2 },
        { key: 'provider', label: 'Provider', coverage: 97.1, missing: 1 },
        { key: 'agent', label: 'Agent step', coverage: 82.3, missing: 12 },
    ];
    return {
        from,
        to,
        period_spend: parseFloat(periodSpend.toFixed(2)),
        coverage_pct: coveragePct,
        target_coverage: targetCoverage,
        unallocated_spend: unallocatedSpend,
        dimension,
        rows: dimensionRows[dimension],
        by_team: byTeam,
        by_workflow: byWorkflow,
        by_model: byModel,
        by_provider: byProvider,
        by_agent: byAgent,
        unit_economics: unitEconomics,
        issues,
        coverage_by_key: coverageByKey,
    };
}
function getSeededRandom(seedStr) {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
        h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
    }
    return function () {
        h = (h + 0x9e3779b9) | 0;
        let z = h;
        z ^= z >>> 16;
        z = Math.imul(z, 0x21f0aa7c);
        z ^= z >>> 15;
        z = Math.imul(z, 0x735a2d97);
        z ^= z >>> 15;
        return (z >>> 0) / 4294967296;
    };
}
const DEPARTMENTS = {
    support: {
        vp: { userId: 'vp.engineering', name: 'VP of Engineering', role: 'VP of Engineering' },
        director: { userId: 'director.engineering', name: 'Director 1', role: 'Director 1' },
        models: ['GPT-4.1 Nano', 'Gemini 2.5 Flash-Lite', 'GPT-5 Mini', 'Claude Haiku 4.5'],
        users: [
            { userId: 'associate.eng1', name: 'Associate 1', role: 'Associate 1' },
            { userId: 'associate.eng2', name: 'Associate 2', role: 'Associate 2' },
            { userId: 'associate.eng3', name: 'Associate 3', role: 'Associate 3' }
        ]
    },
    billing: {
        vp: { userId: 'vp.enterprise', name: 'VP of Enterprise Tech', role: 'VP of Enterprise Tech' },
        director: { userId: 'director.enterprise', name: 'Director 2', role: 'Director 2' },
        models: ['GPT-4o', 'Claude Sonnet 4.6', 'Claude Haiku 4.5'],
        users: [
            { userId: 'associate.ent1', name: 'Associate 1', role: 'Associate 1' },
            { userId: 'associate.ent2', name: 'Associate 2', role: 'Associate 2' },
            { userId: 'associate.ent3', name: 'Associate 3', role: 'Associate 3' }
        ]
    },
    analytics: {
        vp: { userId: 'vp.infra', name: 'VP of Infrastructure', role: 'VP of Infrastructure' },
        director: { userId: 'director.infra', name: 'Director 3', role: 'Director 3' },
        models: ['Claude Sonnet 4.6', 'GPT-4o', 'GPT-4.1', 'Gemini 2.5 Flash'],
        users: [
            { userId: 'associate.inf1', name: 'Associate 1', role: 'Associate 1' },
            { userId: 'associate.inf2', name: 'Associate 2', role: 'Associate 2' },
            { userId: 'associate.inf3', name: 'Associate 3', role: 'Associate 3' }
        ]
    }
};
function findModelDetails(modelName) {
    const m = AI_MODEL_CATALOG.find((x) => x.model === modelName);
    if (m)
        return m;
    return {
        provider: 'OpenAI',
        inputPerM: 2.5,
        outputPerM: 10.0,
        promptRatio: 0.65,
        latency: 150,
    };
}
const DEPT_FLOWS = {
    support: {
        workflows: ['Simple Complaint Intake', 'Escalated Case'],
        agents: ['Customer Assistant (CA)', 'Complaint Qualifier (CQ)', 'Escalation Agent (CC)'],
    },
    billing: {
        workflows: ['Batch Summarization', 'Escalated Case'],
        agents: ['Complaint Qualifier (CQ)', 'Customer Assistant (CA)'],
    },
    analytics: {
        workflows: ['Document Triage'],
        agents: ['Document Triage (DT)'],
    },
};
export function generateAIObservability(from, to) {
    const days = periodDays(from, to);
    const generateUserUsage = (userId, deptKey) => {
        const rand = getSeededRandom(userId + from + to);
        const deptInfo = DEPARTMENTS[deptKey];
        const numModels = Math.floor(rand() * 2) + 1; // 1 to 2 models
        const activeModels = [];
        const available = [...deptInfo.models];
        for (let i = 0; i < numModels; i++) {
            const idx = Math.floor(rand() * available.length);
            activeModels.push(available.splice(idx, 1)[0]);
        }
        const individualCalls = [];
        const callsPerDay = 1.2 + rand() * 1.8;
        const totalCallsCount = Math.max(5, Math.round(callsPerDay * days));
        const fromMs = new Date(from).getTime();
        const toMs = new Date(to).getTime();
        const rangeMs = toMs - fromMs;
        const flows = DEPT_FLOWS[deptKey];
        for (let i = 0; i < totalCallsCount; i++) {
            const modelIndex = Math.floor(rand() * activeModels.length);
            const modelName = activeModels[modelIndex];
            const details = findModelDetails(modelName);
            const inputTokens = Math.round(400 + rand() * 1200);
            const outputTokens = Math.round(150 + rand() * 600);
            const cost = ((inputTokens * details.inputPerM) + (outputTokens * details.outputPerM)) / 1000000;
            const latencyMs = Math.round(details.latency + (rand() * 40 - 20));
            const callTimeMs = fromMs + rand() * rangeMs;
            const timestamp = new Date(callTimeMs).toISOString();
            const status = rand() > 0.04 ? 'success' : 'error';
            const wfIndex = Math.floor(rand() * flows.workflows.length);
            const agIndex = Math.floor(rand() * flows.agents.length);
            individualCalls.push({
                timestamp,
                model: modelName,
                provider: details.provider,
                inputTokens,
                outputTokens,
                latencyMs,
                cost: parseFloat(cost.toFixed(5)),
                status,
                workflow: flows.workflows[wfIndex],
                agent: flows.agents[agIndex],
            });
        }
        individualCalls.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        const modelUsageMap = {};
        individualCalls.forEach((call) => {
            if (!modelUsageMap[call.model]) {
                modelUsageMap[call.model] = {
                    model: call.model,
                    provider: call.provider,
                    inputTokens: 0,
                    outputTokens: 0,
                    calls: 0,
                    latencySum: 0,
                    cost: 0,
                };
            }
            const mu = modelUsageMap[call.model];
            mu.inputTokens += call.inputTokens;
            mu.outputTokens += call.outputTokens;
            mu.calls += 1;
            mu.latencySum += call.latencyMs;
            mu.cost += call.cost;
        });
        const modelUsage = Object.values(modelUsageMap).map((mu) => ({
            model: mu.model,
            provider: mu.provider,
            inputTokens: mu.inputTokens,
            outputTokens: mu.outputTokens,
            calls: mu.calls,
            latencyMs: Math.round(mu.latencySum / mu.calls),
            cost: parseFloat(mu.cost.toFixed(4)),
        }));
        const calls = individualCalls.length;
        const inputTokens = individualCalls.reduce((s, c) => s + c.inputTokens, 0);
        const outputTokens = individualCalls.reduce((s, c) => s + c.outputTokens, 0);
        const totalCost = parseFloat(individualCalls.reduce((s, c) => s + c.cost, 0).toFixed(4));
        const avgLatencyMs = calls ? Math.round(individualCalls.reduce((s, c) => s + c.latencyMs, 0) / calls) : 0;
        const uniqueWorkflows = Array.from(new Set(individualCalls.map(c => c.workflow)));
        const uniqueAgents = Array.from(new Set(individualCalls.map(c => c.agent)));
        return {
            userId,
            modelUsage,
            calls,
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            totalCost,
            avgLatencyMs,
            individualCalls,
            workflows: uniqueWorkflows,
            agents: uniqueAgents,
        };
    };
    const deptKeys = ['support', 'billing', 'analytics'];
    const childNodes = deptKeys.map((deptKey) => {
        const dept = DEPARTMENTS[deptKey];
        const vpInfo = dept.vp;
        const directorInfo = dept.director;
        const individualUsers = dept.users.map((u) => {
            const usage = generateUserUsage(u.userId, deptKey);
            return {
                userId: u.userId,
                name: u.name,
                role: u.role,
                parentId: directorInfo.userId,
                ...usage,
            };
        });
        const directorCalls = individualUsers.reduce((s, u) => s + u.calls, 0);
        const directorInput = individualUsers.reduce((s, u) => s + u.inputTokens, 0);
        const directorOutput = individualUsers.reduce((s, u) => s + u.outputTokens, 0);
        const directorCost = parseFloat(individualUsers.reduce((s, u) => s + u.totalCost, 0).toFixed(4));
        const directorAvgLatency = directorCalls ? Math.round(individualUsers.reduce((s, u) => s + u.avgLatencyMs * u.calls, 0) / directorCalls) : 0;
        const modelUsageMap = {};
        individualUsers.forEach((u) => {
            u.modelUsage.forEach((mu) => {
                if (!modelUsageMap[mu.model]) {
                    modelUsageMap[mu.model] = {
                        model: mu.model,
                        provider: mu.provider,
                        inputTokens: 0,
                        outputTokens: 0,
                        calls: 0,
                        latencySum: 0,
                        cost: 0,
                    };
                }
                const acc = modelUsageMap[mu.model];
                acc.inputTokens += mu.inputTokens;
                acc.outputTokens += mu.outputTokens;
                acc.calls += mu.calls;
                acc.latencySum += mu.latencyMs * mu.calls;
                acc.cost += mu.cost;
            });
        });
        const directorModelUsage = Object.values(modelUsageMap).map((m) => ({
            model: m.model,
            provider: m.provider,
            inputTokens: m.inputTokens,
            outputTokens: m.outputTokens,
            calls: m.calls,
            latencyMs: m.calls ? Math.round(m.latencySum / m.calls) : 0,
            cost: parseFloat(m.cost.toFixed(4)),
        }));
        const directorCallsHistory = individualUsers.flatMap((u) => u.individualCalls || []);
        directorCallsHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        const directorWorkflows = Array.from(new Set(individualUsers.flatMap(u => u.workflows)));
        const directorAgents = Array.from(new Set(individualUsers.flatMap(u => u.agents)));
        const directorNode = {
            userId: directorInfo.userId,
            name: directorInfo.name,
            role: directorInfo.role,
            parentId: vpInfo.userId,
            modelUsage: directorModelUsage,
            calls: directorCalls,
            inputTokens: directorInput,
            outputTokens: directorOutput,
            totalTokens: directorInput + directorOutput,
            totalCost: directorCost,
            avgLatencyMs: directorAvgLatency,
            children: individualUsers,
            individualCalls: directorCallsHistory.slice(0, 100),
            workflows: directorWorkflows,
            agents: directorAgents,
        };
        return {
            userId: vpInfo.userId,
            name: vpInfo.name,
            role: vpInfo.role,
            parentId: 'soumit.nandi',
            modelUsage: directorModelUsage,
            calls: directorCalls,
            inputTokens: directorInput,
            outputTokens: directorOutput,
            totalTokens: directorInput + directorOutput,
            totalCost: directorCost,
            avgLatencyMs: directorAvgLatency,
            children: [directorNode],
            individualCalls: directorCallsHistory.slice(0, 100),
            workflows: directorWorkflows,
            agents: directorAgents,
        };
    });
    const rootCalls = childNodes.reduce((s, d) => s + d.calls, 0);
    const rootInput = childNodes.reduce((s, d) => s + d.inputTokens, 0);
    const rootOutput = childNodes.reduce((s, d) => s + d.outputTokens, 0);
    const rootCost = parseFloat(childNodes.reduce((s, d) => s + d.totalCost, 0).toFixed(4));
    const rootAvgLatency = rootCalls ? Math.round(childNodes.reduce((s, d) => s + d.avgLatencyMs * d.calls, 0) / rootCalls) : 0;
    const rootModelUsageMap = {};
    childNodes.forEach((d) => {
        d.modelUsage.forEach((mu) => {
            if (!rootModelUsageMap[mu.model]) {
                rootModelUsageMap[mu.model] = {
                    model: mu.model,
                    provider: mu.provider,
                    inputTokens: 0,
                    outputTokens: 0,
                    calls: 0,
                    latencySum: 0,
                    cost: 0,
                };
            }
            const acc = rootModelUsageMap[mu.model];
            acc.inputTokens += mu.inputTokens;
            acc.outputTokens += mu.outputTokens;
            acc.calls += mu.calls;
            acc.latencySum += mu.latencyMs * mu.calls;
            acc.cost += mu.cost;
        });
    });
    const rootModelUsage = Object.values(rootModelUsageMap).map((m) => ({
        model: m.model,
        provider: m.provider,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        calls: m.calls,
        latencyMs: m.calls ? Math.round(m.latencySum / m.calls) : 0,
        cost: parseFloat(m.cost.toFixed(4)),
    }));
    const rootCallsHistory = childNodes.flatMap((d) => d.individualCalls || []);
    rootCallsHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const rootWorkflows = Array.from(new Set(childNodes.flatMap(d => d.workflows)));
    const rootAgents = Array.from(new Set(childNodes.flatMap(d => d.agents)));
    const rootNode = {
        userId: 'soumit.nandi',
        name: 'Soumit Nandi',
        role: 'Chief Technology Officer',
        parentId: null,
        modelUsage: rootModelUsage,
        calls: rootCalls,
        inputTokens: rootInput,
        outputTokens: rootOutput,
        totalTokens: rootInput + rootOutput,
        totalCost: rootCost,
        avgLatencyMs: rootAvgLatency,
        children: childNodes,
        individualCalls: rootCallsHistory.slice(0, 150),
        workflows: rootWorkflows,
        agents: rootAgents,
    };
    const byDepartment = childNodes.map((d) => {
        let deptName = 'Engineering';
        if (d.userId.includes('enterprise'))
            deptName = 'Enterprise Tech';
        else if (d.userId.includes('infra'))
            deptName = 'Infrastructure';
        return {
            name: deptName,
            cost: d.totalCost,
            tokens: d.totalTokens,
            calls: d.calls,
        };
    });
    const modelStatsMap = {};
    childNodes.forEach((d) => {
        d.modelUsage.forEach((mu) => {
            if (!modelStatsMap[mu.model]) {
                modelStatsMap[mu.model] = { name: mu.model, cost: 0, tokens: 0, calls: 0 };
            }
            const entry = modelStatsMap[mu.model];
            entry.cost += mu.cost;
            entry.tokens += mu.inputTokens + mu.outputTokens;
            entry.calls += mu.calls;
        });
    });
    const byModel = Object.values(modelStatsMap).map((m) => ({
        name: m.name,
        cost: parseFloat(m.cost.toFixed(2)),
        tokens: m.tokens,
        calls: m.calls,
    })).sort((a, b) => b.cost - a.cost);
    return {
        from,
        to,
        summary: {
            totalCost: rootCost,
            totalTokens: rootInput + rootOutput,
            inputTokens: rootInput,
            outputTokens: rootOutput,
            totalCalls: rootCalls,
            avgLatencyMs: rootAvgLatency,
        },
        byDepartment,
        byModel,
        tree: rootNode,
    };
}
