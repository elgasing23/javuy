import dbConnect from '../../lib/db';
import User from '../../lib/models/User';
import Chapter from '../../lib/models/Chapter';
import Progress from '../../lib/models/Progress';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // ... validation

    try {
        await dbConnect();

        // Clear all
        await User.deleteMany({});
        await Chapter.deleteMany({});
        await Progress.deleteMany({});

        // Hash Passwords
        const adminPass = await bcrypt.hash('nopal901', 10);
        const userPass = await bcrypt.hash('password123', 10);

        // Create Admin
        await User.create({
            username: 'elgasing',
            password: adminPass,
            role: 'admin',
            xp: 9999, // Admin perk
            streak: 100,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        });

        // Create Regular User
        const user = await User.create({
            username: 'JavaLearner',
            password: userPass,
            role: 'user',
            xp: 0,
            streak: 1,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JavaLearner'
        });

        // Create Chapters
        const chapters = await Chapter.create([
            {
                title: 'Introduction to Java',
                order: 1,
                content: [
                    { type: 'text', value: '# Welcome to Java\nJava is a powerful language. Let\'s write your first code!' },
                    {
                        type: 'code',
                        value: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java");\n    }\n}',
                        expectedOutput: 'Hello Java'
                    },
                    {
                        type: 'quiz',
                        question: 'What is the entry point of a Java program?',
                        options: ['start()', 'main()', 'run()', 'init()'],
                        answer: 1
                    }
                ],
                xpReward: 50
            },
            { title: 'Variables & Data Types', order: 2, content: '# Variables\nLearn about int, double, boolean, and String.', xpReward: 50 },
            { title: 'Control Flow', order: 3, content: '# If/Else & Loops\nControlling the flow of your program.', xpReward: 100 },
            { title: 'Classes & Objects', order: 4, content: '# OOP\\nThe core of Java.', xpReward: 150 },
            { title: 'Arrays & Lists', order: 5, content: '# Collections\\nStoring multiple values.', xpReward: 100 },
        ]);

        // Initialize Progress (First chapter active, others locked)
        // Actually, let's make the logic simpler: if no progress exists, everything is locked except first.
        // But we can explicitly create an 'active' progress for the first chapter.

        await Progress.create({
            user: user._id,
            chapter: chapters[0]._id,
            status: 'active'
        });

        res.status(200).json({ message: 'Database seeded successfully', user, chapters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
