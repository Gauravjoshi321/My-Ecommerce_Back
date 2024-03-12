const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');

const server = express();

//middlewares
server.use(cors({ exposedHeaders: ['X-Total-Count'] })) // To access the data from Back(one domain) and by front(other domain)
server.use(express.json()); // to parse req.body


// Routing Division
server.use('/products', productsRouter.router);
server.use('/categories', categoriesRouter.router);
server.use('/brands', brandsRouter.router);
server.use('/users', usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', cartRouter.router);
server.use('/orders', ordersRouter.router);


// Connection to the local DataBase
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/My-Ecommerce_Back');
  console.log("Database connected");
}

// NodeJS Server.
server.get('/', (req, res) => {
  res.json({ "status": "success 💗💗" })
})

server.listen(8080, () => {
  console.log("Server has started successfully.");
})