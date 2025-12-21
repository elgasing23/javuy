import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (res.ok) {
                router.push('/journey');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Login failed');
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

                {error && <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Username</label>
                    <input
                        type="text" required
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
                    <input
                        type="password" required
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputStyle}
                    />
                </div>

                <button type="submit" style={btnStyle}>Login</button>

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
