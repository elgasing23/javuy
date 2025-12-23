
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const uploadDir = path.join(process.cwd(), 'public/uploads/labs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filename: (name, ext, part, form) => {
                const timestamp = Date.now();
                return `lab_${timestamp}${ext}`; // Unique filename
            }
        });

        const [fields, files] = await form.parse(req);

        // files.file might be an array or object depending on formidable version.
        // In v3 it returns an array for the key.
        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!uploadedFile) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the relative path for the frontend
        const publicPath = `/uploads/labs/${uploadedFile.newFilename}`;
        res.status(200).json({ url: publicPath });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
}
