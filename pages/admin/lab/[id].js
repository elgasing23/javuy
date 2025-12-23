
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import MarkdownEditor from '../../../components/MarkdownEditor'; // Reusing this if available

export default function AdminLabEdit() {
    const router = useRouter();
    const { id } = router.query;

    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFileIndex, setActiveFileIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/lab/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.lab) {
                    setLab(data.lab);
                } else {
                    toast.error('Lab not found');
                }
                setLoading(false);
            })
            .catch(err => {
                toast.error('Failed to load lab');
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/lab/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lab)
            });
            if (res.ok) {
                toast.success('Lab Saved');
            } else {
                toast.error('Failed to save');
            }
        } catch (e) {
            toast.error('Error saving lab');
        }
    };

    const addFile = () => {
        const name = prompt("File Name (e.g. Test.java):");
        if (!name) return;
        if (lab.files.some(f => f.name === name)) {
            toast.error('File exists');
            return;
        }
        setLab({
            ...lab,
            files: [...lab.files, { name, content: '', readOnly: false }]
        });
        setActiveFileIndex(lab.files.length); // Index of new file
    };

    const removeFile = (idx) => {
        if (confirm('Delete file?')) {
            const newFiles = lab.files.filter((_, i) => i !== idx);
            setLab({ ...lab, files: newFiles });
            setActiveFileIndex(0);
        }
    };

    if (loading) return <Layout><div style={{ padding: '2rem', color: '#fff' }}>Loading...</div></Layout>;
    if (!lab) return <Layout><div style={{ padding: '2rem', color: '#fff' }}>Lab not found</div></Layout>;

    const activeFile = lab.files[activeFileIndex];

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff' }}>Edit Lab {lab.id}</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => router.push('/admin/lab')} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSave} style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', padding: '0.6rem 2rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Title</label>
                    <input
                        value={lab.title}
                        onChange={(e) => setLab({ ...lab, title: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', background: '#1e1e1e', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '1.2rem' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '600px' }}>
                    {/* Left: Description Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Instructions (Markdown)</label>
                        <div style={{ flex: 1, border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                            <MarkdownEditor
                                value={lab.description}
                                onChange={(val) => setLab({ ...lab, description: val })}
                            />
                        </div>
                    </div>

                    {/* Right: Code Files Editor */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: '#aaa' }}>Starter Files</label>
                            <button onClick={addFile} style={{ background: '#333', color: '#fff', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>+ Add File</button>
                        </div>

                        <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', background: '#252526', borderBottom: '1px solid #333', overflowX: 'auto' }}>
                                {lab.files.map((file, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveFileIndex(idx)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            cursor: 'pointer',
                                            background: activeFileIndex === idx ? '#1e1e1e' : 'transparent',
                                            color: activeFileIndex === idx ? '#fff' : '#888',
                                            borderRight: '1px solid #333',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        {file.name}
                                        <span onClick={(e) => { e.stopPropagation(); removeFile(idx); }} style={{ fontSize: '0.8rem', cursor: 'pointer', opacity: 0.5 }}>×</span>
                                    </div>
                                ))}
                            </div>

                            {/* Editor */}
                            <div style={{ flex: 1 }}>
                                {activeFile ? (
                                    <Editor
                                        height="100%"
                                        defaultLanguage="java"
                                        value={activeFile.content}
                                        theme="vs-dark"
                                        onChange={(val) => {
                                            const newFiles = [...lab.files];
                                            newFiles[activeFileIndex].content = val;
                                            setLab({ ...lab, files: newFiles });
                                        }}
                                        options={{ minimap: { enabled: false } }}
                                    />
                                ) : (
                                    <div style={{ padding: '2rem', color: '#666', textAlign: 'center' }}>No files</div>
                                )}
                            </div>

                            {/* File Options */}
                            {activeFile && (
                                <div style={{ padding: '0.5rem', borderTop: '1px solid #333', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label style={{ color: '#aaa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={activeFile.readOnly}
                                            onChange={(e) => {
                                                const newFiles = [...lab.files];
                                                newFiles[activeFileIndex].readOnly = e.target.checked;
                                                setLab({ ...lab, files: newFiles });
                                            }}
                                        />
                                        Read Only (User cannot edit)
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
