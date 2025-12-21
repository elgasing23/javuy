import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
