import Dexie from 'dexie';
import { candidatesSeed } from '../seed/candidateSeed';

// create database
export const candidatesDb = new Dexie('CandidatesDB');
candidatesDb.version(3).stores({
  candidates: '&id, email, stage, jobId, name, appliedAt, updatedAt, previousCompany, previousRole, yearsOfExperience, dateOfBirth, profilePicture, notes', // 'notes' added
  timeline: '++id, candidateId, stage, date, note' // 'timeline' table added
});

// dev helpers
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.clearCandidatesDB = async () => {
    await candidatesDb.table('candidates').clear();
    await candidatesDb.table('timeline').clear(); // Clear timeline too
  };
  window.reinitializeCandidates = async () => {
    await candidatesDb.table('candidates').clear();
    await candidatesDb.table('timeline').clear(); // Clear timeline too
    await initializeCandidates();
  };
}

// initialize
export async function initializeCandidates() {
    try{
        const count = await candidatesDb.table('candidates').count();
        if (count > 0) return;

        await candidatesDb.table('candidates').clear();
        await candidatesDb.table('timeline').clear(); 

        // Prepare candidates, ensuring notes is an array for persistence
        const candidatesWithNotesArray = candidatesSeed.map(c => ({
            ...c,
            notes: Array.isArray(c.notes) ? c.notes : []
        }));

        await candidatesDb.table('candidates').bulkAdd(candidatesWithNotesArray);

        // Log initial applied event for all candidates
        const timelineEvents = candidatesWithNotesArray.map(c => ({
            candidateId: c.id,
            stage: 'applied',
            date: c.appliedAt,
            note: 'Application submitted',
        }));
        await candidatesDb.table('timeline').bulkAdd(timelineEvents);

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
          c.email.toLowerCase().includes(term) ||
          c.previousCompany?.toLowerCase().includes(term) ||
          c.previousRole?.toLowerCase().includes(term)
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
  const updatedData = {
    ...updates,
    updatedAt: new Date()
  };
  
  // Logic to handle notes array/string conversion for persistence
  if (typeof updatedData.notes === 'string') {
    updatedData.notes = updatedData.notes.split('\n\n').filter(n => n.trim() !== '');
  } else if (!Array.isArray(updatedData.notes)) {
    updatedData.notes = [];
  }

  await candidatesDb.table('candidates').update(id, updatedData);
  return candidatesDb.table('candidates').get(id);
}

// MODIFIED: Fetches the full stage history from the timeline table
export async function getCandidateTimeline(candidateId) {
  try {
    return candidatesDb.table('timeline')
      .where('candidateId').equals(candidateId)
      .sortBy('date');
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return [];
  }
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

// MODIFIED: Logs the initial 'applied' event to the timeline
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
  
  // Log initial 'applied' event
  await candidatesDb.table('timeline').add({
    candidateId: newCandidate.id,
    stage: 'applied',
    date: newCandidate.appliedAt,
    note: 'Application submitted',
  });
  
  return newCandidate;
}

export async function getCandidatesByStatus(status) {
  return candidatesDb.table('candidates')
    .where('stage')
    .equals(status)
    .reverse()
    .sortBy('appliedAt');
}

// MODIFIED: Logs the status change to the timeline
export async function updateCandidateStatus(candidateId, status) {
  const updateTime = new Date();
  
  await candidatesDb.table('candidates').update(candidateId, {
    stage: status,
    updatedAt: updateTime
  });
  
  // Log the status change
  await candidatesDb.table('timeline').add({
    candidateId: candidateId,
    stage: status,
    date: updateTime,
    note: `Moved to ${status.charAt(0).toUpperCase() + status.slice(1)} stage`,
  });
  
  return candidatesDb.table('candidates').get(candidateId);
}

export async function deleteCandidate(candidateId) {
  await candidatesDb.table('candidates').delete(candidateId);
  await candidatesDb.table('timeline').where('candidateId').equals(candidateId).delete(); // Delete associated timeline entries
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