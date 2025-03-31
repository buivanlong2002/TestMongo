const { MongoClient } = require("mongodb");

exports.handler = async function () {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db("netlifyDB");
        const collection = db.collection("users");

        const users = await collection.find().toArray();
        await client.close();
        return { statusCode: 200, body: JSON.stringify(users) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
