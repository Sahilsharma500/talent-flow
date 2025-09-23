import Dexie from 'dexie';
import { analyticsSeed } from '../seed/analyticsSeed.js';

export const analyticsDb = new Dexie('AnalyticsDB');
analyticsDb.version(1).stores({
  monthlyData: 'key',
  jobs: '++id, title'
});

// Helper for debugging: you can call this from the browser console
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.reinitializeAnalytics = async () => {
        console.log("Reinitializing AnalyticsDB...");
        await analyticsDb.table('monthlyData').clear();
        await analyticsDb.table('jobs').clear();
        await initializeAnalytics();
        console.log("AnalyticsDB reinitialized!");
    };
}

export async function initializeAnalytics() {
  try {
    const count = await analyticsDb.table('monthlyData').count();
    if (count > 0) return;

    await analyticsDb.table('monthlyData').bulkAdd(
      Object.keys(analyticsSeed.monthlyData).map(key => ({
        key,
        ...analyticsSeed.monthlyData[key]
      }))
    );
    await analyticsDb.table('jobs').bulkAdd(analyticsSeed.jobs);

  } catch (error) {
    console.error('Error initializing analytics data:', error);
  }
}

export async function getMonthlyAnalytics() {
  return analyticsDb.table('monthlyData').toArray();
}

export async function getJobs() {
  return analyticsDb.table('jobs').toArray();
}

export async function getDailyApplicants(monthKey) {
  const data = await analyticsDb.table('monthlyData').get(monthKey);
  return data ? data.dailyApplicants : {};
}

export async function getJobsDataForMonth(monthKey) {
  const data = await analyticsDb.table('monthlyData').get(monthKey);
  return data ? data.jobsData : [];
}