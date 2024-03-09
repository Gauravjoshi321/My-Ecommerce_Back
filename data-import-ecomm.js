const fs = require('fs');
// const dotenv = require('dotenv');
const mongoose = require('mongoose');
// const Rashi = require('./../rashiModel');
const Product = require('./model/Product');
console.log(Product)

// dotenv.config({ path: './config.env' });


// CONNECT TO ATLAS

// mongoose.connect(process.env.DATABASE, {
//   useNewUrlParser: true,
//   // useCreateIndex: true,
//   // useFindAndModify: false,
//   useUnifiedTopology: true
// }).then(con => {
//   console.log("CONNECTION SUCCESSFULL !");
// })

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/My-Ecommerce_Back');
  console.log("Database connected");
}

// READ FILE
const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`));

// IMPORT DATA TO THE DATABASE
const importData = async () => {
  try {
    await Product.create(products);
    console.log("Data imported successfully");
  }
  catch (err) {
    console.log(err);
  }
  process.exit();
}

// DELETE DATA FROM THE DATABASE
const deleteTours = async () => {
  try {
    await Product.deleteMany();
    console.log("Data deleted successfully");
  }
  catch (err) {
    console.log(err);
  }
  process.exit();
}



if (process.argv[2] === '--import') {
  importData();
}
else if (process.argv[2] === '--delete') {
  deleteTours();
}


// node Rashi-data/dev-dataImport.js --delete
// node Rashi-data/dev-dataImport.js --import