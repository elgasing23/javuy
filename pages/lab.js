import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

export default function Lab() {
    const [code, setCode] = useState('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello From Java Lab!");\n    }\n}');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isDark, setIsDark] = useState(true);

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Compiling...');

        try {
            const res = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
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
        // Snippets (Reuse from Lesson)
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

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Java Lab 🧪</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Experiment with Java code freely.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            style={{
                                background: 'transparent', border: '1px solid #444',
                                color: '#aaa', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
                            }}
                        >
                            {isDark ? '🌙 Dark' : '☀️ Light'}
                        </button>
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            style={{
                                background: 'var(--accent-primary)', border: 'none',
                                padding: '0.6rem 2rem', borderRadius: '6px',
                                fontWeight: 'bold', cursor: 'pointer',
                                opacity: isRunning ? 0.7 : 1
                            }}
                        >
                            {isRunning ? 'Running...' : '▶ Run Code'}
                        </button>
                    </div>
                </header>

                <div style={{ display: 'flex', flex: 1, gap: '1rem', height: '100%', overflow: 'hidden' }}>
                    {/* Editor Panel */}
                    <div style={{ flex: 2, borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="java"
                            value={code}
                            theme={isDark ? "vs-dark" : "light"}
                            onChange={(value) => setCode(value)}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div style={{
                        flex: 1,
                        background: '#1e1e1e',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{
                            padding: '0.5rem 1rem', background: '#252526',
                            borderBottom: '1px solid #333', fontWeight: 'bold', color: '#aaa'
                        }}>
                            Output Terminal
                        </div>
                        <div style={{
                            padding: '1rem', fontFamily: 'monospace',
                            color: '#eee', whiteSpace: 'pre-wrap',
                            flex: 1, overflowY: 'auto'
                        }}>
                            {output || <span style={{ color: '#555' }}>// Ready to execute...</span>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
