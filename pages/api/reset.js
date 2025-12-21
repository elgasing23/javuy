import dbConnect from '../../lib/db';
import Progress from '../../lib/models/Progress';
import User from '../../lib/models/User';
import Chapter from '../../lib/models/Chapter';

export default async function handler(req, res) {
    try {
        await dbConnect();

        // 1. Reset User Stats
        const user = await User.findOne({});
        if (user) {
            user.xp = 0;
            user.streak = 0;
            await user.save();
        }

        // 2. Clear All Progress
        await Progress.deleteMany({});

        // 3. Unlock First Chapter
        const firstChapter = await Chapter.findOne({ order: 1 });
        if (firstChapter && user) {
            await Progress.create({
                user: user._id,
                chapter: firstChapter._id,
                status: 'active'
            });
        }

        res.status(200).json({ message: 'Progress reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
