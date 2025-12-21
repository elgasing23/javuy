import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    xp: {
        type: Number,
        default: 0,
    },
    streak: {
        type: Number,
        default: 0,
    },
    avatar: {
        type: String,
        default: '/default-avatar.png',
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
