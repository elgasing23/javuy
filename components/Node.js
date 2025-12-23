import styles from './Node.module.css';

const Node = ({ chapter, status, onClick, onEdit, isAdmin }) => {
    const isLocked = status === 'locked';
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
        <div className={styles.nodeWrapper} style={{ position: 'relative' }}>
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
            </div>

            {/* Direct Edit Button for Admins */}
            {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the lesson
                        onEdit();
                    }}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'black',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Edit Node"
                >
                    ✎
                </button>
            )}

            <div className={styles.label}>
                {chapter.title}
            </div>
        </div>
    );
};

export default Node;
