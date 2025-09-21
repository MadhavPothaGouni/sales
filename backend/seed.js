const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: __dirname + "/.env" });  // ✅ load backend/.env

const Customer = require("./models/Customer");
const Product = require("./models/Product");
const Sales = require("./models/Sales");


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected for seeding"))
.catch(err => {
  console.error("❌ DB connection error:", err);
  process.exit(1);
});

async function seedDB() {
  try {
    // Clear existing data
    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Sales.deleteMany({})
    ]);
    console.log("🧹 Old data cleared");

    // Create Customers
    const customers = Array.from({ length: 15 }).map(() => ({
      name: faker.person.fullName(),
      region: faker.helpers.arrayElement(["North", "South", "East", "West"]),
      type: faker.helpers.arrayElement(["Individual", "Business"]),
    }));
    const createdCustomers = await Customer.insertMany(customers);
    console.log("✅ Customers seeded");

    // Create Products
    const products = Array.from({ length: 15 }).map(() => ({
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement(["Electronics", "Clothing", "Food", "Books"]),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    }));
    const createdProducts = await Product.insertMany(products);
    console.log("✅ Products seeded");

    // Create Sales
    const sales = Array.from({ length: 100 }).map(() => {
      const product = faker.helpers.arrayElement(createdProducts);
      const customer = faker.helpers.arrayElement(createdCustomers);
      const quantity = faker.number.int({ min: 1, max: 10 });

      return {
        product: product._id,
        customer: customer._id,
        quantity,
        totalRevenue: quantity * product.price,
        reportDate: faker.date.between({ from: "2024-01-01", to: "2025-12-31" }),
      };
    });
    await Sales.insertMany(sales);
    console.log("✅ Sales seeded");

    console.log("🎉 Database seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDB();
