import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true,
    },
    status: {
        type: String,
        enum: ['locked', 'active', 'completed'],
        default: 'locked',
    },
    completedAt: {
        type: Date,
    },
}, { timestamps: true });

// Ensure unique compound index so a user can't have duplicate progress entries for same chapter
ProgressSchema.index({ user: 1, chapter: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
