import { computeMatchScore, type MatchResult } from '../matchScore';
import type { Job, Profile, Skill, WorkMode } from '@prisma/client';

// Helper function to create a mock profile
function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    userId: 'user-1',
    headline: null,
    summary: null,
    location: null,
    desiredTitles: null,
    desiredWorkModes: null,
    minimumSalary: null,
    yearsExperience: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper function to create mock skills
function createMockSkills(skillNames: string[]): Skill[] {
  return skillNames.map((name, idx) => ({
    id: `skill-${idx}`,
    userId: 'user-1',
    name,
    level: null,
    yearsUsed: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// Helper function to create a mock job
function createMockJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    userId: 'user-1',
    source: 'manual',
    externalId: null,
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: null,
    workMode: null,
    description: 'Great opportunity',
    requirements: null,
    salary: null,
    url: null,
    postedDate: null,
    status: 'new',
    notes: null,
    matchScore: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('computeMatchScore', () => {
  describe('Skills Matching (65% weight)', () => {
    it('should return 65 points for 100% skill match', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['JavaScript', 'TypeScript', 'React']);
      const job = createMockJob({
        title: 'Frontend Developer',
        description: 'We need JavaScript, TypeScript, and React skills',
        requirements: 'Must know JavaScript TypeScript React',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(65);
      expect(result.matchedSkills).toHaveLength(3);
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('TypeScript');
      expect(result.matchedSkills).toContain('React');
    });

    it('should return 0 points when no skills match', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['Python', 'Django']);
      const job = createMockJob({
        description: 'We need JavaScript and React',
        requirements: 'Must know JavaScript React',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });

    it('should return 33 points for 50% skill match (half of 65)', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['JavaScript', 'Python']);
      const job = createMockJob({
        description: 'We need JavaScript for this role',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(33); // Math.round(65 * 0.5)
      expect(result.matchedSkills).toHaveLength(1);
      expect(result.matchedSkills).toContain('JavaScript');
    });

    it('should handle case-insensitive skill matching', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['javascript', 'REACT']);
      const job = createMockJob({
        description: 'We need JavaScript and React',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.matchedSkills).toHaveLength(2);
      expect(result.matchedSkills).toContain('javascript');
      expect(result.matchedSkills).toContain('REACT');
    });

    it('should match skills with special characters (C++, C#, .NET)', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['C++', 'C#', '.NET']);
      const job = createMockJob({
        description: 'Looking for C++, C#, and .NET developer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.matchedSkills.length).toBeGreaterThan(0);
    });

    it('should prioritize longer skill names (avoid substring matches)', () => {
      const profile = createMockProfile();
      // Skills are sorted by length in descending order
      const skills = createMockSkills(['JavaScript', 'Java']);
      const job = createMockJob({
        description: 'We need JavaScript experience',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.matchedSkills).toContain('JavaScript');
    });

    it('should return 0 when user has no skills', () => {
      const profile = createMockProfile();
      const skills: Skill[] = [];
      const job = createMockJob({
        description: 'We need JavaScript and React',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
      expect(result.notes).toContain('Add skills in Profile');
    });

    it('should search across title, requirements, and description', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['JavaScript', 'Python', 'Docker']);
      const job = createMockJob({
        title: 'JavaScript Developer',
        requirements: 'Must know Python',
        description: 'Docker experience is a plus',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.matchedSkills).toHaveLength(3);
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('Python');
      expect(result.matchedSkills).toContain('Docker');
    });

    it('should limit matched skills display to 12 in notes', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(Array.from({ length: 20 }, (_, i) => `Skill${i}`));
      const job = createMockJob({
        description: Array.from({ length: 20 }, (_, i) => `Skill${i}`).join(' '),
      });

      const result = computeMatchScore({ profile, skills, job });

      const skillsInNotes = result.notes.match(/Matched skills: (.+)\./);
      if (skillsInNotes) {
        const displayedSkills = skillsInNotes[1].split(', ');
        expect(displayedSkills.length).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('Title Preference (20% weight)', () => {
    it('should add 20 points when job title matches desired title', () => {
      const profile = createMockProfile({
        desiredTitles: 'Senior Engineer, Staff Engineer',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Senior Engineer Position',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(20);
      expect(result.notes).toContain('Title aligns with your target titles');
    });

    it('should not add points when title does not match', () => {
      const profile = createMockProfile({
        desiredTitles: 'Backend Developer',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Frontend Developer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
      expect(result.notes).not.toContain('Title aligns');
    });

    it('should handle case-insensitive title matching', () => {
      const profile = createMockProfile({
        desiredTitles: 'software engineer',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Software Engineer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(20);
    });

    it('should handle partial title matches', () => {
      const profile = createMockProfile({
        desiredTitles: 'Engineer',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Senior Software Engineer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(20);
    });

    it('should return 0 when profile has no desired titles', () => {
      const profile = createMockProfile({
        desiredTitles: null,
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Software Engineer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
    });

    it('should match any title from comma-separated list', () => {
      const profile = createMockProfile({
        desiredTitles: 'Backend Developer, Full Stack Developer, DevOps Engineer',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'DevOps Engineer - Remote',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(20);
    });
  });

  describe('Work Mode Preference (15% weight)', () => {
    it('should add 15 points when work mode matches REMOTE', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'REMOTE',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'REMOTE' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(15);
      expect(result.notes).toContain('Work mode matches your preference');
    });

    it('should add 15 points when work mode matches HYBRID', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'HYBRID',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'HYBRID' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(15);
    });

    it('should not add points when work mode does not match', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'REMOTE',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'ONSITE' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
    });

    it('should return 0 when profile has no work mode preference', () => {
      const profile = createMockProfile({
        desiredWorkModes: null,
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'REMOTE' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
    });

    it('should return 0 when job has no work mode specified', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'REMOTE',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: null,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
    });

    it('should match work mode from comma-separated list', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'REMOTE, HYBRID',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'HYBRID' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(15);
    });

    it('should handle case-insensitive work mode matching', () => {
      const profile = createMockProfile({
        desiredWorkModes: 'remote',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        workMode: 'REMOTE' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(15);
    });
  });

  describe('Combined Scoring (All factors)', () => {
    it('should return 100 points for perfect match', () => {
      const profile = createMockProfile({
        desiredTitles: 'Senior Developer',
        desiredWorkModes: 'REMOTE',
      });
      const skills = createMockSkills(['JavaScript', 'React']);
      const job = createMockJob({
        title: 'Senior Developer',
        workMode: 'REMOTE' as WorkMode,
        description: 'Looking for JavaScript and React developer',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(100);
      expect(result.matchedSkills).toHaveLength(2);
      expect(result.notes).toContain('Matched skills');
      expect(result.notes).toContain('Title aligns');
      expect(result.notes).toContain('Work mode matches');
    });

    it('should combine partial matches correctly', () => {
      const profile = createMockProfile({
        desiredTitles: 'Developer',
        desiredWorkModes: 'REMOTE',
      });
      const skills = createMockSkills(['JavaScript', 'Python']);
      const job = createMockJob({
        title: 'Software Developer',
        workMode: 'REMOTE' as WorkMode,
        description: 'We need JavaScript',
      });

      const result = computeMatchScore({ profile, skills, job });

      // 50% skill match = 33 points
      // Title match = 20 points
      // Work mode match = 15 points
      // Total = 68 points
      expect(result.score).toBe(68);
    });

    it('should never exceed 100 points', () => {
      const profile = createMockProfile({
        desiredTitles: 'Engineer',
        desiredWorkModes: 'REMOTE',
      });
      const skills = createMockSkills(['JavaScript']);
      const job = createMockJob({
        title: 'Engineer',
        workMode: 'REMOTE' as WorkMode,
        description: 'JavaScript',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should never return negative score', () => {
      const profile = null;
      const skills: Skill[] = [];
      const job = createMockJob();

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Null Handling', () => {
    it('should handle null profile', () => {
      const skills = createMockSkills(['JavaScript']);
      const job = createMockJob({
        description: 'JavaScript developer needed',
      });

      const result = computeMatchScore({ profile: null, skills, job });

      expect(result.score).toBe(65); // Only skill match counts
      expect(result.matchedSkills).toContain('JavaScript');
    });

    it('should handle empty job fields', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['JavaScript']);
      const job = createMockJob({
        title: '',
        description: null,
        requirements: null,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });

    it('should handle whitespace-only skill names', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['  ', 'JavaScript', '']);
      const job = createMockJob({
        description: 'JavaScript needed',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.matchedSkills).toEqual(['JavaScript']);
    });

    it('should handle empty desired titles and work modes', () => {
      const profile = createMockProfile({
        desiredTitles: '',
        desiredWorkModes: '',
      });
      const skills: Skill[] = [];
      const job = createMockJob({
        title: 'Engineer',
        workMode: 'REMOTE' as WorkMode,
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.score).toBe(0);
    });
  });

  describe('Notes Generation', () => {
    it('should include helpful message when no skills are added', () => {
      const profile = createMockProfile();
      const skills: Skill[] = [];
      const job = createMockJob();

      const result = computeMatchScore({ profile, skills, job });

      expect(result.notes).toContain('Add skills in Profile to improve scoring');
    });

    it('should not include skill message when skills exist', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['JavaScript']);
      const job = createMockJob({
        description: 'Python needed',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.notes).not.toContain('Add skills in Profile');
    });

    it('should generate comprehensive notes for perfect match', () => {
      const profile = createMockProfile({
        desiredTitles: 'Developer',
        desiredWorkModes: 'REMOTE',
      });
      const skills = createMockSkills(['JavaScript', 'React']);
      const job = createMockJob({
        title: 'Developer',
        workMode: 'REMOTE' as WorkMode,
        description: 'JavaScript React',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.notes).toContain('Matched skills');
      expect(result.notes).toContain('Title aligns');
      expect(result.notes).toContain('Work mode matches');
    });

    it('should generate empty notes when nothing matches', () => {
      const profile = createMockProfile();
      const skills = createMockSkills(['Python']);
      const job = createMockJob({
        description: 'JavaScript needed',
      });

      const result = computeMatchScore({ profile, skills, job });

      expect(result.notes).toBe('');
    });
  });
});
