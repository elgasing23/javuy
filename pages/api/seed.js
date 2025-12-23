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
                    { type: 'text', value: '# Welcome to Java ☕\\n\\nJava is an **Object-Oriented Programming (OOP)** language. This means everything in Java is associated with classes and objects.\\n\\n### Why OOP?\\n- **Modularity**: Code is organized into efficiently manageable pieces.\\n- **Reuse**: Write once, use everywhere.\\n- **Security**: Data hiding and encapsulation.' },
                    { type: 'text', value: '### Your First Program\\nEvery Java application begins with a class definition.\\nThe entry point of the code is the `main` method.\\n\\n```java\\npublic class Main {\\n    public static void main(String[] args) {\\n        // Code goes here\\n    }\\n}\\n```\\n\\n**Semicolons (;)** are mandatory! Every statement must end with one, or the compiler will yell at you 😡.' },
                    {
                        type: 'code',
                        value: 'public class Main {\n    public static void main(String[] args) {\n        // Try changing the text inside the quotes\n        System.out.println("Hello Javuy!");\n    }\n}',
                        expectedOutput: 'Hello Javuy!'
                    },
                    {
                        type: 'quiz',
                        question: 'What character is used to end a statement in Java?',
                        options: ['. (Dot)', ': (Colon)', '; (Semicolon)', ', (Comma)'],
                        answer: 2
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
