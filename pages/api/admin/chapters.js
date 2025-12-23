import dbConnect from '../../../lib/db';
import Chapter from '../../../lib/models/Chapter';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { id, title, description, order, content, xpReward } = req.body;

        if (!id) return res.status(400).json({ message: 'Chapter ID required' });

        try {
            await dbConnect();
            const chapter = await Chapter.findByIdAndUpdate(id, {
                title, description, order, content, xpReward
            }, { new: true });

            return res.status(200).json({ success: true, chapter });
        } catch (error) {
            console.error('Update Chapter Error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();

        const { title, description, order, content, xpReward } = req.body;

        if (!title || !order || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if order exists (only for new chapters)
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
