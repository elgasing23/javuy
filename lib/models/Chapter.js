import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    order: {
        type: Number,
        required: true,
        unique: true,
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Allows Array of Blocks (Text, Code, Quiz)
        required: true,
    },
    xpReward: {
        type: Number,
        default: 10,
    },
}, { timestamps: true });

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
