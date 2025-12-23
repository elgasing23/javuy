import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import dbConnect from '../lib/db';
import Chapter from '../lib/models/Chapter';
import Progress from '../lib/models/Progress';
import User from '../lib/models/User';
import Layout from '../components/Layout';
import JourneyMap from '../components/JourneyMap';

export async function getServerSideProps(context) {
    const { req } = context;
    const { token } = req.cookies;
    const JWT_SECRET = 'super-secret-key-change-this-in-prod';

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await dbConnect();

        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            };
        }

        const chapters = await Chapter.find({}).sort({ order: 1 }).lean();
        const progressDocs = await Progress.find({ user: user._id }).lean();

        // Map progress & Serialize for Next.js (Date objects to Strings)
        const journey = chapters.map(chapter => {
            const progress = progressDocs.find(p => p.chapter.toString() === chapter._id.toString());
            return {
                ...chapter,
                _id: chapter._id.toString(),
                createdAt: chapter.createdAt?.toISOString() || null,
                updatedAt: chapter.updatedAt?.toISOString() || null,
                status: progress ? progress.status : 'locked',
            };
        });

        return {
            props: {
                journeyData: {
                    user: {
                        username: user.username,
                        xp: user.xp,
                        streak: user.streak,
                        avatar: user.avatar,
                        role: user.role // Pass role to client
                    },
                    journey
                }
            },
        };

    } catch (err) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }
}

export default function Journey({ journeyData }) {
    const router = useRouter();

    const handleChapterClick = (chapterId) => {
        const chapter = journeyData.journey.find(c => c._id === chapterId);

        // Allow access if active, completed, OR if user is admin
        const isAdmin = journeyData.user.role === 'admin';
        if (chapter.status === 'locked' && !isAdmin) return;

        router.push(`/learn/${chapterId}`);
    };

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
