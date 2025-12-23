import dbConnect from '../../../lib/db';
import User from '../../../lib/models/User';
import Chapter from '../../../lib/models/Chapter';
import Progress from '../../../lib/models/Progress';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = 'super-secret-key-change-this-in-prod';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        await dbConnect();

        // Parallelize independent operations:
        // 1. Check if user exists
        // 2. Hash Password
        // 3. Find First Chapter (for progress)
        const [existingUser, hashedPassword, firstChapter] = await Promise.all([
            User.findOne({ username }),
            bcrypt.hash(password, 10),
            Chapter.findOne({ order: 1 })
        ]);

        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // 4. Create User
        const user = await User.create({
            username,
            password: hashedPassword,
            role: 'user', // Default role
            xp: 0,
            streak: 1,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        // 5. Initialize Progress (Unlock Chapter 1)
        if (firstChapter) {
            await Progress.create({
                user: user._id,
                chapter: firstChapter._id,
                status: 'active'
            });
        }

        // 5. Generate Token (Auto Login)
        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Set Cookie
        res.setHeader('Set-Cookie', serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        }));

        res.status(201).json({ message: 'User created successfully', user: { username: user.username, role: user.role } });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
