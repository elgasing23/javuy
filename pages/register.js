import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous internal error state

        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: form.username, password: form.password })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Account created! Managing login...');
                router.push('/journey');
            } else {
                toast.error(data.message || 'Registration failed');
                setLoading(false);
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e1e1e', color: 'white', fontFamily: '"Inter", sans-serif'
        }}>
            <Head><title>Register - Javuy</title></Head>
            <form onSubmit={handleSubmit} style={{
                width: '100%', maxWidth: '400px', padding: '2rem',
                background: '#252526', borderRadius: '12px', border: '1px solid #333'
            }}>
                <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontFamily: '"Outfit", sans-serif' }}>Create Account</h1>

                {/* The error display div is removed as toast will handle error messages */}

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Username</label>
                    <input
                        type="text" required
                        value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                        style={inputStyle}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password</label>
                    <input
                        type="password" required
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputStyle}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Confirm Password</label>
                    <input
                        type="password" required
                        value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        style={inputStyle}
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#888' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--accent-primary, #00d1b2)', textDecoration: 'none' }}>Login</Link>
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
