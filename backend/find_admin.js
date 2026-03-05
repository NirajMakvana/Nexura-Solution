import mongoose from 'mongoose';

async function findAdmins() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/nexura-solution');

        // Define a minimal User schema just to query
        const userSchema = new mongoose.Schema({
            email: String,
            role: String,
            firstName: String,
            lastName: String,
            isActive: Boolean
        }, { strict: false });

        const User = mongoose.model('User', userSchema);

        const admins = await User.find({ role: 'admin' });
        console.log('--- ADMIN USERS IN DB ---');
        admins.forEach(admin => {
            console.log(`Name: ${admin.firstName} ${admin.lastName}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Role: ${admin.role}`);
            console.log('-------------------------');
        });

        if (admins.length === 0) {
            console.log('NO ADMIN USERS FOUND!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

findAdmins();
