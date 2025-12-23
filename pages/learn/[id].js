import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Lesson.module.css';
import toast from 'react-hot-toast';

// Editor
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                toast.success('Correct Output! Great job.');
            } else if (block.expectedOutput) {
                setStatus('error');
                toast.error('Incorrect Output. Try again.');
            } else {
                toast.success('Code ran successfully');
            }
        } catch (err) {
            setOutput('Error: ' + err.message);
            toast.error('Execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
        // Define Custom Snippets
        monaco.languages.registerCompletionItemProvider('java', {
            provideCompletionItems: (model, position) => {
                var word = model.getWordUntilPosition(position);
                var range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                return {
                    suggestions: [
                        {
                            label: 'sysout',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'System.out.println("${1:msg}");',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Print to console',
                            range: range
                        },
                        {
                            label: 'sout',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'System.out.println("${1:msg}");',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Print to console',
                            range: range
                        },
                        {
                            label: 'psvm',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'public static void main(String[] args) {\n\t$0\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Public Static Void Main',
                            range: range
                        },
                        {
                            label: 'main',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'public static void main(String[] args) {\n\t$0\n}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Public Static Void Main',
                            range: range
                        }
                    ]
                };
            }
        });
    };

    if (block.type === 'text') {
        return (
            <div className={styles.textBlock} style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#ddd' }}>
                <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.value}</ReactMarkdown>
                </div>
                <style jsx global>{`
                    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                        margin-top: 1.5rem; margin-bottom: 0.5rem; color: #fff;
                    }
                    .markdown-content p {
                        margin-bottom: 1rem; line-height: 1.6; color: #ddd;
                    }
                    .markdown-content ul, .markdown-content ol {
                        margin-bottom: 1rem; padding-left: 20px; color: #ddd;
                    }
                    .markdown-content li {
                        margin-bottom: 0.5rem;
                    }
                    .markdown-content code {
                        background: #333; padding: 2px 4px; border-radius: 4px; font-family: monospace;
                    }
                    .markdown-content pre {
                        background: #1e1e1e; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1rem;
                    }
                    .markdown-content pre code {
                        background: transparent; padding: 0;
                    }
                    .markdown-content blockquote {
                        border-left: 4px solid #555; padding-left: 1rem; color: #aaa; margin: 1rem 0;
                    }
                    .markdown-content a {
                        color: var(--accent-primary, #00d1b2);
                    }
                    .markdown-content table {
                        width: 100%; border-collapse: collapse; margin: 1rem 0;
                    }
                    .markdown-content th, .markdown-content td {
                        border: 1px solid #444; padding: 8px; text-align: left;
                    }
                    .markdown-content th {
                        background: #333;
                    }
                 `}</style>
            </div>
        );
    }


    if (block.type === 'code') {
        return (
            <div className={styles.codeBlock} style={{ marginBottom: '2rem', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#1e1e1e' }}>
                <div style={{ padding: '0.5rem 1rem', background: '#252526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>JAVA CHALLENGE</span>
                    {block.expectedOutput && <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Goal: Output "{block.expectedOutput}"</span>}
                </div>
                <div style={{ height: '400px' }}>
                    <Editor
                        height="400px"
                        defaultLanguage="java"
                        defaultValue={block.value}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value)}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                        }}
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
                    onClick={() => {
                        const isCorrect = selectedOption === block.answer;
                        setQuizResult(isCorrect ? 'correct' : 'incorrect');
                        if (isCorrect) toast.success('Correct Answer!');
                        else toast.error('Wrong answer, try again.');
                    }}
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
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch('/api/journey')
            .then(res => res.json())
            .then(data => {
                const found = data.journey.find(c => c._id === id);
                setChapter(found);

                // Check if admin
                if (data.user && data.user.role === 'admin') {
                    setIsAdmin(true);
                }

                setLoading(false);
            });
    }, [id]);

    const handleComplete = () => {
        toast.promise(
            fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterId: id })
            }).then(res => res.json()),
            {
                loading: 'Claiming XP...',
                success: () => {
                    router.push('/journey');
                    return `Level Completed! +${chapter?.xpReward || 0} XP`;
                },
                error: 'Could not complete level.',
            }
        );
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
                <div className={styles.header} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1rem' }}>← Back</button>
                        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>{chapter.title}</h1>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => router.push(`/admin/edit/${id}`)}
                            style={{
                                background: 'var(--bg-secondary)', border: '1px solid #444',
                                color: 'var(--accent-primary)', padding: '0.5rem 1rem',
                                borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            ✎ Edit Level
                        </button>
                    )}
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
