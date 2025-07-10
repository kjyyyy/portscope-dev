"use client";

import { useState } from 'react';
import styles from './auth.module.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const body = isSignUp ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        // Handle successful login/register
        console.log('Success:', data);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Logo" />
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        {isSignUp && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <div className={styles.toggle}>
        <p>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
      <div className={styles.social}>
        <button>Sign up with Google</button>
        <button>Sign up with Facebook</button>
      </div>
    </div>
  );
};

export default AuthPage;
