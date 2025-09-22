import { faker } from '@faker-js/faker';

faker.seed(12345); 

const jobTitles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'UI/UX Designer', 'Product Manager', 'Data Scientist',
  'DevOps Engineer', 'Mobile Developer', 'QA Engineer',
  'Project Manager', 'Business Analyst', 'Marketing Manager'
];

const techTags = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
  'TypeScript', 'JavaScript', 'AWS', 'Docker', 'Kubernetes',
  'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API'
];

const jobTypes = ['Full-time', 'Remote', 'Part-time', 'Contract'];

function generateJob(index) {
  const title = faker.helpers.arrayElement(jobTitles);
  const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + faker.string.alphanumeric(4);

  return {
    id: `job-${index + 1}`,
    title,
    slug,
    status: faker.helpers.arrayElement(['active', 'active', 'active', 'archived']),
    tags: faker.helpers.arrayElements(techTags, { min: 2, max: 5 }),
    order: index,
    description: faker.lorem.paragraphs(2),
    requirements: Array.from(
      { length: faker.number.int({ min: 3, max: 6 }) },
      () => faker.lorem.sentence()
    ),
    salary: `$${faker.number.int({ min: 50, max: 200 })}K - $${faker.number.int({ min: 200, max: 300 })}K`,
    location: faker.location.city() + ', ' + faker.location.state(),
    jobType: faker.helpers.arrayElement(jobTypes),
    createdAt: faker.date.past({ years: 1 })
  };
}

export const jobsSeed = Array.from({ length: 25 }, (_, i) => generateJob(i));
