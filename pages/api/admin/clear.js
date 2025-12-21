import dbConnect from '../../../lib/db';
import Chapter from '../../../lib/models/Chapter';
import Progress from '../../../lib/models/Progress';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();

        // Delete all Chapters
        await Chapter.deleteMany({});

        // Delete all Progress (since chapters are gone)
        await Progress.deleteMany({});

        res.status(200).json({ message: 'All content cleared. You can now build from scratch.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
