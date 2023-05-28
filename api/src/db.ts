import mongoose from "mongoose";
import { environment } from "./environment";
import { IMongo } from "./interfaces/mongo";

export class Mongo implements IMongo {
    public readonly mongoose: typeof mongoose;
    public readonly connection: mongoose.Connection;
    public static instance: Mongo | undefined;
    private constructor(m: typeof mongoose, c: mongoose.Connection) {
        if (Mongo.instance) {
            throw new Error("Cannot create multiple instances of Mongo");
        }
        this.mongoose = m;
        this.connection = c;
    }

    public static connect(then: (m: typeof mongoose, db: mongoose.Connection) => void, err: (e: any) => void, options:mongoose.ConnectOptions = {}) {
        if (Mongo.instance) {
            then(Mongo.instance.mongoose, Mongo.instance.connection);
            return Mongo.instance;
        }
        console.log("Connecting to MongoDB")
        const MongoConnection = mongoose.connect(environment.mongoUri, options).then((m: typeof mongoose) => {
            console.log("Connected to MongoDB");
            Mongo.instance = new Mongo(m, m.connection);
            then(m, m.connection);
        }).catch((e) => {
            err(e);
        });
    }

    public static getInstance(): Mongo | undefined {
        if (!Mongo.instance) {
            return undefined;
        }
        return Mongo.instance;
    }
}
