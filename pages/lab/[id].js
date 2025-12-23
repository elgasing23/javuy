
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function LabPlayground() {
    const router = useRouter();
    const { id } = router.query;

    const [lab, setLab] = useState(null);
    const [files, setFiles] = useState([]);
    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/lab/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.lab) {
                    setLab(data.lab);
                    setFiles(data.lab.files);
                } else {
                    toast.error('Lab not found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load lab');
                setLoading(false);
            });
    }, [id]);

    const handleCodeChange = (value) => {
        const newFiles = [...files];
        newFiles[activeFileIndex].content = value;
        setFiles(newFiles);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Compiling...');

        try {
            const res = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
            const data = await res.json();
            const realOutput = (data.output || data.error || '').trim();
            setOutput(realOutput);

            if (!data.error) {
                toast.success('Code executed successfully');
            } else {
                toast.error('Compilation Error');
            }
        } catch (err) {
            setOutput('Error: ' + err.message);
            toast.error('Execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorDidMount = (editor, monaco) => {
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
                        { label: 'sysout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println("${1:msg}");', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print to console', range: range },
                        { label: 'sout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println("${1:msg}");', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print to console', range: range },
                        { label: 'psvm', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Public Static Void Main', range: range },
                        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t$0\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Public Static Void Main', range: range }
                    ]
                };
            }
        });
    };

    const addNewFile = () => {
        const name = prompt("Enter file name (e.g. Helper.java):");
        if (name) {
            if (!name.endsWith('.java')) {
                toast.error('File must end with .java');
                return;
            }
            if (files.some(f => f.name === name)) {
                toast.error('File already exists');
                return;
            }
            const newFiles = [...files, { name, content: `public class ${name.replace('.java', '')} {\n\n}`, readOnly: false }];
            setFiles(newFiles);
            setActiveFileIndex(newFiles.length - 1);
        }
    };

    const deleteFile = (index) => {
        if (files[index].readOnly) {
            toast.error('Cannot delete read-only file');
            return;
        }
        if (files.length <= 1) {
            toast.error('Cannot delete the only file');
            return;
        }
        if (confirm(`Delete ${files[index].name}?`)) {
            const newFiles = files.filter((_, i) => i !== index);
            setFiles(newFiles);
            if (activeFileIndex >= newFiles.length) {
                setActiveFileIndex(newFiles.length - 1);
            }
        }
    };

    if (loading) return <Layout><div style={{ padding: '2rem', color: '#fff' }}>Loading Lab...</div></Layout>;
    if (!lab) return <Layout><div style={{ padding: '2rem', color: '#fff' }}>Lab not found</div></Layout>;

    return (
        <Layout>
            <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#1e1e1e' }}>
                {/* Sidebar File Explorer */}
                <div style={{ width: '250px', background: '#252526', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Explorer
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveFileIndex(idx)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    color: activeFileIndex === idx ? '#fff' : '#ccc',
                                    background: activeFileIndex === idx ? '#37373d' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    borderLeft: activeFileIndex === idx ? '3px solid var(--accent-primary)' : '3px solid transparent'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>☕</span>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                {!file.readOnly && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteFile(idx); }}
                                        style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}
                                        title="Delete File"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={addNewFile}
                        style={{ padding: '0.8rem', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderTop: '1px solid #444' }}
                    >
                        + New File
                    </button>
                </div>

                {/* Main Editor Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs / Header */}
                    <div style={{ height: '40px', background: '#1e1e1e', display: 'flex', alignItems: 'center', borderBottom: '1px solid #333' }}>
                        {files.map((file, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveFileIndex(idx)}
                                style={{
                                    padding: '0 1.5rem',
                                    height: '100%',
                                    display: 'flex', alignItems: 'center',
                                    color: activeFileIndex === idx ? '#fff' : '#888',
                                    background: activeFileIndex === idx ? '#1e1e1e' : '#2d2d2d',
                                    borderRight: '1px solid #333',
                                    borderTop: activeFileIndex === idx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {file.name} {file.readOnly && '🔒'}
                            </div>
                        ))}
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="java"
                            path={files[activeFileIndex].name} // Helps Monaco with intellisense context maybe?
                            value={files[activeFileIndex].content}
                            theme="vs-dark"
                            onChange={handleCodeChange}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                readOnly: files[activeFileIndex].readOnly
                            }}
                        />
                        {/* Run Button Overlay */}
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            style={{
                                position: 'absolute', top: '1rem', right: '2rem',
                                background: 'var(--accent-primary)', color: '#000',
                                border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px',
                                fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                opacity: isRunning ? 0.7 : 1, zIndex: 10
                            }}
                        >
                            {isRunning ? 'Running...' : '▶ Run Project'}
                        </button>
                    </div>

                    {/* Instructions & Output Split */}
                    <div style={{ height: '300px', display: 'flex', borderTop: '1px solid #333' }}>
                        {/* Lab Instructions */}
                        <div style={{ width: '40%', padding: '1rem', overflowY: 'auto', borderRight: '1px solid #333', background: '#252526', color: '#ccc' }}>
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{lab.title}</h3>
                            <div className="markdown-content" style={{ fontSize: '0.95rem' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lab.description}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Terminal Output */}
                        <div style={{ flex: 1, background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '0.5rem 1rem', background: '#222', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                <span>TERMINAL</span>
                                <span
                                    onClick={() => setOutput('')}
                                    style={{ cursor: 'pointer', color: '#666' }}
                                    title="Clear Output"
                                >
                                    oslash;
                                </span>
                            </div>
                            <div style={{ padding: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#ddd', flex: 1, overflowY: 'auto', fontSize: '0.9rem' }}>
                                {output || <span style={{ color: '#444' }}>Build success... Ready to run.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                        margin-top: 1rem; margin-bottom: 0.5rem; color: #fff;
                    }
                    .markdown-content p {
                        margin-bottom: 0.8rem; line-height: 1.5; color: #ccc;
                    }
                    .markdown-content ul, .markdown-content ol {
                        margin-bottom: 0.8rem; padding-left: 20px;
                    }
                    .markdown-content code {
                        background: #333; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;
                    }
                    .markdown-content pre {
                        background: #111; padding: 0.8rem; border-radius: 6px; overflow-x: auto; margin-bottom: 0.8rem;
                    }
                    .markdown-content a { color: var(--accent-primary); }
             `}</style>
        </Layout>
    );
}
