const { MongoClient } = require('mongodb');
// Using the connection string from .env.local
const uri = "mongodb://ygulen651_db_user:UHiDDW61TVbPmsmW@ac-oynirdl-shard-00-00.jtn56ql.mongodb.net:27017,ac-oynirdl-shard-00-01.jtn56ql.mongodb.net:27017/studio_db?authSource=admin&replicaSet=atlas-tixzyc-shard-0&tls=true";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('studio_db');

        console.log("Starting database cleanup...");

        // Collections to clear: Shoot (Calendar), Task (Work items), Transaction (Finance)
        const collectionsToClear = ["Shoot", "Task", "Transaction"];

        for (const collectionName of collectionsToClear) {
            const result = await db.collection(collectionName).deleteMany({});
            console.log(`Deleted ${result.deletedCount} documents from '${collectionName}' collection.`);
        }

        console.log("Cleanup completed successfully.");

    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
