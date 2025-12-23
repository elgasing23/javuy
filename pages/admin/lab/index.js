
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';

export default function AdminLabsIndex() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/lab')
            .then(res => res.json())
            .then(data => {
                if (data.labs) {
                    setLabs(data.labs);
                }
                setLoading(false);
            })
            .catch(err => {
                toast.error('Failed to fetch labs');
                setLoading(false);
            });
    }, []);



    const deleteLab = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this lab?')) return;

        try {
            const res = await fetch(`/api/lab/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLabs(labs.filter(l => l.id !== id));
                toast.success('Lab deleted');
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting lab');
        }
    };

    if (loading) return <Layout><div style={{ padding: '2rem', color: '#fff' }}>Loading...</div></Layout>;

    return (
        <Layout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff' }}>Manage Java Labs</h1>
                    <button
                        onClick={() => router.push('/admin/lab/create')}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'black',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        + Create New Lab
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {labs.map(lab => (
                        <div
                            key={lab.id}
                            onClick={() => router.push(`/admin/lab/${lab.id}`)}
                            style={{
                                background: '#1e1e1e',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <div>
                                <span style={{
                                    display: 'inline-block', width: '30px', height: '30px',
                                    background: '#333', textAlign: 'center', lineHeight: '30px',
                                    borderRadius: '50%', marginRight: '1rem', fontWeight: 'bold'
                                }}>
                                    {lab.id}
                                </span>
                                <span style={{ fontSize: '1.2rem', color: '#eee' }}>{lab.title}</span>
                            </div>
                            <button
                                onClick={(e) => deleteLab(e, lab.id)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #666',
                                    color: '#666',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    {labs.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>No labs found. Create one to get started.</p>}
                </div>
            </div>
        </Layout>
    );
}
