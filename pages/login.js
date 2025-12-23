import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/journey');
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Logged in successfully!'); // Use toast for success
                router.push('/journey');
            } else {
                toast.error(data.message || 'Login failed'); // Use toast for error
                setLoading(false); // Reset loading on error
            }
        } catch (err) {
            toast.error('An unexpected error occurred'); // Use toast for unexpected error
            setLoading(false); // Reset loading on catch error
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e1e1e', color: 'white', fontFamily: '"Inter", sans-serif'
        }}>
            <Head><title>Login - Javuy</title></Head>
            <form onSubmit={handleSubmit} style={{
                width: '100%', maxWidth: '400px', padding: '2rem',
                background: '#252526', borderRadius: '12px', border: '1px solid #333'
            }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontFamily: '"Outfit", sans-serif' }}>Welcome Back</h1>

                {/* Removed error display div as toast handles messages */}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Username</label>
                    <input
                        type="text" required
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                        style={inputStyle}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
                    <input
                        type="password" required
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputStyle}
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    style={{ ...btnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#888' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--accent-primary, #00d1b2)', textDecoration: 'none' }}>Register</Link>
                </p>
            </form>
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444',
    background: '#1e1e1e', color: 'white', outline: 'none', fontSize: '1rem'
};

const btnStyle = {
    width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
    background: 'var(--accent-primary, #00d1b2)', color: '#000', fontWeight: 'bold',
    fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.1s'
};
