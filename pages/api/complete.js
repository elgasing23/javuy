import dbConnect from '../../lib/db';
import Progress from '../../lib/models/Progress';
import User from '../../lib/models/User';
import Chapter from '../../lib/models/Chapter';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { chapterId } = req.body;

    try {
        await dbConnect();
        const user = await User.findOne({});
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Mark current chapter as completed
        let progress = await Progress.findOne({ user: user._id, chapter: chapterId });
        if (!progress) {
            // Create if doesn't exist (edge case)
            progress = new Progress({ user: user._id, chapter: chapterId, status: 'active' });
        }

        if (progress.status === 'completed') {
            return res.status(200).json({ message: 'Already completed' });
        }

        progress.status = 'completed';
        progress.completedAt = new Date();
        await progress.save();

        // Award XP
        const chapter = await Chapter.findById(chapterId);
        if (chapter) {
            user.xp += chapter.xpReward;
            await user.save();
        }

        // Unlock next chapter
        if (chapter) {
            const nextChapter = await Chapter.findOne({ order: chapter.order + 1 });
            if (nextChapter) {
                // Upsert progress to 'active' (unlocks it if it was locked or didn't exist)
                await Progress.findOneAndUpdate(
                    { user: user._id, chapter: nextChapter._id },
                    {
                        $setOnInsert: { user: user._id, chapter: nextChapter._id },
                        $set: { status: 'active' } // Always set to active
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.status(200).json({ message: 'Chapter completed', xp: user.xp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
