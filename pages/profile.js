import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Profile.module.css';

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => setUser(data));
    }, []);

    if (!user) return <Layout><div style={{ color: 'white' }}>Loading...</div></Layout>;

    return (
        <Layout>
            <div className={styles.profileContainer}>
                <div className={styles.header}>
                    <img src={user.avatar} alt="Avatar" className={styles.avatar} />
                    <h1>{user.username}</h1>
                    <p className={styles.joined}>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total XP</h3>
                        <p className={styles.statValue}>
                            {user.xp}
                            <span style={{ color: 'var(--accent-secondary)', marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                </svg>
                            </span>
                        </p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Day Streak</h3>
                        <p className={styles.statValue}>
                            {user.streak}
                            <span style={{ color: 'var(--accent-primary)', marginLeft: '8px', display: 'inline-flex', alignItems: 'center' }}>
                                {/* Lightning Icon */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                </svg>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
