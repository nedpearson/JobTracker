import {
  validateApplication,
  validateJob,
  validateUser,
  validateStageTransition,
  checkRequiredFields,
  sanitizeForDatabase,
} from '../validator';
import type { ApplicationStage } from '@prisma/client';

describe('Validator Module', () => {
  describe('validateApplication', () => {
    const validApplication = {
      id: 'app-123',
      userId: 'user-456',
      jobId: 'job-789',
      stage: 'APPLIED' as ApplicationStage,
      appliedAt: new Date(),
      nextFollowUpAt: null,
      contactName: 'John Doe',
      contactEmail: 'john@example.com',
      notes: 'Looks promising',
    };

    it('should validate a correct application', () => {
      const result = validateApplication(validApplication);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('app-123');
    });

    it('should reject application with missing id', () => {
      const invalid = { ...validApplication, id: '' };
      const result = validateApplication(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should reject application with missing userId', () => {
      const invalid = { ...validApplication, userId: '' };
      const result = validateApplication(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('userId'))).toBe(true);
    });

    it('should reject application with missing jobId', () => {
      const invalid = { ...validApplication, jobId: '' };
      const result = validateApplication(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('jobId'))).toBe(true);
    });

    it('should reject application with invalid stage', () => {
      const invalid = { ...validApplication, stage: 'INVALID_STAGE' };
      const result = validateApplication(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('stage'))).toBe(true);
    });

    it('should accept all valid application stages', () => {
      const stages: ApplicationStage[] = [
        'INTERESTED',
        'APPLIED',
        'RECRUITER_SCREEN',
        'INTERVIEW',
        'OFFER',
        'CLOSED',
      ];

      stages.forEach(stage => {
        const app = { ...validApplication, stage };
        const result = validateApplication(app);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject application with invalid email format', () => {
      const invalid = { ...validApplication, contactEmail: 'not-an-email' };
      const result = validateApplication(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should accept application with null optional fields', () => {
      const app = {
        id: 'app-123',
        userId: 'user-456',
        jobId: 'job-789',
        stage: 'INTERESTED' as ApplicationStage,
        appliedAt: null,
        nextFollowUpAt: null,
        contactName: null,
        contactEmail: null,
        notes: null,
      };

      const result = validateApplication(app);
      expect(result.valid).toBe(true);
    });

    it('should accept application without optional fields', () => {
      const app = {
        id: 'app-123',
        userId: 'user-456',
        jobId: 'job-789',
        stage: 'INTERESTED' as ApplicationStage,
      };

      const result = validateApplication(app);
      expect(result.valid).toBe(true);
    });

    it('should handle multiple validation errors', () => {
      const invalid = {
        id: '',
        userId: '',
        jobId: '',
        stage: 'INVALID',
        contactEmail: 'not-an-email',
      };

      const result = validateApplication(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateJob', () => {
    const validJob = {
      id: 'job-123',
      userId: 'user-456',
      title: 'Software Engineer',
      companyId: 'company-789',
      location: 'San Francisco, CA',
      workMode: 'REMOTE' as const,
      description: 'Great opportunity',
      matchScore: 85,
    };

    it('should validate a correct job', () => {
      const result = validateJob(validJob);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Software Engineer');
    });

    it('should reject job with missing id', () => {
      const invalid = { ...validJob, id: '' };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should reject job with missing userId', () => {
      const invalid = { ...validJob, userId: '' };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('userId'))).toBe(true);
    });

    it('should reject job with missing title', () => {
      const invalid = { ...validJob, title: '' };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
    });

    it('should accept all valid work modes', () => {
      const workModes = ['ONSITE', 'REMOTE', 'HYBRID'] as const;

      workModes.forEach(workMode => {
        const job = { ...validJob, workMode };
        const result = validateJob(job);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject job with invalid work mode', () => {
      const invalid = { ...validJob, workMode: 'INVALID' };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('workMode'))).toBe(true);
    });

    it('should accept job with null optional fields', () => {
      const job = {
        id: 'job-123',
        userId: 'user-456',
        title: 'Software Engineer',
        companyId: null,
        location: null,
        workMode: null,
        description: null,
        matchScore: null,
      };

      const result = validateJob(job);
      expect(result.valid).toBe(true);
    });

    it('should reject matchScore below 0', () => {
      const invalid = { ...validJob, matchScore: -1 };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('matchScore'))).toBe(true);
    });

    it('should reject matchScore above 100', () => {
      const invalid = { ...validJob, matchScore: 101 };
      const result = validateJob(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('matchScore'))).toBe(true);
    });

    it('should accept matchScore at boundaries (0 and 100)', () => {
      const job0 = { ...validJob, matchScore: 0 };
      const job100 = { ...validJob, matchScore: 100 };

      expect(validateJob(job0).valid).toBe(true);
      expect(validateJob(job100).valid).toBe(true);
    });

    it('should accept minimal valid job', () => {
      const minimalJob = {
        id: 'job-123',
        userId: 'user-456',
        title: 'Engineer',
      };

      const result = validateJob(minimalJob);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateUser', () => {
    const validUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: '$2a$10$...',
    };

    it('should validate a correct user', () => {
      const result = validateUser(validUser);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should reject user with missing id', () => {
      const invalid = { ...validUser, id: '' };
      const result = validateUser(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should reject user with invalid email', () => {
      const invalid = { ...validUser, email: 'not-an-email' };
      const result = validateUser(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should reject user with empty email', () => {
      const invalid = { ...validUser, email: '' };
      const result = validateUser(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should accept various valid email formats', () => {
      const emails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'first.last@company.org',
        'admin@example.io',
      ];

      emails.forEach(email => {
        const user = { ...validUser, email };
        const result = validateUser(user);
        expect(result.valid).toBe(true);
      });
    });

    it('should accept user with null optional fields', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: null,
        passwordHash: null,
      };

      const result = validateUser(user);
      expect(result.valid).toBe(true);
    });

    it('should accept minimal valid user', () => {
      const minimalUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const result = validateUser(minimalUser);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateStageTransition', () => {
    it('should allow normal forward progression', () => {
      const result = validateStageTransition('INTERESTED', 'APPLIED');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('should allow transition to same stage', () => {
      const result = validateStageTransition('APPLIED', 'APPLIED');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('should allow complete progression flow', () => {
      const stages: ApplicationStage[] = [
        'INTERESTED',
        'APPLIED',
        'RECRUITER_SCREEN',
        'INTERVIEW',
        'OFFER',
        'CLOSED',
      ];

      for (let i = 0; i < stages.length - 1; i++) {
        const result = validateStageTransition(stages[i], stages[i + 1]);
        expect(result.valid).toBe(true);
      }
    });

    it('should warn when moving backwards', () => {
      const result = validateStageTransition('INTERVIEW', 'APPLIED');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('backwards');
    });

    it('should warn when reopening closed application', () => {
      const result = validateStageTransition('CLOSED', 'INTERVIEW');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('Reopening');
    });

    it('should allow closing from any stage', () => {
      const stages: ApplicationStage[] = [
        'INTERESTED',
        'APPLIED',
        'RECRUITER_SCREEN',
        'INTERVIEW',
        'OFFER',
      ];

      stages.forEach(stage => {
        const result = validateStageTransition(stage, 'CLOSED');
        expect(result.valid).toBe(true);
        expect(result.warning).toBeUndefined();
      });
    });

    it('should not warn when moving forward multiple stages', () => {
      const result = validateStageTransition('INTERESTED', 'INTERVIEW');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('should reject invalid stage names', () => {
      const result = validateStageTransition(
        'INVALID' as ApplicationStage,
        'APPLIED'
      );
      expect(result.valid).toBe(false);
    });

    it('should not warn when moving backward to CLOSED', () => {
      const result = validateStageTransition('OFFER', 'CLOSED');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('should allow staying in CLOSED state', () => {
      const result = validateStageTransition('CLOSED', 'CLOSED');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });
  });

  describe('checkRequiredFields', () => {
    it('should pass when all fields have values', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should detect undefined fields', () => {
      const obj = {
        name: 'John',
        email: undefined,
        age: 30,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
    });

    it('should detect null fields', () => {
      const obj = {
        name: 'John',
        email: null,
        age: 30,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
    });

    it('should detect empty string fields', () => {
      const obj = {
        name: 'John',
        email: '',
        age: 30,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
    });

    it('should detect whitespace-only string fields', () => {
      const obj = {
        name: 'John',
        email: '   ',
        age: 30,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('email');
    });

    it('should accept strings with content', () => {
      const obj = {
        name: ' John ',
        email: 'john@example.com',
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should accept number 0 as valid', () => {
      const obj = {
        count: 0,
        score: 0,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(true);
    });

    it('should accept false boolean as valid', () => {
      const obj = {
        isActive: false,
        isVerified: false,
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(true);
    });

    it('should detect multiple missing fields', () => {
      const obj = {
        name: null,
        email: '',
        age: undefined,
        city: 'NYC',
      };

      const result = checkRequiredFields(obj);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toHaveLength(3);
      expect(result.missingFields).toContain('name');
      expect(result.missingFields).toContain('email');
      expect(result.missingFields).toContain('age');
    });

    it('should handle empty object', () => {
      const result = checkRequiredFields({});
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });
  });

  describe('sanitizeForDatabase', () => {
    it('should trim string values', () => {
      const obj = {
        name: '  John  ',
        email: ' john@example.com ',
      };

      const result = sanitizeForDatabase(obj);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should preserve null values', () => {
      const obj = {
        name: 'John',
        email: null,
      };

      const result = sanitizeForDatabase(obj);
      expect(result.email).toBeNull();
    });

    it('should remove undefined values', () => {
      const obj = {
        name: 'John',
        email: undefined,
        age: 30,
      };

      const result = sanitizeForDatabase(obj);
      expect(result).not.toHaveProperty('email');
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should preserve numbers', () => {
      const obj = {
        age: 30,
        score: 0,
        rating: -5,
      };

      const result = sanitizeForDatabase(obj);
      expect(result.age).toBe(30);
      expect(result.score).toBe(0);
      expect(result.rating).toBe(-5);
    });

    it('should preserve booleans', () => {
      const obj = {
        isActive: true,
        isVerified: false,
      };

      const result = sanitizeForDatabase(obj);
      expect(result.isActive).toBe(true);
      expect(result.isVerified).toBe(false);
    });

    it('should preserve objects', () => {
      const obj = {
        metadata: { foo: 'bar' },
        array: [1, 2, 3],
      };

      const result = sanitizeForDatabase(obj);
      expect(result.metadata).toEqual({ foo: 'bar' });
      expect(result.array).toEqual([1, 2, 3]);
    });

    it('should handle empty strings', () => {
      const obj = {
        name: '',
        email: '   ',
      };

      const result = sanitizeForDatabase(obj);
      expect(result.name).toBe('');
      expect(result.email).toBe('');
    });

    it('should handle mixed types', () => {
      const obj = {
        string: '  test  ',
        number: 42,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
        object: { key: 'value' },
      };

      const result = sanitizeForDatabase(obj);
      expect(result.string).toBe('test');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.nullValue).toBeNull();
      expect(result).not.toHaveProperty('undefinedValue');
      expect(result.object).toEqual({ key: 'value' });
    });

    it('should handle empty object', () => {
      const result = sanitizeForDatabase({});
      expect(result).toEqual({});
    });

    it('should not mutate original object', () => {
      const obj = {
        name: '  John  ',
        email: undefined,
      };

      const original = { ...obj };
      sanitizeForDatabase(obj);

      expect(obj).toEqual(original);
    });
  });
});
