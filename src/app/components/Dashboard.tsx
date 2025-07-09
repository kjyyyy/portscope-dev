import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import FileUpload from './FileUpload';

interface User {
  name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
        return;
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          router.push('/sign-in');
          return;
        }

        setUser(data.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        router.push('/sign-in');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>PortScope Dashboard</h1>
      {user && <p>Welcome, {user.name}!</p>}
      <FileUpload />
    </div>
  );
};

export default Dashboard;