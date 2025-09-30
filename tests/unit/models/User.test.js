const User = require('../../../models/User');
const { validUser, invalidUsers } = require('../../helpers/testData');

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const user = new User(validUser);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(validUser.username);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.password).not.toBe(validUser.password); // Should be hashed
    });

    it('should fail without username', async () => {
      const user = new User(invalidUsers.noUsername);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with short username', async () => {
      const user = new User(invalidUsers.shortUsername);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with invalid email', async () => {
      const user = new User(invalidUsers.invalidEmail);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await User.create(validUser);
      const duplicateUser = new User(validUser);
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should fail with duplicate username', async () => {
      await User.create(validUser);
      const duplicateUser = new User({
        ...validUser,
        email: 'different@example.com'
      });
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const user = await User.create({
        ...validUser,
        email: 'TEST@EXAMPLE.COM'
      });
      
      expect(user.email).toBe('test@example.com');
    });

    it('should convert username to lowercase', async () => {
      const user = await User.create({
        ...validUser,
        username: 'TESTUSER'
      });
      
      expect(user.username).toBe('testuser');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = await User.create(validUser);
      
      expect(user.password).not.toBe(validUser.password);
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create(validUser);
      const originalHash = user.password;
      
      user.name = 'Updated Name';
      await user.save();
      
      expect(user.password).toBe(originalHash);
    });

    it('should compare password correctly', async () => {
      const user = await User.create(validUser);
      const userWithPassword = await User.findById(user._id).select('+password');
      
      const isMatch = await userWithPassword.comparePassword(validUser.password);
      expect(isMatch).toBe(true);
      
      const isNotMatch = await userWithPassword.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    it('should increment login attempts', async () => {
      const user = await User.create(validUser);
      
      await user.incLoginAttempts();
      const updated = await User.findById(user._id).select('+loginAttempts');
      
      expect(updated.loginAttempts).toBe(1);
    });

    it('should reset login attempts', async () => {
      const user = await User.create(validUser);
      await user.incLoginAttempts();
      await user.incLoginAttempts();
      
      await user.resetLoginAttempts();
      const updated = await User.findById(user._id).select('+loginAttempts');
      
      expect(updated.loginAttempts).toBe(0);
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = await User.create(validUser);
      
      for (let i = 0; i < 5; i++) {
        await user.incLoginAttempts();
        user.loginAttempts = i + 1; // Manually set for testing
      }
      
      const updated = await User.findById(user._id).select('+lockUntil');
      expect(updated.lockUntil).toBeDefined();
    });

    it('should detect password change', async () => {
      const user = await User.create(validUser);
      
      // Token issued before password change (1 second ago)
      const tokenIssuedAt = Math.floor((Date.now() - 2000) / 1000);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Change password
      user.password = 'NewSecureP@ss123!';
      await user.save();
      
      // Reload user with passwordChangedAt
      const updated = await User.findById(user._id).select('+passwordChangedAt');
      
      // passwordChangedAt should be set
      expect(updated.passwordChangedAt).toBeDefined();
      
      // Check if password was changed after token was issued
      const hasChanged = updated.changedPasswordAfter(tokenIssuedAt);
      expect(hasChanged).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should find user by email', async () => {
      await User.create(validUser);
      
      const found = await User.findByIdentifier(validUser.email);
      
      expect(found).toBeDefined();
      expect(found.email).toBe(validUser.email);
    });

    it('should find user by username', async () => {
      await User.create(validUser);
      
      const found = await User.findByIdentifier(validUser.username);
      
      expect(found).toBeDefined();
      expect(found.username).toBe(validUser.username);
    });

    it('should get active users count', async () => {
      await User.create(validUser);
      await User.create({
        ...validUser,
        username: 'testuser2',
        email: 'test2@example.com'
      });
      
      const count = await User.getActiveUsersCount();
      
      expect(count).toBe(2);
    });
  });

  describe('Virtuals', () => {
    it('should generate profile URL', async () => {
      const user = await User.create(validUser);
      
      expect(user.profileUrl).toBe(`/api/v1/users/${user._id}`);
    });

    it('should check if account is locked', async () => {
      const user = await User.create(validUser);
      
      expect(user.isLocked).toBe(false);
      
      // Set lock
      user.lockUntil = new Date(Date.now() + 3600000); // 1 hour from now
      await user.save();
      
      const locked = await User.findById(user._id).select('+lockUntil');
      expect(locked.isLocked).toBe(true);
    });
  });

  describe('JSON Serialization', () => {
    it('should not include sensitive fields in JSON', async () => {
      const user = await User.create(validUser);
      const json = user.toJSON();
      
      expect(json.password).toBeUndefined();
      expect(json.refreshToken).toBeUndefined();
      expect(json.loginAttempts).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });
});
