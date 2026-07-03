var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query } from '@nestjs/common';
import { database } from './data/db';
let CostsController = class CostsController {
    list(granularity = 'day', from, to, groupBy, service, cloud, platform, scope, provider, lob, application, period, region, account, tag) {
        let filtered = database.getCosts();
        if (from) {
            filtered = filtered.filter(c => c.date >= from);
        }
        if (to) {
            filtered = filtered.filter(c => c.date <= to);
        }
        if (service) {
            filtered = filtered.filter(c => c.service === service);
        }
        if (cloud) {
            filtered = filtered.filter(c => c.cloud === cloud);
        }
        // Filter by scope (cloud | onprem | ai) for scope dashboards
        if (scope) {
            if (scope === 'cloud') {
                filtered = filtered.filter(c => c.cloud !== 'On-Prem' && c.cloud !== 'AI');
            }
            else if (scope === 'onprem') {
                filtered = filtered.filter(c => c.cloud === 'On-Prem');
            }
            else if (scope === 'ai') {
                filtered = filtered.filter(c => c.cloud === 'AI');
            }
        }
        // Filter by platform (cloud or on-prem) – legacy, scope takes precedence when both present
        if (!scope && platform) {
            if (platform === 'Cloud') {
                filtered = filtered.filter(c => c.cloud !== 'On-Prem' && c.cloud !== 'AI');
            }
            else if (platform === 'On-Prem') {
                filtered = filtered.filter(c => c.cloud === 'On-Prem');
            }
        }
        // Filter by provider (CSP - Cloud Service Provider or Software Vendor)
        if (provider) {
            // First check if it's a cloud provider
            if (['AWS', 'Azure', 'GCP', 'On-Prem'].includes(provider)) {
                filtered = filtered.filter(c => c.cloud === provider);
            }
            else {
                // If it's a software vendor, filter by vendor field or service name
                filtered = filtered.filter(c => c.vendor === provider ||
                    c.tags?.vendor === provider ||
                    // Fallback: check if service name might match vendor products
                    (provider === 'Microsoft' && c.service && ['Office 365', 'Azure Services', 'Microsoft Teams', 'SQL Server', 'Windows Server'].includes(c.service)) ||
                    (provider === 'Adobe' && c.service && ['Adobe Creative Cloud', 'Adobe Acrobat'].includes(c.service)) ||
                    (provider === 'Atlassian' && c.service && ['Jira Software', 'Jira Service Management', 'Confluence', 'Bitbucket', 'Atlassian Cloud', 'Bamboo', 'Fisheye', 'Crowd', 'Sourcetree', 'Opsgenie'].includes(c.service)) ||
                    (provider === 'Salesforce' && c.service && ['Salesforce CRM', 'Salesforce Platform'].includes(c.service)) ||
                    (provider === 'ServiceNow' && c.service && ['ServiceNow ITSM', 'ServiceNow Platform'].includes(c.service)) ||
                    (provider === 'Splunk' && c.service && ['Splunk Enterprise', 'Splunk Cloud'].includes(c.service)) ||
                    (provider === 'Datadog' && c.service && ['Datadog APM', 'Datadog Infrastructure'].includes(c.service)) ||
                    (provider === 'New Relic' && c.service && ['New Relic Monitoring', 'New Relic One'].includes(c.service)) ||
                    (provider === 'GitHub' && c.service && ['GitHub Enterprise', 'GitHub Actions'].includes(c.service)) ||
                    (provider === 'Slack' && c.service && ['Slack Enterprise', 'Slack Business'].includes(c.service)) ||
                    (provider === 'Zoom' && c.service && ['Zoom Business', 'Zoom Enterprise'].includes(c.service)) ||
                    (provider === 'Docker' && c.service && ['Docker Enterprise', 'Docker Desktop'].includes(c.service)) ||
                    (provider === 'VMware' && c.service && ['VMware vSphere', 'VMware Cloud'].includes(c.service)) ||
                    (provider === 'Homegrown' && c.service && ['Internal Analytics Platform', 'Custom CRM System', 'Enterprise Portal'].includes(c.service)));
            }
        }
        // Filter by LOB (Line of Business from tags)
        if (lob) {
            filtered = filtered.filter(c => c.tags?.biz_unit === lob);
        }
        // Filter by Application (from tags)
        if (application) {
            filtered = filtered.filter(c => c.tags?.application === application);
        }
        if (region) {
            filtered = filtered.filter((c) => c.region === region);
        }
        if (account) {
            filtered = filtered.filter((c) => c.account === account);
        }
        if (tag) {
            const [key, val] = tag.includes(':') ? tag.split(':') : [tag, undefined];
            filtered = filtered.filter((c) => {
                if (!c.tags)
                    return false;
                if (val !== undefined)
                    return c.tags[key] === val;
                return Boolean(c.tags[key]);
            });
        }
        // Adjust granularity based on period parameter
        let actualGranularity = granularity;
        if (period) {
            switch (period) {
                case 'hourly':
                    actualGranularity = 'hour';
                    break;
                case 'daily':
                    actualGranularity = 'day';
                    break;
                case 'monthly':
                    actualGranularity = 'month';
                    break;
                case 'quarterly':
                    actualGranularity = 'quarter';
                    break;
                case 'half-yearly':
                    actualGranularity = 'half-year';
                    break;
                case 'yearly':
                    actualGranularity = 'year';
                    break;
            }
        }
        // Group by service or cloud — before time-series aggregation (groupBy wins over granularity)
        if (groupBy === 'service') {
            const grouped = {};
            filtered.forEach(cost => {
                if (!grouped[cost.service]) {
                    grouped[cost.service] = { service: cost.service, amount: 0, count: 0 };
                }
                grouped[cost.service].amount += cost.cost_amount;
                grouped[cost.service].count += 1;
            });
            return {
                granularity,
                groupBy: 'service',
                data: Object.values(grouped)
                    .map((g) => ({
                    service: g.service,
                    amount: parseFloat(g.amount.toFixed(2)),
                    currency: 'USD',
                    record_count: g.count,
                }))
                    .sort((a, b) => b.amount - a.amount),
            };
        }
        if (groupBy === 'cloud') {
            const grouped = {};
            filtered.forEach(cost => {
                if (!grouped[cost.cloud]) {
                    grouped[cost.cloud] = { cloud: cost.cloud, amount: 0, count: 0 };
                }
                grouped[cost.cloud].amount += cost.cost_amount;
                grouped[cost.cloud].count += 1;
            });
            return {
                granularity,
                groupBy: 'cloud',
                data: Object.values(grouped)
                    .map((g) => ({
                    cloud: g.cloud,
                    amount: parseFloat(g.amount.toFixed(2)),
                    currency: 'USD',
                    record_count: g.count,
                }))
                    .sort((a, b) => b.amount - a.amount),
            };
        }
        if (groupBy === 'region') {
            const grouped = {};
            filtered.forEach((cost) => {
                const region = cost.region || 'unknown';
                if (!grouped[region]) {
                    grouped[region] = { region, amount: 0, count: 0 };
                }
                grouped[region].amount += cost.cost_amount;
                grouped[region].count += 1;
            });
            return {
                granularity,
                groupBy: 'region',
                data: Object.values(grouped)
                    .map((g) => ({
                    region: g.region,
                    amount: parseFloat(g.amount.toFixed(2)),
                    currency: 'USD',
                    record_count: g.count,
                }))
                    .sort((a, b) => b.amount - a.amount),
            };
        }
        // Helper function to get period key based on granularity
        const getPeriodKey = (dateStr, period) => {
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime()))
                    return dateStr;
                const pad = (n) => String(n).padStart(2, '0');
                switch (period) {
                    case 'hourly':
                        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00:00`;
                    case 'daily':
                        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                    case 'monthly':
                        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
                    case 'quarterly':
                        const quarter = Math.floor(date.getMonth() / 3) + 1;
                        return `${date.getFullYear()}-Q${quarter}`;
                    case 'half-yearly':
                        const half = date.getMonth() < 6 ? 1 : 2;
                        return `${date.getFullYear()}-H${half}`;
                    case 'yearly':
                        return String(date.getFullYear());
                    default:
                        return dateStr.split('T')[0]; // Default to date part
                }
            }
            catch (e) {
                return dateStr.split('T')[0];
            }
        };
        // Group by date based on granularity
        if (actualGranularity === 'day' || actualGranularity === 'hour' || !actualGranularity || actualGranularity === 'month' || actualGranularity === 'quarter' || actualGranularity === 'half-year' || actualGranularity === 'year') {
            const grouped = {};
            // For hourly period, we need to distribute daily data across 24 hours
            if (period === 'hourly' && from && to) {
                const pad = (n) => String(n).padStart(2, '0');
                const now = new Date();
                // Generate all 24 hour buckets for the last 24 hours
                const hourBuckets = [];
                for (let h = 0; h < 24; h++) {
                    const hourDate = new Date(now);
                    hourDate.setHours(now.getHours() - (23 - h), 0, 0, 0);
                    const hourKey = `${hourDate.getFullYear()}-${pad(hourDate.getMonth() + 1)}-${pad(hourDate.getDate())}T${pad(hourDate.getHours())}:00:00`;
                    hourBuckets.push(hourKey);
                    grouped[hourKey] = {
                        date: hourKey,
                        amount: 0,
                        count: 0,
                        by_service: {},
                        by_cloud: {}
                    };
                }
                // Distribute filtered costs evenly across the 24 hours
                // Calculate how much to assign per hour
                const totalCost = filtered.reduce((sum, c) => sum + c.cost_amount, 0);
                const costPerHour = totalCost / 24;
                // Distribute costs: assign each cost record to a random hour, but ensure all hours get some data
                filtered.forEach((cost, index) => {
                    // Distribute costs across hours, ensuring each hour gets some data
                    const hourIndex = index % 24;
                    const hourKey = hourBuckets[hourIndex];
                    if (grouped[hourKey]) {
                        // Add a portion of this cost to the hour (to ensure realistic distribution)
                        const costPortion = cost.cost_amount * (0.8 + Math.random() * 0.4); // 80-120% of cost
                        grouped[hourKey].amount += costPortion;
                        grouped[hourKey].count += 1;
                        if (!grouped[hourKey].by_service[cost.service]) {
                            grouped[hourKey].by_service[cost.service] = 0;
                        }
                        grouped[hourKey].by_service[cost.service] += costPortion;
                        if (!grouped[hourKey].by_cloud[cost.cloud]) {
                            grouped[hourKey].by_cloud[cost.cloud] = 0;
                        }
                        grouped[hourKey].by_cloud[cost.cloud] += costPortion;
                    }
                });
                // Ensure all hours have at least some minimum amount (even if 0, they'll show up)
                hourBuckets.forEach(hourKey => {
                    if (grouped[hourKey].amount === 0 && grouped[hourKey].count === 0) {
                        // Give it a small random amount to ensure visibility
                        grouped[hourKey].amount = Math.random() * 50;
                    }
                });
            }
            else {
                // Normal grouping for other periods
                // For monthly period, ensure we properly roll up license + usage costs per calendar month
                filtered.forEach(cost => {
                    const key = period ? getPeriodKey(cost.date, period) : cost.date.split('T')[0];
                    if (!grouped[key]) {
                        grouped[key] = {
                            date: key,
                            amount: 0,
                            license_cost: 0, // Track license costs separately
                            usage_cost: 0, // Track usage costs separately
                            count: 0,
                            by_service: {},
                            by_cloud: {}
                        };
                    }
                    // Sum license and usage costs
                    const licenseCost = cost.license_cost || 0;
                    const usageCost = cost.usage_cost || 0;
                    const totalCost = cost.cost_amount || (licenseCost + usageCost);
                    grouped[key].amount += totalCost;
                    grouped[key].license_cost += licenseCost;
                    grouped[key].usage_cost += usageCost;
                    grouped[key].count += 1;
                    if (!grouped[key].by_service[cost.service]) {
                        grouped[key].by_service[cost.service] = 0;
                    }
                    grouped[key].by_service[cost.service] += totalCost;
                    if (!grouped[key].by_cloud[cost.cloud]) {
                        grouped[key].by_cloud[cost.cloud] = 0;
                    }
                    grouped[key].by_cloud[cost.cloud] += totalCost;
                });
            }
            // Sort by date for proper ordering
            const sortedData = Object.values(grouped)
                .map((g) => ({
                date: g.date,
                amount: parseFloat(g.amount.toFixed(2)), // Total = license + usage
                license_cost: g.license_cost ? parseFloat(g.license_cost.toFixed(2)) : undefined,
                usage_cost: g.usage_cost ? parseFloat(g.usage_cost.toFixed(2)) : undefined,
                currency: 'USD',
                record_count: g.count,
                breakdown: {
                    by_service: g.by_service,
                    by_cloud: g.by_cloud
                }
            }))
                .sort((a, b) => a.date.localeCompare(b.date));
            return {
                granularity: actualGranularity || granularity,
                data: sortedData
            };
        }
        // Return raw data (limited)
        return {
            granularity,
            data: filtered.slice(0, 100).map(c => ({
                date: c.date,
                service: c.service,
                cloud: c.cloud,
                account: c.account,
                project: c.project,
                amount: c.cost_amount,
                currency: c.currency,
                tags: c.tags
            })),
            total: filtered.length
        };
    }
};
__decorate([
    Get(),
    __param(0, Query('granularity')),
    __param(1, Query('from')),
    __param(2, Query('to')),
    __param(3, Query('groupBy')),
    __param(4, Query('service')),
    __param(5, Query('cloud')),
    __param(6, Query('platform')),
    __param(7, Query('scope')),
    __param(8, Query('provider')),
    __param(9, Query('lob')),
    __param(10, Query('application')),
    __param(11, Query('period')),
    __param(12, Query('region')),
    __param(13, Query('account')),
    __param(14, Query('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CostsController.prototype, "list", null);
CostsController = __decorate([
    Controller('/v1/costs')
], CostsController);
export { CostsController };
