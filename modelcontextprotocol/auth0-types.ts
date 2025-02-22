export interface Auth0User {
  user_id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  blocked?: boolean;
}
