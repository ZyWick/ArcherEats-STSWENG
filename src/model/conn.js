import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});

export async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
      } catch (err) {
        console.error('Error connecting to MongoDB:', err);
      }
};

export function getDb(dbName = process.env.DB_NAME) {
    return client.db(dbName);
};

// These are just used for closing the connection properly
function signalHandler() {
    console.log("Closing MongoDB connection...");
    client.close();
    process.exit();
}

process.on("SIGINT", signalHandler);
process.on("SIGTERM", signalHandler);
process.on("SIGQUIT", signalHandler);