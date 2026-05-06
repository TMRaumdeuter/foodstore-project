const mongoose = require('mongoose');

async function migrate() {
  const conn = await mongoose.createConnection('mongodb://127.0.0.1:27017/foodstore').asPromise();
  console.log('Connected to DB');
  
  const products = await conn.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products`);
  
  for (const p of products) {
    if (typeof p.categoryId === 'string' && mongoose.Types.ObjectId.isValid(p.categoryId)) {
      await conn.collection('products').updateOne(
        { _id: p._id },
        { $set: { categoryId: new mongoose.Types.ObjectId(p.categoryId) } }
      );
      console.log(`Converted: ${p.name}`);
    }
  }
  
  console.log('Migration completed');
  await conn.close();
}

migrate().catch(console.error);
