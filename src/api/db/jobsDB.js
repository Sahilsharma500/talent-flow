import Dexie from 'dexie';
import { jobsSeed } from '../seed/jobsSeed';

export const jobsDb = new Dexie('JobsDB');
jobsDb.version(1).stores({
  jobs: '&id, slug, status, order, title, jobType, createdAt'
});

export async function initializeJobs() {
  try {
    const count = await jobsDb.table('jobs').count();
    if (count > 0) return;

    await jobsDb.table('jobs').clear();
    
    // Ensure initial seeding respects the 'order' property if it exists, or defaults to index
    const seededJobsWithOrder = jobsSeed.map((job, index) => ({
        ...job,
        order: job.order !== undefined ? job.order : index
    }));
    await jobsDb.table('jobs').bulkAdd(seededJobsWithOrder);
  } catch (err) {
    console.error('initializeJobs error:', err);
  }
}

export async function getAllJobs(params = {}) {
  try {
    let query = jobsDb.table('jobs').toCollection();

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
    const sortedJobs = all.sort((a, b) => a.order - b.order);
    
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      return {
        data: sortedJobs.slice(start, end),
        total: all.length,
        page: params.page,
        pageSize: params.pageSize
      };
    }
    return { data: sortedJobs, total: all.length };
  } catch (err) {
    console.error('getAllJobs error:', err);
    return { data: [], total: 0 };
  }
}

export async function createJob(jobData) {
  const jobsInDb = await jobsDb.table('jobs').toArray();
  const maxOrder = jobsInDb.length > 0 ? Math.max(...jobsInDb.map(j => j.order || 0)) : -1;
    
  const slug =
    jobData.title.toLowerCase().replace(/\s+/g, '-') +
    '-' +
    Math.random().toString(36).substr(2, 4);

  const newJob = {
    ...jobData,
    id: `job-${Date.now()}`,
    slug,
    order: maxOrder + 1,
    createdAt: new Date()
  };
  await jobsDb.table('jobs').add(newJob);
  return newJob;
}

export async function updateJob(id, updates) {
  await jobsDb.table('jobs').update(id, updates);
  return jobsDb.table('jobs').get(id);
}

export async function reorderJob(jobId, data) {
    const { fromOrder, toOrder } = data;

    if (Math.random() < 0.1) { 
        throw new Error("Simulated 500: Reorder failed for testing rollback.");
    }
    
    return jobsDb.transaction('rw', jobsDb.jobs, async () => {
        const jobsToUpdate = await jobsDb.jobs.orderBy('order').toArray();

        const movedJobIndex = jobsToUpdate.findIndex(j => j.id === jobId);
        if (movedJobIndex === -1) throw new Error("Job not found for reorder.");
        
        const [movedJob] = jobsToUpdate.splice(movedJobIndex, 1);
        jobsToUpdate.splice(toOrder, 0, movedJob);

        const updates = jobsToUpdate.map((job, index) => {
            return {
                key: job.id,
                changes: { order: index }
            };
        });

        await jobsDb.jobs.bulkUpdate(updates);
        
        return jobsDb.jobs.get(jobId);
    });
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