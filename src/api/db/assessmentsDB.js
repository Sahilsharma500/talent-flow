// src/db/assessmentsDB.js
import Dexie from 'dexie';
import { assessmentsSeed } from '../seed/assessmentsSeed';

// create database
export const assessmentsDb = new Dexie('AssessmentsDB');
assessmentsDb.version(1).stores({
  assessments: '&id, jobId'
});

// initialize database with seed
export async function initializeAssessments() {
  try {
    const count = await assessmentsDb.table('assessments').count();
    if (count > 0) return;

    await assessmentsDb.table('assessments').clear();
    await assessmentsDb.table('assessments').bulkAdd(assessmentsSeed);
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

export async function submitAssessmentResponse(jobId, responses) {
  localStorage.setItem(
    `assessment-response-${jobId}`,
    JSON.stringify({ responses, submittedAt: new Date() })
  );
  return { success: true };
}

export async function getAssessmentStatistics() {
  const all = await assessmentsDb.table('assessments').toArray();
  let completed = 0;
  for (const a of all) {
    if (localStorage.getItem(`assessment-response-${a.jobId}`)) completed++;
  }
  return {
    totalAssessments: all.length,
    completedAssessments: completed,
    pendingAssessments: all.length - completed
  };
}

export async function deleteAssessment(id) {
  await assessmentsDb.table('assessments').delete(id);
  return true;
}
