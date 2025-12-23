import mongoose from 'mongoose';

const LabSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String, // Markdown
        required: true
    },
    pdfUrl: {
        type: String,
        required: false
    },
    files: [{
        name: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Lab || mongoose.model('Lab', LabSchema);
