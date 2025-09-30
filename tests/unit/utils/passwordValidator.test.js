const {
  validatePasswordStrength,
  calculatePasswordStrength,
  generateStrongPassword
} = require('../../../utils/passwordValidator');

describe('Password Validator', () => {
  describe('validatePasswordStrength', () => {
    it('should accept a strong password', () => {
      const result = validatePasswordStrength('SecureP@ss123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('securepass123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('SECUREPASS123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('SecurePass!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('SecurePass123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>?/)');
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Sec1!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A'.repeat(129) + '1!';
      const result = validatePasswordStrength(longPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot exceed 128 characters');
    });

    it('should reject common passwords', () => {
      const result = validatePasswordStrength('password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is too common. Please choose a more unique password');
    });

    it('should reject passwords with sequential characters', () => {
      const result = validatePasswordStrength('Abcd1234!@#');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password should not contain sequential characters');
    });

    it('should reject passwords with repeated characters', () => {
      const result = validatePasswordStrength('Aaa111!!!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password should not contain repeated characters (e.g., aaa, 111)');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should rate a weak password', () => {
      const result = calculatePasswordStrength('password');
      
      expect(result.score).toBeLessThan(40);
      expect(result.strength).toBe('weak');
    });

    it('should rate a medium password', () => {
      const result = calculatePasswordStrength('Password123');
      
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(70);
      expect(result.strength).toBe('medium');
    });

    it('should rate a strong password', () => {
      const result = calculatePasswordStrength('SecureP@ss123!');
      
      expect(result.score).toBeGreaterThanOrEqual(70);
      expect(['strong', 'very strong']).toContain(result.strength);
    });

    it('should rate a very strong password', () => {
      const result = calculatePasswordStrength('V3ry$tr0ng&C0mpl3x!P@ssw0rd#2024');
      
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.strength).toBe('very strong');
    });

    it('should give higher scores for longer passwords', () => {
      const short = calculatePasswordStrength('Sec1!');
      const medium = calculatePasswordStrength('SecureP@ss1!');
      const long = calculatePasswordStrength('VerySecureP@ssw0rd123!');
      
      expect(medium.score).toBeGreaterThan(short.score);
      expect(long.score).toBeGreaterThan(medium.score);
    });

    it('should give higher scores for more character variety', () => {
      const simple = calculatePasswordStrength('Password123!');
      const complex = calculatePasswordStrength('P@$$w0rd!#$%');
      
      expect(complex.score).toBeGreaterThanOrEqual(simple.score);
    });
  });

  describe('generateStrongPassword', () => {
    it('should generate password of default length', () => {
      const password = generateStrongPassword();
      
      expect(password).toHaveLength(16);
    });

    it('should generate password of specified length', () => {
      const password = generateStrongPassword(20);
      
      expect(password).toHaveLength(20);
    });

    it('should generate password with all character types', () => {
      const password = generateStrongPassword();
      
      expect(password).toMatch(/[A-Z]/); // Uppercase
      expect(password).toMatch(/[a-z]/); // Lowercase
      expect(password).toMatch(/\d/); // Number
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/); // Special char
    });

    it('should generate different passwords each time', () => {
      const password1 = generateStrongPassword();
      const password2 = generateStrongPassword();
      
      expect(password1).not.toBe(password2);
    });

    it('should generate valid strong password', () => {
      const password = generateStrongPassword();
      const validation = validatePasswordStrength(password);
      
      expect(validation.isValid).toBe(true);
    });
  });
});
