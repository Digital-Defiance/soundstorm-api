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
        Mongo.instance = this;
    }

    public static async connect(then: (db: mongoose.Connection) => void, err: (e: any) => void, options:mongoose.ConnectOptions = {}): Promise<Mongo> {
        if (Mongo.instance) {
            then(Mongo.instance.connection);
            return Mongo.instance;
        }
        const MongoConnection = await mongoose.connect(environment.mongoUri, options);
        const DB = MongoConnection.connection;
        DB.once("open", (db: mongoose.Connection) => {
            then(db);
        });        
        DB.on("error", (e) => {
            err(e);
        });
        return new Mongo(mongoose, DB);
    }

    public static getInstance(): Mongo | undefined {
        if (!Mongo.instance) {
            return undefined;
        }
        return Mongo.instance;
    }
}
