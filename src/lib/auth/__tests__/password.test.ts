import { hashPassword, verifyPassword } from '../password';

describe('Password Hashing and Verification', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', () => {
      const password = 'testPassword123';
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password (salt randomization)', () => {
      const password = 'testPassword123';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', () => {
      const hash = hashPassword('');
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle very long passwords', () => {
      const longPassword = 'a'.repeat(1000);
      const hash = hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters in password', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters in password', () => {
      const password = '密码测试🔐🔑';
      const hash = hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'correctPassword123';
      const hash = hashPassword(password);

      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = 'correctPassword123';
      const hash = hashPassword(password);

      const isValid = verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should be case sensitive', () => {
      const password = 'Password123';
      const hash = hashPassword(password);

      expect(verifyPassword('password123', hash)).toBe(false);
      expect(verifyPassword('PASSWORD123', hash)).toBe(false);
      expect(verifyPassword('Password123', hash)).toBe(true);
    });

    it('should reject password with extra whitespace', () => {
      const password = 'password123';
      const hash = hashPassword(password);

      expect(verifyPassword(' password123', hash)).toBe(false);
      expect(verifyPassword('password123 ', hash)).toBe(false);
      expect(verifyPassword(' password123 ', hash)).toBe(false);
    });

    it('should handle empty password verification', () => {
      const hash = hashPassword('');
      expect(verifyPassword('', hash)).toBe(true);
      expect(verifyPassword('notEmpty', hash)).toBe(false);
    });

    it('should reject verification with invalid hash format', () => {
      expect(verifyPassword('password123', 'invalid-hash')).toBe(false);
      expect(verifyPassword('password123', '')).toBe(false);
    });

    it('should handle special characters in verification', () => {
      const password = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword(password.slice(0, -1), hash)).toBe(false);
    });

    it('should handle unicode characters in verification', () => {
      const password = '密码测试🔐🔑';
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
      expect(verifyPassword('密码测试', hash)).toBe(false);
    });
  });

  describe('Integration: Hash and Verify Workflow', () => {
    it('should support complete registration and login workflow', () => {
      // Simulate user registration
      const registrationPassword = 'userPassword123!';
      const storedHash = hashPassword(registrationPassword);

      // Simulate user login with correct password
      expect(verifyPassword(registrationPassword, storedHash)).toBe(true);

      // Simulate user login with incorrect password
      expect(verifyPassword('wrongPassword', storedHash)).toBe(false);
    });

    it('should maintain security across multiple users with same password', () => {
      const sharedPassword = 'commonPassword123';

      const user1Hash = hashPassword(sharedPassword);
      const user2Hash = hashPassword(sharedPassword);

      // Hashes should be different (different salts)
      expect(user1Hash).not.toBe(user2Hash);

      // But both should verify correctly
      expect(verifyPassword(sharedPassword, user1Hash)).toBe(true);
      expect(verifyPassword(sharedPassword, user2Hash)).toBe(true);

      // Cross-verification should not work (different salts)
      // This is actually expected to work with bcrypt - same password verifies against any hash
      expect(verifyPassword(sharedPassword, user1Hash)).toBe(true);
      expect(verifyPassword(sharedPassword, user2Hash)).toBe(true);
    });
  });

  describe('Security Properties', () => {
    it('should produce bcrypt-formatted hash', () => {
      const hash = hashPassword('test');
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should use configured salt rounds (evident in hash)', () => {
      const hash = hashPassword('test');
      // Hash format: $2a$10$... where 10 is the salt rounds
      const saltRounds = hash.split('$')[2];
      expect(saltRounds).toBe('10');
    });

    it('should take reasonable time to hash (security vs performance)', () => {
      const start = Date.now();
      hashPassword('testPassword');
      const duration = Date.now() - start;

      // With 10 rounds, should be fast but not instant
      // Typically 50-200ms depending on hardware
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
