
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function LabsIndex() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/labs')
            .then(res => res.json())
            .then(data => {
                if (data.labs) {
                    setLabs(data.labs);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load labs');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '2rem', color: '#fff' }}>Loading Labs...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #00d1b2, #a7e0e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Java Labs 🧪
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Practice your Java skills in our advanced playground environments. Choose a lab below to start coding.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {labs.map(lab => (
                        <div
                            key={lab.id}
                            onClick={() => router.push(`/labs/${lab.id}`)}
                            style={{
                                background: '#1e1e1e',
                                borderRadius: '12px',
                                border: '1px solid #333',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#333';
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, right: 0,
                                background: 'rgba(255,255,255,0.05)',
                                padding: '0.5rem 1rem',
                                borderBottomLeftRadius: '12px',
                                fontSize: '3rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.05)',
                                lineHeight: 1
                            }}>
                                {lab.id}
                            </div>

                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff', position: 'relative', zIndex: 1 }}>
                                {lab.title}
                            </h2>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, position: 'relative', zIndex: 1 }}>
                                {lab.description}
                            </p>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{
                                    color: 'var(--accent-primary)',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    Open Terminal →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
