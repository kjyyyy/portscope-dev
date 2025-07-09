declare module 'authService' {
  export interface User {
    id: number;
    email: string;
    name: string;
  }

  export interface AuthService {
    login(email: string, password: string): Promise<{ user: User, token: string } | null>;
    register(email: string, password: string, name: string): Promise<{ user: User, token: string }>;
    generateToken(user: User): string;
    validateToken(token: string): User | null;
  }

  const authService: AuthService;
  export default authService;
}