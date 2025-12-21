import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

// PrismJS Integration
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

export default function CreateChapter() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        order: '',
        xpReward: 10,
    });
    const [blocks, setBlocks] = useState([{ type: 'text', value: '' }]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Protect Route
        fetch('/api/auth/me')
            .then(res => {
                if (!res.ok) throw new Error('Not auth');
                return res.json();
            })
            .then(data => {
                if (data.user.role !== 'admin') {
                    router.push('/journey'); // Not admin? Go away.
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                router.push('/login');
            });
    }, []);

    if (loading) return null; // Or a loading spinner

    const addBlock = (type) => {
        let newBlock = { type, value: '' };
        if (type === 'quiz') {
            newBlock = {
                type: 'quiz',
                question: '',
                options: ['', '', '', ''],
                answer: 0
            };
        } else if (type === 'code') {
            newBlock.expectedOutput = ''; // Init expected output
        }
        setBlocks([...blocks, newBlock]);
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const updateBlock = (index, field, value) => {
        const newBlocks = [...blocks];
        const updatedBlock = { ...newBlocks[index] }; // Copy the block object

        // Handle direct value update (Textarea calls updateBlock(index, newValue))
        // We detect this by checking if 'value' is undefined, meaning only 2 args were passed
        if (value === undefined) {
            updatedBlock.value = field; // 'field' arg holds the value string
        } else {
            // Handle structured update
            if (field === 'value' || field === 'expectedOutput' || field === 'question') {
                updatedBlock[field] = value;
            } else if (field === 'answer') {
                updatedBlock.answer = parseInt(value);
            } else if (field.startsWith('option-')) {
                const optIndex = parseInt(field.split('-')[1]);
                // Copy options array before mutating
                const newOptions = [...updatedBlock.options];
                newOptions[optIndex] = value;
                updatedBlock.options = newOptions;
            }
        }

        newBlocks[index] = updatedBlock;
        setBlocks(newBlocks);
    };

    const removeBlock = (index) => {
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
    };

    const moveBlock = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + direction];
        newBlocks[index + direction] = temp;
        setBlocks(newBlocks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // No need to map to string anymore, we send the structured blocks!
        // But wait, the API might expect a string if we didn't update Schema?
        // We DID update Schema to Mixed/Array. So we pass `blocks` directly.
        const payload = { ...formData, content: blocks };

        try {
            const res = await fetch('/api/admin/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setTimeout(() => router.push('/journey'), 1500);
            } else {
                setStatus('error');
                alert(data.message);
            }
        } catch (err) {
            setStatus('error');
            console.error(err);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '150px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Top Bar: Order & Actions */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 0', borderBottom: '1px solid #333', marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={labelStyle}>Order #</label>
                                <input
                                    type="number" required placeholder="1"
                                    value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })}
                                    style={minimalInputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label style={labelStyle}>XP Reward</label>
                                <input
                                    type="number" value={formData.xpReward} onChange={e => setFormData({ ...formData, xpReward: e.target.value })}
                                    style={minimalInputStyle}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={status === 'submitting'} style={publishButtonStyle}>
                            {status === 'submitting' ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>

                    {/* Title Section */}
                    <div>
                        <input
                            type="text" required placeholder="Untitled Level"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={titleInputStyle}
                        />
                        <input
                            type="text" placeholder="Add a short description..."
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={descInputStyle}
                        />
                    </div>

                    {/* Dynamic Notebook Blocks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                        {blocks.map((block, index) => (
                            <div key={index} className="notebook-block" style={{ position: 'relative' }}>

                                {/* Block Sidebar Controls (Hover-like but static for clarity) */}
                                <div style={{
                                    position: 'absolute', left: '-40px', top: '0',
                                    display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: 0.4
                                }}>
                                    <button type="button" onClick={() => moveBlock(index, -1)} style={miniBtnStyle}>▲</button>
                                    <button type="button" onClick={() => removeBlock(index)} style={{ ...miniBtnStyle, color: 'var(--accent-danger)' }}>×</button>
                                    <button type="button" onClick={() => moveBlock(index, 1)} style={miniBtnStyle}>▼</button>
                                </div>

                                {block.type === 'text' && (
                                    // Text Block
                                    <textarea
                                        rows="1"
                                        placeholder="Type text, markdown supported..."
                                        value={block.value}
                                        onChange={(e) => {
                                            updateBlock(index, e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        style={textBlockStyle}
                                        onFocus={(e) => e.target.style.height = e.target.scrollHeight + 'px'}
                                    />
                                )}

                                {block.type === 'code' && (
                                    // Code Block
                                    <div style={codeBlockWrapperStyle}>
                                        <div style={codeHeaderStyle}>
                                            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>JAVA CODE CHALLENGE</span>
                                        </div>
                                        <Editor
                                            value={block.value} onValueChange={(code) => updateBlock(index, 'value', code)}
                                            highlight={code => Prism.highlight(code, Prism.languages.java, 'java')}
                                            padding={20} style={codeEditorStyle}
                                        />
                                        <div style={{ padding: '0.5rem 1rem', background: '#252526', borderTop: '1px solid #333' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Expected Output (for auto-grading):</label>
                                            <input
                                                type="text" placeholder="e.g. Hello World"
                                                value={block.expectedOutput || ''}
                                                onChange={(e) => updateBlock(index, 'expectedOutput', e.target.value)}
                                                style={{ width: '100%', background: '#111', border: '1px solid #444', color: '#0f0', fontFamily: 'monospace', padding: '0.4rem' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'quiz' && (
                                    <div style={{ background: '#252526', padding: '1.5rem', borderRadius: '8px', border: '1px solid #444' }}>
                                        <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>✓ Multiple Choice Quiz</h4>
                                        <input
                                            type="text" placeholder="Enter Question Here..."
                                            value={block.question} onChange={(e) => updateBlock(index, 'question', e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', background: '#111', color: 'white', marginBottom: '1rem', fontWeight: 'bold' }}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {block.options.map((opt, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        type="radio" name={`ans-${index}`}
                                                        checked={block.answer === i} onChange={() => updateBlock(index, 'answer', i)}
                                                    />
                                                    <input
                                                        type="text" placeholder={`Option ${i + 1}`}
                                                        value={opt} onChange={(e) => updateBlock(index, `option-${i}`, e.target.value)}
                                                        style={{ background: 'transparent', borderBottom: '1px solid #555', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: '#eee', width: '100%' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    {/* Add Buttons (Toolbar) */}
                    <div style={toolbarStyle}>
                        <button type="button" onClick={() => addBlock('text')} style={toolbarBtnStyle}>
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span> Add Text
                        </button>
                        <button type="button" onClick={() => addBlock('code')} style={toolbarBtnStyle}>
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{`{ }`}</span> Add Code
                        </button>
                        <button type="button" onClick={() => addBlock('quiz')} style={toolbarBtnStyle}>
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>?</span> Add Quiz
                        </button>
                    </div>

                    {status === 'success' && <div style={successBannerStyle}>Level Created Successfully! Redirecting...</div>}
                </form>
            </div>
        </Layout>
    );
}

// Styles
const labelStyle = { fontSize: '0.9rem', color: '#666', fontWeight: '500' };

const minimalInputStyle = {
    background: 'transparent', border: 'none', borderBottom: '1px solid #444',
    color: 'var(--accent-primary)', padding: '0.2rem', width: '60px', textAlign: 'center', fontSize: '1rem'
};

const titleInputStyle = {
    background: 'transparent', border: 'none', color: 'white', fontSize: '3rem',
    fontWeight: '800', outline: 'none', width: '100%', fontFamily: 'var(--font-heading)',
    marginBottom: '0.5rem'
};

const descInputStyle = {
    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
    fontSize: '1.2rem', outline: 'none', width: '100%', fontStyle: 'italic'
};

const textBlockStyle = {
    width: '100%', background: 'transparent', border: 'none',
    color: '#ddd', fontSize: '1.1rem', fontFamily: 'var(--font-main)',
    outline: 'none', resize: 'none', minHeight: '40px', lineHeight: '1.6', overflow: 'hidden'
};

const codeBlockWrapperStyle = {
    borderRadius: '8px', overflow: 'hidden', border: '1px solid #333',
    background: '#1d1f21', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', margin: '0.5rem 0'
};

const codeHeaderStyle = {
    padding: '0.5rem 1rem', background: '#252526', borderBottom: '1px solid #333',
    display: 'flex', justifyContent: 'flex-end'
};

const codeEditorStyle = {
    fontFamily: '"Fira Code", "Fira Mono", "Courier New", monospace', fontSize: '1rem',
    backgroundColor: '#1d1f21', minHeight: '80px', caretColor: '#fff'
};

const miniBtnStyle = {
    background: 'transparent', border: 'none', color: '#444', cursor: 'pointer',
    fontSize: '0.8rem', padding: '2px', transition: 'color 0.2s'
};

const toolbarStyle = {
    display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem',
    padding: '1rem', borderTop: '1px dashed #333'
};

const toolbarBtnStyle = {
    display: 'flex', alignItems: 'center', padding: '0.8rem 1.5rem',
    borderRadius: '8px', border: '1px solid #444', background: '#222',
    color: '#eee', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s'
};

const publishButtonStyle = {
    padding: '0.6rem 2rem', borderRadius: '20px', border: 'none',
    background: 'var(--accent-primary)', color: '#000', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0, 209, 178, 0.3)'
};

const successBannerStyle = {
    padding: '1rem', background: 'rgba(35, 209, 96, 0.1)', border: '1px solid var(--accent-success)',
    color: 'var(--accent-success)', textAlign: 'center', borderRadius: '8px', marginTop: '2rem'
};
