import dbConnect from '../../../lib/db';
import Lab from '../../../lib/models/Lab';
import User from '../../../lib/models/User';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

// Helper to check admin
const checkAdmin = async (req) => {
    const { token } = req.cookies;
    console.log('CheckAdmin: Token present?', !!token);
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, 'super-secret-key-change-this-in-prod');
        console.log('CheckAdmin: Decoded', decoded);
        const user = await User.findById(decoded.userId);
        console.log('CheckAdmin: User found?', !!user, 'Role:', user?.role);
        return user && user.role === 'admin';
    } catch (e) {
        console.error('CheckAdmin: Verify Error', e.message);
        return false;
    }
};

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            const labs = await Lab.find({}).sort({ id: 1 });
            res.status(200).json({ labs });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch labs' });
        }
    } else if (req.method === 'POST') {
        const isAdmin = await checkAdmin(req);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        try {
            const lastLab = await Lab.findOne().sort({ id: -1 });
            const nextId = lastLab ? lastLab.id + 1 : 1;

            // Allow manual ID override if needed, but default to auto-increment
            const labData = { ...req.body, id: req.body.id || nextId };

            const lab = await Lab.create(labData);
            res.status(201).json({ lab });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
