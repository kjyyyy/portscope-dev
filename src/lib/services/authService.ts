// import jwt from 'jsonwebtoken';
//import bcrypt from 'bcryptjs';
//import { User } from '../../types/userTypes';

// const users: User[] = []; // In-memory user storage for demonstration

// const authService = {
//   async login(email: string, password: string) {
//     const user = users.find(u => u.email === email);
//     if (!user) {
//       return null;
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isPasswordValid) {
//       return null;
//     }

//     const token = this.generateToken(user);
//     return { user, token };
//   },

//   async register(email: string, password: string, name: string) {
//     const existingUser = users.find(u => u.email === email);
//     if (existingUser) {
//       throw new Error('User already exists');
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     const newUser: User = {
//       id: (users.length + 1).toString(),
//       email,
//       name,
//       passwordHash,
//     };

//     users.push(newUser);
//     const token = this.generateToken(newUser);
//     return { user: newUser, token };
//   },

//   generateToken(user: User) {
//     const payload = { id: user.id, email: user.email, name: user.name };
//     return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
//   },

//   validateToken(token: string) {
//     try {
//       return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
//     } catch (error) {
//       console.error('Token validation error:', error);
//       return null;
//     }
//   }
// };

// export default authService;