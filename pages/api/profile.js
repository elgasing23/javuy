import dbConnect from '../../lib/db';
import User from '../../lib/models/User';

export default async function handler(req, res) {
    await dbConnect();

    try {
        const user = await User.findOne({});
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
