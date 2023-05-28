import mongoose from 'mongoose';

export interface IMongo {
    mongoose: typeof mongoose;
    connection: mongoose.Connection;
}