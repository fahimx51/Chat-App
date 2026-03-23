import mongoose from "mongoose";

mongoose.connection.on('connected', () => console.log("Database Connected!"));

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/chat-app`)
    }
    catch (error) {
        console.log(error);
    }
};