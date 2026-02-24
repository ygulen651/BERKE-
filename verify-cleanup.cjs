const { MongoClient } = require('mongodb');
const uri = "mongodb://ygulen651_db_user:UHiDDW61TVbPmsmW@ac-oynirdl-shard-00-00.jtn56ql.mongodb.net:27017,ac-oynirdl-shard-00-01.jtn56ql.mongodb.net:27017/studio_db?authSource=admin&replicaSet=atlas-tixzyc-shard-0&tls=true";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('studio_db');

        const collections = ["Shoot", "Task", "Transaction"];
        for (const col of collections) {
            const count = await db.collection(col).countDocuments({});
            console.log(`Collection '${col}' count: ${count}`);
        }

    } finally {
        await client.close();
    }
}
run();
