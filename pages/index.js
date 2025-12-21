import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Javuy - Java mpruy</title>
                <meta name="description" content="Gamified Java Learning App" />
            </Head>

            <nav className={styles.nav}>
                <div className={styles.logo}>Javuy</div>
                <div className={styles.navLinks}>
                    <Link href="/login">Login</Link>
                    <Link href="/register" style={{ marginLeft: '1.5rem', padding: '0.5rem 1rem', background: '#222', borderRadius: '20px', textDecoration: 'none' }}>Sign Up</Link>
                </div>
            </nav>

            <main className={styles.hero}>
                <h1 className={styles.title}>Jujur <br /> java mpruy</h1>
                <p className={styles.subtitle}>
                    nyicil ddpuy 2, anjay bismillah ddpuy 2 A. <p>
                
                    </p>
                    Design full by Gemini. 
                </p>
                <Link href="/login" className={styles.ctaButton}>
                    Start Learning Now
                </Link>
            </main>

            <section className={styles.features}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <h3>Interactive Code</h3>
                        <p>Write Java code directly in your browser and see the output instantly. No setup required.</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Gamified Journey</h3>
                        <p>Progress through levels, earn XP, maintain streaks, and visualize your growth on a 3D map.</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Instant Feedback</h3>
                        <p>Get immediate validation on your code and quizzes to learn from mistakes faster.</p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} Javuy. Built for learning.</p>
            </footer>
        </div>
    );
}
