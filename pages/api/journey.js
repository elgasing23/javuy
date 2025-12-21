import dbConnect from '../../lib/db';
import Chapter from '../../lib/models/Chapter';
import Progress from '../../lib/models/Progress';
import User from '../../lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super-secret-key-change-this-in-prod';

export default async function handler(req, res) {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(token, JWT_SECRET);

        await dbConnect();
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const chapters = await Chapter.find({}).sort({ order: 1 }).lean();
        const progressDocs = await Progress.find({ user: user._id }).lean();

        // Map progress to chapters
        const journey = chapters.map(chapter => {
            const progress = progressDocs.find(p => p.chapter.toString() === chapter._id.toString());
            return {
                ...chapter,
                status: progress ? progress.status : 'locked', // Default to locked if no progress found
            };
        });

        // Logic fix: Ensure the first chapter is at least active if everything is locked?
        // The seed handles this, but good to have fallback.
        // If we rely on seed, it's fine.

        res.status(200).json({
            user: { username: user.username, xp: user.xp, streak: user.streak, avatar: user.avatar },
            journey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
