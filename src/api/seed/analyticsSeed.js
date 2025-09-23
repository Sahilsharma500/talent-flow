// src/seed/analyticsSeed.js
import { faker } from '@faker-js/faker';

faker.seed(12345);

const generateDailyApplicants = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData = {};
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dailyData[date] = faker.number.int({ min: 0, max: 20 });
    }
    return dailyData;
};

const generateMonthlyAnalytics = (months = 6) => {
    const analytics = {};
    const jobIds = Array.from({ length: 5 }, (_, i) => `job-${i + 1}`);

    for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;

        const totalApplicants = faker.number.int({ min: 50, max: 200 });
        const hiredCandidates = faker.number.int({ min: 5, max: 25 });
        const rejectedCandidates = faker.number.int({ min: 20, max: 100 });
        const totalJobs = faker.number.int({ min: 10, max: 30 });
        
        // Generate job-wise data for comparison
        const jobsData = jobIds.map(id => ({
            id,
            applicants: faker.number.int({ min: 10, max: 50 })
        }));

        analytics[monthKey] = {
            totalApplicants,
            hiredCandidates,
            rejectedCandidates,
            totalJobs,
            dailyApplicants: generateDailyApplicants(month, year),
            jobsData
        };
    }
    return analytics;
};

const generateJobs = () => {
    return [
        { id: 'job-1', title: 'Senior Software Engineer' },
        { id: 'job-2', title: 'Product Manager' },
        { id: 'job-3', title: 'UX Designer' },
        { id: 'job-4', title: 'Data Scientist' },
        { id: 'job-5', title: 'Marketing Specialist' },
    ];
};

export const analyticsSeed = {
    monthlyData: generateMonthlyAnalytics(),
    jobs: generateJobs(),
};