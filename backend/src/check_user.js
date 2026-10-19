import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId("69452cfe34c8cf92bf95ee03") });
    console.log("User:", user);
    mongoose.disconnect();
};
connectDB();
