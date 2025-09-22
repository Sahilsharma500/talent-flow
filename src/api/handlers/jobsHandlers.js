import { http, HttpResponse } from 'msw';
import { getAllJobs, createJob, updateJob, reorderJob, deleteJob, jobsDb } from '../db/jobsDB.js';
import { delay } from '../../utils/latency';

export const jobsHandlers = [
  http.get('/jobs', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const jobType = url.searchParams.get('jobType') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const result = await getAllJobs({ search, status, jobType, page, pageSize });
    return HttpResponse.json(result);
  }),

  http.post('/jobs', async ({ request }) => {
    await delay();
    const jobData = await request.json();
    const newJob = await createJob(jobData);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.patch('/jobs/:id', async ({ params, request }) => {
    await delay();
    const updates = await request.json();
    const updatedJob = await updateJob(params.id, updates);
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/jobs/:id/reorder', async ({ params, request }) => {
    await delay();
    const reorderData = await request.json();
    const updatedJob = await reorderJob(params.id, reorderData);
    return HttpResponse.json(updatedJob);
  }),

  http.get('/jobs/:id', async ({ params }) => {
    await delay();
    const job = await jobsDb.jobs.get(params.id);
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  http.delete('/jobs/:id', async ({ params }) => {
    await delay();
    await deleteJob(params.id);
    return new HttpResponse(null, { status: 204 });
  })
];
