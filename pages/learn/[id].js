import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Lesson.module.css';

// Editor & Prism
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';

const LessonBlock = ({ block }) => {
    // Code Block State
    const [code, setCode] = useState(block.value || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error

    // Quiz Block State
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizResult, setQuizResult] = useState(null); // 'correct', 'incorrect'

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Compiling...');
        setStatus('idle');

        try {
            const res = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            const realOutput = (data.output || data.error || '').trim();
            setOutput(realOutput);

            if (block.expectedOutput && realOutput === block.expectedOutput.trim()) {
                setStatus('success');
            } else if (block.expectedOutput) {
                setStatus('error');
            }
        } catch (err) {
            setOutput('Error: ' + err.message);
        } finally {
            setIsRunning(false);
        }
    };

    if (block.type === 'text') {
        return <p className={styles.textBlock} style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#ddd' }}>{block.value}</p>;
    }

    if (block.type === 'code') {
        return (
            <div className={styles.codeBlock} style={{ marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#1d1f21' }}>
                <div style={{ padding: '0.5rem 1rem', background: '#252526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>JAVA CHALLENGE</span>
                    {block.expectedOutput && <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Goal: Output "{block.expectedOutput}"</span>}
                </div>
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <Editor
                        value={code} onValueChange={setCode}
                        highlight={code => Prism.highlight(code, Prism.languages.java, 'java')}
                        padding={20}
                        style={{ fontFamily: 'monospace', fontSize: '1rem', backgroundColor: '#1d1f21', minHeight: '100px' }}
                    />
                </div>
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222' }}>
                    <button onClick={runCode} disabled={isRunning} style={{ background: 'var(--accent-primary)', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isRunning ? 'Running...' : '▶ Run Code'}
                    </button>
                    {status === 'success' && <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>✅ Correct Output!</span>}
                    {status === 'error' && <span style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>❌ Incorrect Output</span>}
                </div>
                {output && (
                    <div style={{ padding: '1rem', background: '#111', borderTop: '1px solid #333', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: status === 'error' ? '#ff6b6b' : '#ddd' }}>
                        {output}
                    </div>
                )}
            </div>
        );
    }

    if (block.type === 'quiz') {
        return (
            <div className={styles.quizBlock} style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', background: '#252526' }}>
                <h3 style={{ marginBottom: '1rem', color: '#fff' }}>{block.question}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {block.options.map((opt, i) => (
                        <label key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem',
                            background: selectedOption === i ? 'rgba(0, 209, 178, 0.1)' : '#1d1f21',
                            border: `1px solid ${selectedOption === i ? 'var(--accent-primary)' : '#444'}`,
                            borderRadius: '6px', cursor: 'pointer'
                        }}>
                            <input type="radio" name={`quiz-${block.question}`} checked={selectedOption === i} onChange={() => { setSelectedOption(i); setQuizResult(null); }} />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={() => setQuizResult(selectedOption === block.answer ? 'correct' : 'incorrect')}
                    style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Check Answer
                </button>
                {quizResult === 'correct' && <p style={{ color: 'var(--accent-success)', marginTop: '0.5rem', fontWeight: 'bold' }}>Correct! Good job.</p>}
                {quizResult === 'incorrect' && <p style={{ color: 'var(--accent-danger)', marginTop: '0.5rem', fontWeight: 'bold' }}>Try again.</p>}
            </div>
        );
    }
    return null;
};

const Lesson = () => {
    const router = useRouter();
    const { id } = router.query;
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch('/api/journey')
            .then(res => res.json())
            .then(data => {
                const found = data.journey.find(c => c._id === id);
                setChapter(found);
                setLoading(false);
            });
    }, [id]);

    const handleComplete = () => {
        fetch('/api/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapterId: id })
        })
            .then(res => res.json())
            .then(() => router.push('/journey'));
    };

    if (loading) return <Layout><div style={{ color: 'white', padding: '2rem' }}>Loading Lesson...</div></Layout>;
    if (!chapter) return <Layout><div style={{ color: 'white', padding: '2rem' }}>Chapter not found</div></Layout>;

    // Handle legacy content (string) vs new content (array)
    const contentBlocks = Array.isArray(chapter.content)
        ? chapter.content
        : [{ type: 'text', value: chapter.content }]; // Fallback

    return (
        <Layout>
            <div className={styles.lessonContainer} style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
                <div className={styles.header} style={{ marginBottom: '2rem' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1rem' }}>← Back</button>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>{chapter.title}</h1>
                </div>

                <div className={styles.content}>
                    {contentBlocks.map((block, i) => <LessonBlock key={i} block={block} />)}
                </div>

                <button onClick={handleComplete} style={{
                    marginTop: '2rem', width: '100%', padding: '1rem', background: 'var(--accent-success)',
                    border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    Complete & Claim {chapter.xpReward} XP
                </button>
            </div>
        </Layout>
    );
};

export default Lesson;
