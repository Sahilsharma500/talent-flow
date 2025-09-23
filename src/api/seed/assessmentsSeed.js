// src/seed/assessmentsSeed.js
import { faker } from '@faker-js/faker';

faker.seed(12345);

function generateQuestion(sectionIndex, questionIndex) {
  const types = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload'];
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

// Generate mock responses with scores for multiple candidates
export function generateCandidateResponses(assessments, candidates) {
  const responses = [];
  assessments.forEach(assessment => {
    faker.helpers.shuffle(candidates).slice(0, faker.number.int({ min: 5, max: 15 })).forEach(candidate => {
      responses.push({
        id: faker.string.uuid(),
        assessmentId: assessment.id,
        candidateId: candidate.id,
        score: faker.number.int({ min: 20, max: 100 }),
        responses: {}, // Mock responses, not used for this UI but good practice
        submittedAt: faker.date.past({ days: 30 })
      });
    });
  });
  return responses;
}

const jobIds = ['job-1', 'job-2', 'job-3'];
export const assessmentsSeed = jobIds.map(jobId => generateAssessment(jobId));