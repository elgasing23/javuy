import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const router = useRouter();

    const menuItems = [
        {
            name: 'Progress',
            path: '/journey',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                    <line x1="9" y1="3" x2="9" y2="18"></line>
                    <line x1="15" y1="6" x2="15" y2="21"></line>
                </svg>
            )
        },
        {
            name: 'Profile',
            path: '/profile',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h1>Javuy</h1>
            </div>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.name}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={async () => {
                    await fetch('/api/auth/logout');
                    router.push('/');
                }}
                className={styles.navItem}
                style={{
                    background: 'transparent', border: 'none', color: '#ff6b6b',
                    marginTop: 'auto', cursor: 'pointer', width: '100%', font: 'inherit'
                }}
            >
                <span className={styles.icon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </span>
                <span className={styles.label}>Logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;
