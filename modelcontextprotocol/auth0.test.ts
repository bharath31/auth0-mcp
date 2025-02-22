import { Auth0AgentToolkit } from './auth0';

describe('Auth0AgentToolkit', () => {
  let toolkit: Auth0AgentToolkit;

  beforeEach(() => {
    toolkit = new Auth0AgentToolkit({
      domain: 'test-domain.auth0.com',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });
  });

  describe('createUser', () => {
    it('validates required parameters', async () => {
      const result = await toolkit.createUser({});
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid parameters provided');
    });

    it('validates email format', async () => {
      const result = await toolkit.createUser({
        email: 'invalid-email',
        password: 'validpassword123',
      });
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid parameters provided');
    });

    it('validates password length', async () => {
      const result = await toolkit.createUser({
        email: 'test@example.com',
        password: 'short',
      });
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid parameters provided');
    });
  });

  describe('getFunctions', () => {
    it('returns all available functions', () => {
      const functions = toolkit.getFunctions();
      expect(functions).toHaveLength(1);
      expect(functions[0][0].name).toBe('auth0_create_user');
    });
  });
});
