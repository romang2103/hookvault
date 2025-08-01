// pages/api/test.js
import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("hookvault-db"); // Defaults to database in your URI
    const rawData = await db.collection("hookvault").find({}).toArray();

    const data = rawData.map(
      ({ category, subcategory, hook, generated_at }) => ({
        category,
        subcategory,
        hook,
        generated_at: generated_at,
      })
    );
    console.log("data: ", data);

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
