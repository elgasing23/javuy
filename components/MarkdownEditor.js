import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({ value, onChange, placeholder }) {
    const [activeTab, setActiveTab] = useState('write');

    return (
        <div style={wrapperStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        style={activeTab === 'write' ? activeTabStyle : tabStyle}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        style={activeTab === 'preview' ? activeTabStyle : tabStyle}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div style={contentStyle}>
                {activeTab === 'write' ? (
                    <textarea
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder={placeholder || "Type text, markdown supported..."}
                        style={textareaStyle}
                        onFocus={(e) => e.target.style.height = e.target.scrollHeight + 'px'}
                    />
                ) : (
                    <div style={previewStyle} className="markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value || '*Nothing to preview*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {/* Minimal styles for markdown elements in preview */}
            <style jsx global>{`
                .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
                    margin-top: 1.5rem; margin-bottom: 0.5rem; color: #fff;
                }
                .markdown-preview p {
                    margin-bottom: 1rem; line-height: 1.6; color: #ddd;
                }
                .markdown-preview ul, .markdown-preview ol {
                    margin-bottom: 1rem; padding-left: 20px; color: #ddd;
                }
                .markdown-preview code {
                    background: #333; padding: 2px 4px; borderRadius: 4px; font-family: monospace;
                }
                .markdown-preview pre {
                    background: #1e1e1e; padding: 1rem; borderRadius: 8px; overflow-x: auto;
                }
                .markdown-preview pre code {
                    background: transparent; padding: 0;
                }
                .markdown-preview blockquote {
                    border-left: 4px solid #555; padding-left: 1rem; color: #aaa; margin: 1rem 0;
                }
                .markdown-preview a {
                    color: var(--accent-primary, #00d1b2);
                }
                .markdown-preview table {
                    width: 100%; border-collapse: collapse; margin: 1rem 0;
                }
                .markdown-preview th, .markdown-preview td {
                    border: 1px solid #444; padding: 8px; text-align: left;
                }
                .markdown-preview th {
                    background: #333;
                }
            `}</style>
        </div>
    );
}

// Styles
const wrapperStyle = {
    border: '1px solid #444',
    borderRadius: '6px',
    background: '#1e1e1e',
    overflow: 'hidden'
};

const headerStyle = {
    background: '#252526',
    borderBottom: '1px solid #444',
    padding: '0 0.5rem'
};

const tabStyle = {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#aaa',
    padding: '0.8rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    borderBottom: 'none'
};

const activeTabStyle = {
    ...tabStyle,
    background: '#1e1e1e',
    borderLeft: '1px solid #444',
    borderRight: '1px solid #444',
    borderTop: '3px solid var(--accent-primary, #00d1b2)', // Highlight
    color: 'white',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    marginTop: '4px',
    marginBottom: '-1px' // Cover the bottom border
};

const contentStyle = {
    padding: '1rem',
    minHeight: '150px'
};

const textareaStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#ddd',
    fontSize: '1rem',
    fontFamily: 'var(--font-main, sans-serif)',
    outline: 'none',
    resize: 'none',
    minHeight: '120px',
    lineHeight: '1.6',
    overflow: 'hidden'
};

const previewStyle = {
    color: '#ddd',
    fontSize: '1rem',
    lineHeight: '1.6'
};
