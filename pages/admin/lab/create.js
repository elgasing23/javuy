
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import toast from 'react-hot-toast';

export default function AdminLabCreate() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !pdfFile) {
            toast.error('Please provide title and PDF');
            return;
        }

        setUploading(true);
        try {
            // 1. Convert PDF to Data URI
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            const pdfDataUri = await toBase64(pdfFile);

            // 2. Create Lab with PDF Data URI directly
            // No need to upload to 'public' folder since we can't write there in serverless.
            // We store the base64 string in the DB.
            const labRes = await fetch('/api/lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    pdfUrl: pdfDataUri,
                    description: '# ' + title + '\nSee attached PDF for instructions.',
                    files: [{ name: 'Main.java', content: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' }]
                })
            });
            const labData = await labRes.json();

            if (labData.lab) {
                toast.success('Lab Created Successfully');
                router.push(`/admin/lab/${labData.lab.id}`);
            } else {
                toast.error('Failed to create lab record');
            }

        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error occurred');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '600px', margin: '2rem auto', background: '#1e1e1e', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
                <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Create New Lab</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Lab Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Lab 4: Arrays"
                            style={{ width: '100%', padding: '0.8rem', background: '#252526', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Instructions (PDF)</label>
                        <div style={{ border: '2px dashed #444', padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: pdfFile ? '#252526' : 'transparent' }}>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                                style={{ display: 'none' }}
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'block', color: '#888' }}>
                                {pdfFile ? `Selected: ${pdfFile.name}` : 'Click to Upload PDF'}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        style={{
                            background: 'var(--accent-primary)', color: 'black', border: 'none',
                            padding: '1rem', borderRadius: '4px', fontWeight: 'bold',
                            cursor: 'pointer', marginTop: '1rem', opacity: uploading ? 0.7 : 1
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Create Lab'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </Layout>
    );
}
