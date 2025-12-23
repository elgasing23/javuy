import Node from './Node';
import styles from './JourneyMap.module.css';

const JourneyMap = ({ chapters, onChapterClick, onEditClick, role }) => {
    const WIDTH = 600;
    const CENTER_X = WIDTH / 2;
    const ITEM_HEIGHT = 160;
    const X_OFFSET = 120; // Distance from center
    const TOP_PADDING = 80;

    const getPos = (index) => {
        const y = TOP_PADDING + index * ITEM_HEIGHT;
        // Cycle: Center -> Right -> Center -> Left
        const cycle = index % 4;
        let xOffset = 0;

        if (cycle === 1) xOffset = X_OFFSET;
        if (cycle === 3) xOffset = -X_OFFSET;

        return { x: CENTER_X + xOffset, y };
    };

    const points = chapters.map((_, i) => getPos(i));
    const totalHeight = points.length > 0 ? points[points.length - 1].y + 200 : 800;

    // Create path string
    let pathD = '';
    points.forEach((p, i) => {
        if (i === 0) {
            pathD += `M ${p.x} ${p.y}`;
        } else {
            const prev = points[i - 1];
            const cY1 = prev.y + ITEM_HEIGHT * 0.5;
            const cY2 = p.y - ITEM_HEIGHT * 0.5;
            pathD += ` C ${prev.x} ${cY1}, ${p.x} ${cY2}, ${p.x} ${p.y}`;
        }
    });

    const isAdmin = role === 'admin';

    return (
        <div className={styles.mapContainer}>
            <div className={styles.contentWrapper} style={{ width: WIDTH, height: totalHeight }}>
                <svg className={styles.svgLayer} width={WIDTH} height={totalHeight} viewBox={`0 0 ${WIDTH} ${totalHeight}`}>
                    {/* Simple Connector Line */}
                    <path d={pathD} className={styles.connectorPath} />
                </svg>

                <div className={styles.nodesLayer}>
                    {chapters.map((chapter, index) => {
                        const pos = getPos(index);
                        // UX: If admin, show locked nodes as 'active' (clickable), or pass a flag
                        // But to keep it simple, let's just pretend they are active for the visual component?
                        // Actually, I can pass status logic here.
                        let visualStatus = chapter.status;
                        if (isAdmin && chapter.status === 'locked') {
                            visualStatus = 'active'; // Visually unlock for admin
                        }

                        return (
                            <div
                                key={chapter._id}
                                className={styles.nodeWrapper}
                                style={{
                                    top: pos.y,
                                    left: pos.x
                                }}
                            >
                                <Node
                                    chapter={chapter}
                                    status={visualStatus}
                                    onClick={() => onChapterClick(chapter._id)}
                                    // New Props for Direct Editing
                                    isAdmin={isAdmin}
                                    onEdit={() => onEditClick(chapter._id)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default JourneyMap;
