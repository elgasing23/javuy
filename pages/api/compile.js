export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Support both single file 'code' (legacy) and multi-file 'files' (new Lab)
    const { code, files } = req.body;

    try {
        let pistonFiles = [];
        if (files && Array.isArray(files)) {
            pistonFiles = files.map(f => ({
                name: f.name,
                content: f.content
            }));
        } else if (code) {
            pistonFiles = [{
                name: 'Main.java',
                content: code
            }];
        } else {
            return res.status(400).json({ message: 'No code or files provided' });
        }

        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'java',
                version: '15.0.2',
                files: pistonFiles
            })
        });

        const data = await response.json();

        if (data.run) {
            const output = data.run.stdout;
            const error = data.run.stderr;
            // Piston returns output and error separately.
            // If there is an error (compilation or runtime), send it.
            res.status(200).json({ output: output, error: error });
        } else {
            // Fallback for API errors
            res.status(200).json({ output: '', error: 'Failed to communicate with compiler service.' });
        }

    } catch (error) {
        console.error('Compiler Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
