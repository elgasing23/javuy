import dbConnect from '../../../lib/db';
import Chapter from '../../../lib/models/Chapter';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();

        const { title, description, order, content, xpReward } = req.body;

        if (!title || !order || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if order exists
        const existing = await Chapter.findOne({ order });
        if (existing) {
            return res.status(400).json({ message: 'Chapter with this order number already exists.' });
        }

        const chapter = await Chapter.create({
            title,
            description,
            order,
            content,
            xpReward: xpReward || 10
        });

        res.status(201).json({ success: true, chapter });
    } catch (error) {
        console.error('Create Chapter Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
