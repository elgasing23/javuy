import dbConnect from '../../../lib/db';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = 'super-secret-key-change-this-in-prod'; // Simple secret for MVP

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    try {
        await dbConnect();
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set Cookie
        res.setHeader('Set-Cookie', serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        }));

        res.status(200).json({ message: 'Login successful', user: { username: user.username, role: user.role, xp: user.xp } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
