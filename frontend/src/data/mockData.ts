import { JobPosting } from '../types';

export const mockJobPostings: JobPosting[] = [
  {
    id: '1',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    status: 'Active',
    datePosted: '2024-02-01',
    applicationDeadline: '2024-03-15',
    description:
      'We are looking for a Senior Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications.',
    requirements: [
      '5+ years of experience in software development',
      'Strong proficiency in JavaScript, TypeScript, and React',
      'Experience with modern web technologies and frameworks',
      'Excellent problem-solving and communication skills',
    ],
    responsibilities: [
      'Design and implement new features for our web applications',
      'Collaborate with cross-functional teams',
      'Mentor junior developers',
      'Participate in code reviews and architectural discussions',
    ],
  },
  {
    id: '2',
    jobTitle: 'Product Manager',
    department: 'Product',
    location: 'San Francisco',
    status: 'Active',
    datePosted: '2024-02-05',
    applicationDeadline: '2024-03-20',
    description:
      'We are seeking an experienced Product Manager to lead product strategy and execution. You will work closely with engineering, design, and business teams to deliver innovative products.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and strategic thinking skills',
      'Experience with Agile methodologies',
      'Excellent stakeholder management abilities',
    ],
    responsibilities: [
      'Define product vision and roadmap',
      'Gather and prioritize product requirements',
      'Work with engineering teams to deliver features',
      'Analyze product metrics and user feedback',
    ],
  },
  {
    id: '3',
    jobTitle: 'UX Designer',
    department: 'Design',
    location: 'Boston',
    status: 'Active',
    datePosted: '2024-02-10',
    applicationDeadline: '2024-03-25',
    description:
      'Join our design team as a UX Designer to create intuitive and engaging user experiences. You will conduct user research, create wireframes, and collaborate with product and engineering teams.',
    requirements: [
      '3+ years of UX design experience',
      'Proficiency in Figma, Sketch, or similar design tools',
      'Strong portfolio demonstrating user-centered design',
      'Experience with user research and usability testing',
    ],
    responsibilities: [
      'Conduct user research and usability testing',
      'Create wireframes, prototypes, and high-fidelity designs',
      'Collaborate with product managers and engineers',
      'Maintain and evolve our design system',
    ],
  },
];
