import { http, HttpResponse } from 'msw';
import { getMonthlyAnalytics, getDailyApplicants, getJobsDataForMonth, getJobs } from '../db/analyticsDB.js';
import { delay } from '../../utils/latency';

export const dashboardHandlers = [
  // A generic handler to catch the root dashboard path and prevent MSW warnings
  http.get('/dashboard', async () => {
    await delay();
    return HttpResponse.json({ status: 'ok' });
  }),

  http.get('/analytics/monthly', async () => {
    await delay();
    const monthlyData = await getMonthlyAnalytics();
    return HttpResponse.json(monthlyData);
  }),

  http.get('/analytics/daily-applicants/:monthKey', async ({ params }) => {
    await delay();
    const dailyData = await getDailyApplicants(params.monthKey);
    return HttpResponse.json(dailyData);
  }),

  http.get('/analytics/candidates-per-job', async () => {
    await delay();
    const jobs = await getJobs();
    const monthlyData = await getMonthlyAnalytics();
    
    // Calculate total applicants per job across all months
    const jobCounts = {};
    monthlyData.forEach(month => {
      month.jobsData.forEach(job => {
        jobCounts[job.id] = (jobCounts[job.id] || 0) + job.applicants;
      });
    });

    const candidatesPerJobData = jobs.map(job => ({
      name: job.title,
      candidates: jobCounts[job.id] || 0
    }));
    
    return HttpResponse.json(candidatesPerJobData);
  }),

  http.get('/analytics/jobs-for-comparison', async () => {
    await delay();
    const jobs = await getJobs();
    return HttpResponse.json(jobs);
  }),

  http.get('/analytics/job-comparison/:month1/:month2', async ({ params }) => {
    await delay();
    const [jobsData1, jobsData2, allJobs] = await Promise.all([
      getJobsDataForMonth(params.month1),
      getJobsDataForMonth(params.month2),
      getJobs()
    ]);

    const jobsMap = new Map(allJobs.map(j => [j.id, j.title]));

    const comparisonData = allJobs.map(job => {
      const applicants1 = jobsData1.find(j => j.id === job.id)?.applicants || 0;
      const applicants2 = jobsData2.find(j => j.id === job.id)?.applicants || 0;
      return {
        name: jobsMap.get(job.id),
        [params.month1]: applicants1,
        [params.month2]: applicants2,
      };
    });

    return HttpResponse.json(comparisonData);
  })
];