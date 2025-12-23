
const mongoose = require('mongoose');

// Adjust path as needed for local run
// Lab.js is likely ESM, so require might return { default: Model } if transpiled, or fail if native.
// Since we are in a simple script, let's just define the schema inline to avoid module headaches for this one-off seed.
// const mongoose = require('mongoose'); // Already required above

const LabSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    files: [{
        name: { type: String, required: true },
        content: { type: String, required: true },
        readOnly: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Lab = mongoose.models.Lab || mongoose.model('Lab', LabSchema);


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/java-learning-app';

const labs = [
    { id: 1, title: 'Lab 1: Hello World', description: 'Create your first Java program.', files: [{ name: 'Main.java', content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}' }] },
    { id: 2, title: 'Lab 2: Variables', description: 'Learn about variables.', files: [{ name: 'Main.java', content: 'public class Main {\n    public static void main(String[] args) {\n        int x = 10;\n        System.out.println(x);\n    }\n}' }] },
    { id: 3, title: 'Lab 3: Control Flow', description: 'If statements and loops.', files: [{ name: 'Main.java', content: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}' }] },
    // Only seeding 3 for brevity, but could do 8
];

async function seed() {
    if (!MONGODB_URI) {
        console.error("Please define the MONGODB_URI environment variable");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding Labs");

        for (const lab of labs) {
            await Lab.findOneAndUpdate({ id: lab.id }, lab, { upsert: true, new: true });
            console.log(`Seeded Lab ${lab.id}`);
        }

        console.log("Lab seeding complete");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding labs:", error);
        process.exit(1);
    }
}

seed();
