import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/db';
import User from '../../../lib/models/User';

const JWT_SECRET = 'super-secret-key-change-this-in-prod';

export default async function handler(req, res) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await dbConnect();
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
