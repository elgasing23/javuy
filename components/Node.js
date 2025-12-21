import styles from './Node.module.css';

const Node = ({ chapter, status, onClick }) => {
    const isLocked = status === 'locked';
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
        <div
            className={`${styles.node} ${styles[status]}`}
            onClick={!isLocked ? onClick : undefined}
        >
            <div className={styles.nodeContent}>
                <div className={styles.inner}>
                    <div className={styles.icon}>
                        {isCompleted && '✓'}
                        {isActive && '★'}
                        {isLocked && '🔒'}
                    </div>
                </div>
            </div>
            <div className={styles.label}>
                {chapter.title}
            </div>
        </div>
    );
};

export default Node;
