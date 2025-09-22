
import Dexie from 'dexie';
import { jobsSeed } from '../seed/jobsSeed';

// create db
export const jobsDb = new Dexie('JobsDB');
jobsDb.version(1).stores({
  jobs: '&id, slug, status, order, title, jobType, createdAt'
});

// initialize
export async function initializeJobs() {
  try {
    const count = await jobsDb.table('jobs').count();
    if (count > 0) return;

    await jobsDb.table('jobs').clear();
    await jobsDb.table('jobs').bulkAdd(jobsSeed);
  } catch (err) {
    console.error('initializeJobs error:', err);
  }
}

// queries
export async function getAllJobs(params = {}) {
  try {
    let query = jobsDb.table('jobs').orderBy('createdAt');

    if (params.status) query = query.filter(j => j.status === params.status);
    if (params.jobType && params.jobType !== 'All') {
      query = query.filter(j => j.jobType === params.jobType);
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      query = query.filter(
        j =>
          j.title.toLowerCase().includes(term) ||
          j.tags.some(tag => tag.toLowerCase().includes(term))
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
    console.error('getAllJobs error:', err);
    return { data: [], total: 0 };
  }
}

export async function createJob(jobData) {
  const count = await jobsDb.table('jobs').count();
  const slug =
    jobData.title.toLowerCase().replace(/\s+/g, '-') +
    '-' +
    Math.random().toString(36).substr(2, 4);

  const newJob = {
    ...jobData,
    id: `job-${Date.now()}`,
    slug,
    order: count,
    createdAt: new Date()
  };
  await jobsDb.table('jobs').add(newJob);
  return newJob;
}

export async function updateJob(id, updates) {
  await jobsDb.table('jobs').update(id, updates);
  return jobsDb.table('jobs').get(id);
}

export async function reorderJob(id, data) {
  await jobsDb.table('jobs').update(id, { order: data.toOrder });
  return jobsDb.table('jobs').get(id);
}

export async function deleteJob(id) {
  await jobsDb.table('jobs').delete(id);
  return true;
}

export async function getJobStatistics() {
  const all = await jobsDb.table('jobs').toArray();
  const active = all.filter(j => j.status === 'active');
  return {
    totalJobs: all.length,
    activeJobs: active.length,
    archivedJobs: all.length - active.length
  };
}
