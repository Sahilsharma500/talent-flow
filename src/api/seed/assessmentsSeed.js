import { faker } from '@faker-js/faker';

faker.seed(12345); // consistent data across refreshes

function generateQuestion(sectionIndex, questionIndex) {
  const types = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric'];
  const type = faker.helpers.arrayElement(types);

  const baseQuestion = {
    id: `q-${sectionIndex}-${questionIndex}`,
    type,
    question: faker.lorem.sentence() + '?',
    required: faker.datatype.boolean(0.7)
  };

  if (type === 'single-choice' || type === 'multi-choice') {
    baseQuestion.options = Array.from(
      { length: faker.number.int({ min: 3, max: 5 }) },
      () => faker.lorem.words(2)
    );
  }

  if (type === 'short-text' || type === 'long-text') {
    baseQuestion.validation = {
      minLength: faker.number.int({ min: 5, max: 20 }),
      maxLength: faker.number.int({ min: 50, max: 500 })
    };
  }

  if (type === 'numeric') {
    baseQuestion.validation = {
      min: faker.number.int({ min: 0, max: 10 }),
      max: faker.number.int({ min: 10, max: 100 })
    };
  }

  return baseQuestion;
}

function generateAssessment(jobId) {
  const sectionsCount = faker.number.int({ min: 2, max: 4 });

  return {
    id: `assessment-${jobId}`,
    jobId,
    title: `Assessment for ${jobId}`,
    description: faker.lorem.paragraph(),
    sections: Array.from({ length: sectionsCount }, (_, sectionIndex) => ({
      id: `section-${sectionIndex}`,
      title: faker.lorem.words(3),
      questions: Array.from(
        { length: faker.number.int({ min: 3, max: 6 }) },
        (_, questionIndex) => generateQuestion(sectionIndex, questionIndex)
      )
    })),
    createdAt: faker.date.past({ years: 1 })
  };
}

const jobIds = ['job-1', 'job-2', 'job-3'];
export const assessmentsSeed = jobIds.map(jobId => generateAssessment(jobId));
