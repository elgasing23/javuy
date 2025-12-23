import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Lesson.module.css';
import toast from 'react-hot-toast';

// Editor
import Editor from '@monaco-editor/react';

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
        return <p className={styles.textBlock} style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#ddd' }}>{block.value}</p>;
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
                    : [{type: 'text', value: chapter.content }]; // Fallback

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
