// src/api/assessmentsHandlers.js
import { http, HttpResponse } from 'msw';
import {
  getAssessmentByJobId,
  saveAssessment,
  submitAssessmentResponse,
  getAllAssessments,
  deleteAssessment,
  getResponsesByAssessmentId
} from '../db/assessmentsDB.js';
import { delay, maybeFail } from '../../utils/latency';

export const assessmentsHandlers = [
  http.get('/assessments', async () => {
    await delay();
    const assessments = await getAllAssessments();
    return HttpResponse.json({
      data: assessments,
      total: assessments.length
    });
  }),

  http.post('/assessments', async ({ request }) => {
    await delay();
    maybeFail();
    const assessmentData = await request.json();
    const savedAssessment = await saveAssessment(assessmentData);
    return HttpResponse.json(savedAssessment);
  }),

  http.get('/assessments/:assessmentId', async ({ params }) => {
    await delay();
    const assessment = await getAssessmentByJobId(params.assessmentId);
    return HttpResponse.json(assessment);
  }),

  http.get('/assessments/:assessmentId/responses', async ({ params }) => {
    await delay();
    const responses = await getResponsesByAssessmentId(params.assessmentId);
    return HttpResponse.json({ data: responses });
  }),

  http.put('/assessments/:jobId', async ({ request }) => {
    await delay();
    maybeFail();
    const assessmentData = await request.json();
    const savedAssessment = await saveAssessment(assessmentData);
    return HttpResponse.json(savedAssessment);
  }),

  http.post('/assessments/:jobId/submit', async ({ params, request }) => {
    await delay();
    maybeFail();
    const { candidateId, responses } = await request.json();
    const result = await submitAssessmentResponse(params.jobId, candidateId, responses);
    return HttpResponse.json(result);
  }),

  http.delete('/assessments/:id', async ({ params }) => {
    await delay();
    maybeFail();
    await deleteAssessment(params.id);
    return new HttpResponse(null, { status: 204 });
  })
];