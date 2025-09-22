// src/db/candidatesDB.js
import Dexie from 'dexie';
import { candidatesSeed } from '../seed/candidateSeed';

// create database
export const candidatesDb = new Dexie('CandidatesDB');
candidatesDb.version(1).stores({
  candidates: '&id, email, stage, jobId, name, appliedAt, updatedAt'
});

// dev helpers
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.clearCandidatesDB = async () => {
    await candidatesDb.table('candidates').clear();
  };
  window.reinitializeCandidates = async () => {
    await candidatesDb.table('candidates').clear();
    await initializeCandidates();
  };
}

// initialize
export async function initializeCandidates() {
    try{
        const count = await candidatesDb.table('candidates').count();
        if (count > 0) return;

        await candidatesDb.table('candidates').clear();
        await candidatesDb.table('candidates').bulkAdd(candidatesSeed);
    }
    catch(error){
        console.log(`error in candidate db ${error}`);
    }
  
}

// queries
export async function getAllCandidates(params = {}) {
  try {
    let query = candidatesDb.table('candidates').orderBy('appliedAt').reverse();

    if (params.stage) query = query.filter(c => c.stage === params.stage);
    if (params.jobId) query = query.filter(c => c.jobId === params.jobId);
    if (params.search) {
      const term = params.search.toLowerCase();
      query = query.filter(
        c =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }

    const all = await query.toArray();

    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      return {
        data: all.slice(start, end),
        total: all.length,
        page: params.page,
        pageSize: params.pageSize
      };
    }
    return { data: all, total: all.length };
  } catch (err) {
    console.error('getAllCandidates error:', err);
    return { data: [], total: 0 };
  }
}

export async function updateCandidate(id, updates) {
  await candidatesDb.table('candidates').update(id, {
    ...updates,
    updatedAt: new Date()
  });
  return candidatesDb.table('candidates').get(id);
}

export async function getCandidateTimeline(id) {
  const candidate = await candidatesDb.table('candidates').get(id);
  if (!candidate) return null;
  return [
    { stage: 'applied', date: candidate.appliedAt, note: 'Application submitted' },
    { stage: candidate.stage, date: candidate.updatedAt, note: `Moved to ${candidate.stage}` }
  ];
}

export async function getCandidateStatistics() {
  const all = await candidatesDb.table('candidates').toArray();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newCandidates = all.filter(c => new Date(c.appliedAt) >= oneWeekAgo);
  const stageCounts = all.reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {});
  return {
    totalCandidates: all.length,
    newCandidates: newCandidates.length,
    stageCounts
  };
}

export async function createCandidateApplication(data) {
  const newCandidate = {
    ...data,
    id: `candidate-${Date.now()}`,
    appliedAt: new Date(),
    updatedAt: new Date(),
    notes: [],
    stage: 'applied'
  };
  await candidatesDb.table('candidates').add(newCandidate);
  return newCandidate;
}

export async function getCandidatesByStatus(status) {
  return candidatesDb.table('candidates')
    .where('stage')
    .equals(status)
    .reverse()
    .sortBy('appliedAt');
}

export async function updateCandidateStatus(candidateId, status) {
  await candidatesDb.table('candidates').update(candidateId, {
    stage: status,
    updatedAt: new Date()
  });
  return candidatesDb.table('candidates').get(candidateId);
}

export async function deleteCandidate(candidateId) {
  await candidatesDb.table('candidates').delete(candidateId);
  return true;
}

export async function getApplicationStatistics() {
  const all = await candidatesDb.table('candidates').toArray();
  const stats = {
    totalApplications: all.length,
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    hired: 0
  };
  all.forEach(c => { stats[c.stage]++; });
  return stats;
}
