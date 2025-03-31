const { MongoClient } = require("mongodb");

exports.handler = async function (event) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const data = JSON.parse(event.body);
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db("netlifyDB");
        const collection = db.collection("users");

        await collection.deleteMany({});
        await collection.insertMany(data);
        await client.close();
        return { statusCode: 200, body: JSON.stringify({ message: "Dữ liệu đã lưu!" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
