import { serialize } from 'cookie';

export default function handler(req, res) {
    res.setHeader('Set-Cookie', serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/',
    }));

    res.status(200).json({ message: 'Logged out' });
}
