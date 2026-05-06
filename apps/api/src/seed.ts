import { MongoClient, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodstore';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('📦 Connected to MongoDB');

  const db = client.db();

  // Clear existing data
  const collections = ['users', 'categories', 'products', 'vouchers', 'paymentqrs', 'orders', 'reviews'];
  for (const col of collections) {
    try { await db.dropCollection(col); } catch {}
  }

  // 1. Seed Users
  const hashedPw = await bcrypt.hash('admin123', 10);
  const users = [
    { _id: new ObjectId(), name: 'Admin', email: 'admin@foodstore.vn', password: hashedPw, phone: '0901234567', role: 'admin', loyaltyPoints: 0, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: 'Trần Nhân Viên', email: 'staff@foodstore.vn', password: hashedPw, phone: '0907654321', role: 'staff', loyaltyPoints: 0, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: 'Nguyễn Văn Khách', email: 'user@foodstore.vn', password: hashedPw, phone: '0912345678', role: 'customer', loyaltyPoints: 500, address: '123 Nguyễn Huệ, Q.1, TP.HCM', createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: 'Lê Thị Bình', email: 'binh.le@gmail.com', password: hashedPw, phone: '0988776655', role: 'customer', loyaltyPoints: 120, address: '456 Lê Lợi, Q.1, TP.HCM', createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: 'Phạm Minh Tuấn', email: 'tuan.pham@yahoo.com', password: hashedPw, phone: '0977112233', role: 'customer', loyaltyPoints: 45, address: '789 Cách Mạng Tháng 8, Q.10, TP.HCM', createdAt: new Date(), updatedAt: new Date() },
  ];
  await db.collection('users').insertMany(users);

  // 2. Seed Categories
  const categories = [
    { _id: new ObjectId(), name: '🔥 Gà Rán Giòn', slug: 'ga-ran', description: 'Gà rán truyền thống và hiện đại', order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🍔 Burger & Sandwiches', slug: 'burger', description: 'Burger kẹp thịt bò, gà, cá', order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🍚 Cơm & Mì', slug: 'com-mi', description: 'Các món ăn no bụng', order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🍕 Pizza Ý', slug: 'pizza', description: 'Pizza nướng củi giòn tan', order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🥤 Đồ Uống', slug: 'do-uong', description: 'Nước ngọt, trà trái cây', order: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🍦 Tráng Miệng', slug: 'trang-mieng', description: 'Kem, bánh ngọt', order: 6, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: new ObjectId(), name: '🍱 Combo Tiết Kiệm', slug: 'combo', description: 'Dành cho nhóm bạn và gia đình', order: 7, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];
  await db.collection('categories').insertMany(categories);

  // 3. Seed Products
  const products = [
    // Gà Rán
    { 
      categoryId: categories[0]._id, 
      name: 'Gà Rán Truyền Thống', 
      slug: 'ga-ran-truyen-thong', 
      description: 'Gà rán giòn rụm với công thức 11 loại thảo mộc bí truyền.', 
      basePrice: 39000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/2e7ed3441a76f6e52002f23b320d3215.png'], 
      options: [
        { name: 'Khẩu phần', choices: [{ label: '1 Miếng', extraPrice: 0 }, { label: '2 Miếng', extraPrice: 35000 }, { label: '3 Miếng', extraPrice: 68000 }] },
        { name: 'Loại gà', choices: [{ label: 'Ức gà', extraPrice: 0 }, { label: 'Đùi gà', extraPrice: 5000 }, { label: 'Cánh gà', extraPrice: 2000 }] }
      ], 
      isAvailable: true, averageRating: 4.8, reviewCount: 156, createdAt: new Date(), updatedAt: new Date() 
    },
    { 
      categoryId: categories[0]._id, 
      name: 'Gà Rán Sốt Cay Hàn Quốc', 
      slug: 'ga-ran-sot-cay', 
      description: 'Gà rán phủ lớp sốt cay ngọt chuẩn vị Seoul.', 
      basePrice: 45000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/8890989d38c641f6498a96f108d447d2.png'], 
      options: [
        { name: 'Cấp độ cay', choices: [{ label: 'Vừa', extraPrice: 0 }, { label: 'Cay', extraPrice: 0 }, { label: 'Siêu cay', extraPrice: 5000 }] }
      ], 
      isAvailable: true, averageRating: 4.6, reviewCount: 89, createdAt: new Date(), updatedAt: new Date() 
    },
    // Burger
    { 
      categoryId: categories[1]._id, 
      name: 'Burger Bò Phô Mai Đặc Biệt', 
      slug: 'burger-bo-pho-mai', 
      description: 'Thịt bò Úc nướng, phô mai Cheddar tan chảy, xà lách và sốt mayo.', 
      basePrice: 59000, 
      images: ['https://mcdonalds.vn/uploads/2018/food/burgers/cheeseburger.png'], 
      options: [
        { name: 'Thêm topping', choices: [{ label: 'Thêm phô mai', extraPrice: 10000 }, { label: 'Thêm thịt bò', extraPrice: 25000 }, { label: 'Thêm trứng', extraPrice: 8000 }] }
      ], 
      isAvailable: true, averageRating: 4.9, reviewCount: 230, createdAt: new Date(), updatedAt: new Date() 
    },
    { 
      categoryId: categories[1]._id, 
      name: 'Burger Gà Giòn Zinger', 
      slug: 'burger-ga-zinger', 
      description: 'Phi lê gà rán giòn cay kẹp trong bánh mì vừng.', 
      basePrice: 55000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/092e03224b1a4574945d8b7a421b3215.png'], 
      options: [], 
      isAvailable: true, averageRating: 4.5, reviewCount: 112, createdAt: new Date(), updatedAt: new Date() 
    },
    // Cơm & Mì
    { 
      categoryId: categories[2]._id, 
      name: 'Cơm Gà Sốt Tiêu Đen', 
      slug: 'com-ga-tieu-den', 
      description: 'Cơm trắng dẻo thơm ăn kèm gà phi lê sốt tiêu đậm đà.', 
      basePrice: 50000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/8890989d38c641f6498a96f108d447d2.png'], 
      options: [
        { name: 'Canh đi kèm', choices: [{ label: 'Canh rong biển', extraPrice: 0 }, { label: 'Canh chua', extraPrice: 0 }] }
      ], 
      isAvailable: true, averageRating: 4.4, reviewCount: 45, createdAt: new Date(), updatedAt: new Date() 
    },
    // Pizza
    { 
      categoryId: categories[3]._id, 
      name: 'Pizza Hải Sản Nhiệt Đới', 
      slug: 'pizza-hai-san', 
      description: 'Tôm, mực, thanh cua kết hợp cùng dứa và phô mai Mozzarella.', 
      basePrice: 169000, 
      images: ['https://dominos.vn/uploads/products/pizza-hai-san-nhiet-doi-s.jpg'], 
      options: [
        { name: 'Kích cỡ', choices: [{ label: 'Size S (7 inch)', extraPrice: 0 }, { label: 'Size M (9 inch)', extraPrice: 60000 }, { label: 'Size L (12 inch)', extraPrice: 120000 }] },
        { name: 'Đế bánh', choices: [{ label: 'Đế dày', extraPrice: 0 }, { label: 'Đế mỏng', extraPrice: 0 }, { label: 'Đế viền phô mai', extraPrice: 45000 }] }
      ], 
      isAvailable: true, averageRating: 4.7, reviewCount: 67, createdAt: new Date(), updatedAt: new Date() 
    },
    // Đồ uống
    { 
      categoryId: categories[4]._id, 
      name: 'Trà Đào Cam Sả', 
      slug: 'tra-dao-cam-sa', 
      description: 'Trà đào thơm mát kết hợp cùng cam tươi và sả.', 
      basePrice: 35000, 
      images: ['https://thecoffeehouse.com/uploads/product/1626351543_tra-dao-cam-sa.jpg'], 
      options: [
        { name: 'Kích cỡ', choices: [{ label: 'Vừa', extraPrice: 0 }, { label: 'Lớn', extraPrice: 10000 }] },
        { name: 'Đường/Đá', choices: [{ label: 'Bình thường', extraPrice: 0 }, { label: 'Ít đường/đá', extraPrice: 0 }, { label: 'Không đường/đá', extraPrice: 0 }] }
      ], 
      isAvailable: true, averageRating: 4.9, reviewCount: 310, createdAt: new Date(), updatedAt: new Date() 
    },
    { 
      categoryId: categories[4]._id, 
      name: 'Pepsi Không Calo', 
      slug: 'pepsi-zero', 
      description: 'Nước giải khát có gas không đường.', 
      basePrice: 18000, 
      images: ['https://suntorypepsico.vn/uploads/products/pepsi-zero-sugar.png'], 
      options: [], 
      isAvailable: true, averageRating: 4.3, reviewCount: 56, createdAt: new Date(), updatedAt: new Date() 
    },
    // Tráng miệng
    { 
      categoryId: categories[5]._id, 
      name: 'Bánh Tart Trứng', 
      slug: 'banh-tart-trung', 
      description: 'Bánh tart nướng giòn với nhân kem trứng béo ngậy.', 
      basePrice: 18000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/2e7ed3441a76f6e52002f23b320d3215.png'], 
      options: [
        { name: 'Số lượng', choices: [{ label: '1 Cái', extraPrice: 0 }, { label: 'Combo 4 Cái', extraPrice: 50000 }] }
      ], 
      isAvailable: true, averageRating: 4.8, reviewCount: 145, createdAt: new Date(), updatedAt: new Date() 
    },
    // Combo
    { 
      categoryId: categories[6]._id, 
      name: 'Combo Gia Đình Vui Vẻ', 
      slug: 'combo-gia-dinh', 
      description: '4 Miếng Gà + 2 Burger + 1 Khoai tây chiên L + 3 Pepsi M.', 
      basePrice: 299000, 
      images: ['https://kfcvietnam.com.vn/uploads/product/2e7ed3441a76f6e52002f23b320d3215.png'], 
      options: [], 
      isAvailable: true, averageRating: 5.0, reviewCount: 12, createdAt: new Date(), updatedAt: new Date() 
    },
  ];
  const prodDocs = await db.collection('products').insertMany(products);
  const prodIds = Object.values(prodDocs.insertedIds);

  // 4. Seed Payment QRs
  await db.collection('paymentqrs').insertMany([
    { bankName: 'Vietcombank', accountName: 'PHAN THANH TUNG', accountNumber: '1023456789', qrImageUrl: 'https://img.vietqr.io/image/vcb-1023456789-compact2.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { bankName: 'Momo', accountName: 'PHAN THANH TUNG', accountNumber: '0901234567', qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=momo://0901234567', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]);

  // 5. Seed Vouchers
  await db.collection('vouchers').insertMany([
    { code: 'GIAM20', discountType: 'percent', discountValue: 20, minOrderAmount: 100000, maxDiscount: 50000, usageLimit: 100, usedCount: 5, expiresAt: new Date('2026-12-31'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { code: 'FREESHIP', discountType: 'fixed', discountValue: 15000, minOrderAmount: 50000, usageLimit: 500, usedCount: 20, expiresAt: new Date('2026-06-30'), isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]);

  // 6. Seed Orders
  const orders = [
    { 
      userId: users[2]._id, 
      orderCode: 'ORD-' + Date.now().toString().slice(-6),
      items: [{ productId: prodIds[0], name: 'Gà Rán Truyền Thống', quantity: 2, price: 39000, selectedOptions: [{ name: 'Khẩu phần', choice: '1 Miếng', extraPrice: 0 }] }], 
      subtotal: 78000,
      totalPrice: 78000, 
      status: 'pending', 
      paymentMethod: 'cod', 
      deliveryAddress: users[2].address, 
      phone: users[2].phone,
      createdAt: new Date(Date.now() - 3600000), 
      updatedAt: new Date(Date.now() - 3600000) 
    },
    { 
      userId: users[3]._id, 
      orderCode: 'ORD-' + (Date.now() + 1).toString().slice(-6),
      items: [{ productId: prodIds[2], name: 'Burger Bò Phô Mai Đặc Biệt', quantity: 1, price: 59000, selectedOptions: [{ name: 'Thêm topping', choice: 'Thêm phô mai', extraPrice: 10000 }] }], 
      subtotal: 69000,
      totalPrice: 69000, 
      status: 'delivering', 
      paymentMethod: 'qr_transfer', 
      deliveryAddress: users[3].address, 
      phone: users[3].phone,
      createdAt: new Date(Date.now() - 7200000), 
      updatedAt: new Date(Date.now() - 3600000) 
    },
    { 
      userId: users[4]._id, 
      orderCode: 'ORD-' + (Date.now() + 2).toString().slice(-6),
      items: [{ productId: prodIds[6], name: 'Trà Đào Cam Sả', quantity: 3, price: 35000, selectedOptions: [{ name: 'Kích cỡ', choice: 'Lớn', extraPrice: 10000 }] }], 
      subtotal: 135000,
      totalPrice: 135000, 
      status: 'completed', 
      paymentMethod: 'cod', 
      deliveryAddress: users[4].address, 
      phone: users[4].phone,
      createdAt: new Date(Date.now() - 86400000), 
      updatedAt: new Date(Date.now() - 72000000) 
    },
  ];
  await db.collection('orders').insertMany(orders);

  // 7. Seed Reviews
  await db.collection('reviews').insertMany([
    { productId: prodIds[0], userId: users[2]._id, rating: 5, comment: 'Gà rất giòn và nóng hổi, giao hàng nhanh!', createdAt: new Date() },
    { productId: prodIds[2], userId: users[3]._id, rating: 4, comment: 'Bánh ngon nhưng hơi ít sốt.', createdAt: new Date() },
    { productId: prodIds[6], userId: users[4]._id, rating: 5, comment: 'Trà đào thơm nhất từng uống!', createdAt: new Date() },
  ]);

  console.log('✅ Comprehensive Seed completed!');
  console.log('📧 Admin: admin@foodstore.vn / admin123');
  console.log('📧 Staff: staff@foodstore.vn / admin123');
  console.log('📧 User:  user@foodstore.vn / admin123');
  await client.close();
}

seed().catch(console.error);
