import dbConnect from '../../../lib/db';
import Lab from '../../../lib/models/Lab';
import User from '../../../lib/models/User';
import jwt from 'jsonwebtoken';

const checkAdmin = async (req) => {
    const { token } = req.cookies;
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
        const user = await User.findById(decoded.userId);
        return user && user.role === 'admin';
    } catch (e) {
        return false;
    }
};

export default async function handler(req, res) {
    const { id } = req.query;
    await dbConnect();

    // ID is our custom numeric ID, not _id
    const filter = { id: parseInt(id) };

    if (req.method === 'GET') {
        try {
            const lab = await Lab.findOne(filter);
            if (!lab) return res.status(404).json({ message: 'Lab not found' });
            res.status(200).json({ lab });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    } else if (req.method === 'PUT') {
        const isAdmin = await checkAdmin(req);
        if (!isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        try {
            const lab = await Lab.findOneAndUpdate(filter, req.body, {
                new: true,
                runValidators: true,
            });
            if (!lab) return res.status(404).json({ message: 'Lab not found' });
            res.status(200).json({ lab });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    } else if (req.method === 'DELETE') {
        const isAdmin = await checkAdmin(req);
        if (!isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        try {
            const deletedLab = await Lab.findOneAndDelete(filter);
            if (!deletedLab) return res.status(404).json({ message: 'Lab not found' });
            res.status(200).json({ message: 'Lab deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
