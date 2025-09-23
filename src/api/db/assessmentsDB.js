// src/db/assessmentsDB.js
import Dexie from 'dexie';
import { assessmentsSeed, generateCandidateResponses } from '../seed/assessmentsSeed';
import { candidatesSeed } from '../seed/candidateSeed'; // Import existing candidate seed

// create database
export const assessmentsDb = new Dexie('AssessmentsDB');
assessmentsDb.version(2).stores({
  assessments: '&id, jobId',
  assessmentResponses: '&id, assessmentId, candidateId, score'
});

// initialize database with seed
export async function initializeAssessments() {
  try {
    const count = await assessmentsDb.table('assessments').count();
    if (count > 0) return;

    await assessmentsDb.table('assessments').clear();
    await assessmentsDb.table('assessments').bulkAdd(assessmentsSeed);

    // Generate and seed mock candidate responses
    const candidateResponses = generateCandidateResponses(assessmentsSeed, candidatesSeed);
    await assessmentsDb.table('assessmentResponses').clear();
    await assessmentsDb.table('assessmentResponses').bulkAdd(candidateResponses);
  } catch (error) {
    console.error('Error initializing assessments:', error);
  }
}

// queries
export async function getAssessmentByJobId(jobId) {
  return assessmentsDb.table('assessments').where('jobId').equals(jobId).first();
}

export async function getAllAssessments() {
  return assessmentsDb.table('assessments').toArray();
}

export async function saveAssessment(assessment) {
  await assessmentsDb.table('assessments').put(assessment);
  return assessment;
}

// This function is now for the mock API, no longer uses localStorage
export async function submitAssessmentResponse(assessmentId, candidateId, responses) {
  const newResponse = {
    id: `response-${Date.now()}`,
    assessmentId,
    candidateId,
    score: faker.number.int({ min: 20, max: 100 }), // Mock score
    responses,
    submittedAt: new Date(),
  };
  await assessmentsDb.table('assessmentResponses').add(newResponse);
  return newResponse;
}

export async function getAssessmentStatistics() {
  const all = await assessmentsDb.table('assessments').toArray();
  const completedResponses = await assessmentsDb.table('assessmentResponses').count();
  return {
    totalAssessments: all.length,
    completedAssessments: completedResponses,
    pendingAssessments: 'N/A' // This is hard to calculate with the new schema, so 'N/A' is a good placeholder
  };
}

export async function getResponsesByAssessmentId(assessmentId) {
  return assessmentsDb.table('assessmentResponses').where('assessmentId').equals(assessmentId).toArray();
}

export async function deleteAssessment(id) {
  await assessmentsDb.table('assessments').delete(id);
  await assessmentsDb.table('assessmentResponses').where('assessmentId').equals(id).delete();
  return true;
}