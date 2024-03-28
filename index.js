require("dotenv").config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors')

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');

const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { Order } = require('./model/Order');

const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require("path");

// Stripe
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);


// Webhook

// TODO: we will capture actual order after deploying out server live on public URL

const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;

      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
      order.paymentStatus = 'received';
      await order.save()

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; // TODO: should not be in code;

//middlewares
server.use(express.static(path.resolve(__dirname, "build")))
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
server.use(passport.authenticate('session'));
server.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);
server.use(express.json()); // to parse req.body


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, // for decimal compensation
    currency: "INR",
    description: "description",
    payment_method_types: ['card'],
    receipt_email: "g@gmail.com",
    shipping: {
      address: {
        city: "city",
        line1: "line1",
        line2: "line2",
        postal_code: "110084",
        state: "state",
        country: "IN"
      },
      name: "Gaurav Joshi"
    },
    // metadata: {
    //   orderId
    // }
    // automatic_payment_methods: {
    //   enabled: true,
    // },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// Routing Division
server.use('/products', isAuth(), productsRouter.router);
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/users', isAuth(), usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);
// this line we add to make react router work in case of other routes doesnt match
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// Passport Strategies
// 1. Local Strategy
passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'email' },
    async function (email, password, done) {
      // by default passport uses username
      try {
        const user = await User.findOne({ email });
        console.log(user);
        // console.log(email, password, user);
        if (!user) {
          return done(null, false, { message: 'invalid credentials' }); // for safety
        }
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          'sha256',
          async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              return done(null, false, { message: 'invalid credentials' });
            }
            const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
            console.log(token, "😂😂😂")
            done(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
          }
        );
      } catch (err) {
        done(err);
      }
    })
);

// 2. JWT strategy
passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log("jwt index file", { jwt_payload });
    try {
      const user = await User.findById(jwt_payload.id);
      console.log("in jwt", user);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  console.log('serialize', user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role, });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  console.log('de-serialize', user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Connection to the local DataBase
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Database connected");
}

// NodeJS Server.
server.listen(process.env.PORT, () => {
  console.log("Server has started successfully.");
})