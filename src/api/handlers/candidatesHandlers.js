import { http, HttpResponse } from 'msw';
import {
  getAllCandidates,
  updateCandidate,
  getCandidateTimeline,
  createCandidateApplication,
  updateCandidateStatus,
  deleteCandidate,
  getApplicationStatistics,
  candidatesDb
} from '../db/candidateDB.js';
import { delay } from '../../utils/latency';

export const candidatesHandlers = [
  http.get('/candidates', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');

    let result;
    if (page && pageSize) {
      result = await getAllCandidates({
        search,
        stage,
        jobId,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } else {
      result = await getAllCandidates({ search, stage, jobId });
    }
    return HttpResponse.json(result);
  }),

  http.get('/candidates/:id', async ({ params }) => {
    await delay();
    const candidate = await candidatesDb.candidates.get(params.id);
    return HttpResponse.json(candidate);
  }),

  http.get('/candidates/:id/timeline', async ({ params }) => {
    await delay();
    const timeline = await getCandidateTimeline(params.id);
    return HttpResponse.json(timeline);
  }),

  http.patch('/candidates/:id', async ({ params, request }) => {
    await delay();
    const updates = await request.json();
    const updatedCandidate = await updateCandidate(params.id, updates);
    return HttpResponse.json(updatedCandidate);
  }),

  http.post('/candidates', async ({ request }) => {
    await delay();
    const candidateData = await request.json();
    const newCandidate = await candidatesDb.candidates.add({
      ...candidateData,
      id: `candidate-${Date.now()}`,
      appliedAt: new Date(),
      updatedAt: new Date()
    });
    return HttpResponse.json(newCandidate, { status: 201 });
  }),

  http.get('/applications', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') || url.searchParams.get('job');
    const result = await getAllCandidates(jobId ? { jobId } : {});
    return HttpResponse.json(result.data);
  }),

  http.get('/applications/statistics', async () => {
    await delay();
    const stats = await getApplicationStatistics();
    return HttpResponse.json(stats);
  }),

  http.post('/applications', async ({ request }) => {
    await delay();
    const applicationData = await request.json();
    const newCandidate = await createCandidateApplication(applicationData);
    return HttpResponse.json(newCandidate, { status: 201 });
  }),

  http.patch('/applications/:id/status', async ({ params, request }) => {
    await delay();
    const { status } = await request.json();
    const updatedCandidate = await updateCandidateStatus(params.id, status);
    return HttpResponse.json(updatedCandidate);
  }),

  http.patch('/applications/:id', async ({ params, request }) => {
    await delay();
    const updates = await request.json();
    const updatedCandidate = await updateCandidate(params.id, updates);
    return HttpResponse.json(updatedCandidate);
  }),

  http.delete('/applications/:id', async ({ params }) => {
    await delay();
    await deleteCandidate(params.id);
    return new HttpResponse(null, { status: 204 });
  })
];
