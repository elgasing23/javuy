import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: 'No code provided' });
    }

    // Create a temporary directory for unique execution
    const randomId = Math.random().toString(36).substring(7);
    const tmpDir = path.join(process.cwd(), 'tmp', randomId);

    try {
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Java file must match class name. assuming 'Main' or extracting it.
        // For simplicity, we force the user to write 'public class Main' or we rename it?
        // Let's assume standard 'Main' class for now or use regex to find class name.
        let className = 'Main';
        const match = code.match(/class\s+(\w+)/);
        if (match) {
            className = match[1];
        }

        const filePath = path.join(tmpDir, `${className}.java`);
        fs.writeFileSync(filePath, code);

        // Compile
        await execPromise(`javac "${filePath}"`);

        // Run
        // -cp points to the temp directory
        const { stdout, stderr } = await execPromise(`java -cp "${tmpDir}" ${className}`);

        // Cleanup
        fs.rmSync(tmpDir, { recursive: true, force: true });

        res.status(200).json({ output: stdout, error: stderr });

    } catch (error) {
        // Cleanup on error
        try {
            if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) { console.error('Cleanup failed', e); }

        // Send compiler error
        const errorMessage = error.stderr || error.message;
        res.status(200).json({ output: '', error: errorMessage });
    }
}
