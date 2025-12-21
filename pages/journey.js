import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import JourneyMap from '../components/JourneyMap';
import { useRouter } from 'next/router';

export default function Journey() {
    const [journeyData, setJourneyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/journey')
            .then(res => {
                if (res.status === 401) {
                    router.push('/login');
                    throw new Error('Not authenticated');
                }
                return res.json();
            })
            .then(data => {
                if (!data.user) {
                    throw new Error('No user data');
                }
                setJourneyData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch journey:', err);
                // If it wasn't a redirect (e.g. network error), we might want to stay here or show error.
                // But for now, if loading gets stuck, user sees "Loading journey..."
            });
    }, []);

    const handleChapterClick = (chapterId) => {
        const chapter = journeyData.journey.find(c => c._id === chapterId);
        if (chapter.status === 'locked') return;

        router.push(`/learn/${chapterId}`);
    };

    if (loading) return <Layout><div style={{ color: 'white' }}>Loading journey...</div></Layout>;
    if (!journeyData) return <Layout><div style={{ color: 'white' }}>Error loading journey. Ensure database is seeded.</div></Layout>;

    return (
        <Layout>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Java Journey</h1>
                <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        XP: <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{journeyData.user.xp}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent-secondary)" stroke="none">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                    </span>
                    <span style={{ width: '1px', height: '20px', background: 'var(--bg-tertiary)' }}></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Streak: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{journeyData.user.streak}</span>
                        {/* Lightning Icon for Streak */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </span>
                </p>
            </header>
            <JourneyMap
                chapters={journeyData.journey}
                onChapterClick={handleChapterClick}
            />
        </Layout>
    );
}
