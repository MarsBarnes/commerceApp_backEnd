const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const session = require("express-session");
const { Pool } = require("pg");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const pool = new Pool({
  user: process.env.user,
  host: "localhost",
  database: "commerce",
  password: process.env.password,
  port: process.env.dbport,
});

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const store = new session.MemoryStore();

// session middleware
app.use(
  session({
    secret: process.env.secret,
    // 48hour cookie timeout
    cookie: { maxAge: 172800000, secure: true, sameSite: "none" },
    resave: false,
    saveUninitialized: false,
    store,
  })
);

//passport
app.use(passport.initialize());
app.use(passport.session());

//root
app.get("/", (req, res) => {
  res.send("Hello Worldtdtrdr");
});

//users
app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users;", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

//login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(` SAHEFGKOWERNOGSERGJVNSOIERGNIOWERSVJG ${username}`);
  pool.query(
    "SELECT id, passwordhashed FROM users WHERE username = $1;",
    [username],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      const user = results.rows[0];
      console.log(results);
      if (!user) {
        res.status(404).json({ msg: "No user found!" });
        return;
      }
      if (user.passwordhashed === password) {
        req.session.authenticated = true;
        req.session.user = {
          id: user.id,
          username,
        };
        console.log(req.session);
        res.status(200).json({ msg: "Success" });
      } else {
        res.status(403).json({ msg: "Bad Credentials" });
      }
    }
  );
});

//PRODUCTS
//get all products
app.get("/products", (req, res) => {
  pool.query("SELECT * FROM products", (error, results) => {
    if (error) {
      if (process.env.NODE_ENV === "development") {
        res.status(500).json({ msg: error.message, stack: error.stack });
      } else {
        res.status(500).json({ msg: "Error occurred!" });
      }
      return;
    }
    const products = results.rows;
    console.log(results);
    if (products.length < 1) {
      res.status(404).json({ msg: "No products found!" });
      return;
    } else {
      res.status(200).json(products);
    }
  });
});

//get product by id
app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  pool.query(
    "SELECT * FROM products WHERE id = $1;",
    [id],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      const product = results.rows[0];
      console.log(results);
      if (!product) {
        res.status(404).json({ msg: "No product found!" });
        return;
      } else {
        res.status(200).json(product);
      }
    }
  );
});

//TODO
// add to cart, delete from cart

//     Post /api/cart
//     Delete /api/cart/:product_id

app.get("/cart", (req, res) => {
  const { user_id } = req.body;
  pool.query(
    "SELECT * FROM users_carts WHERE user_id = $1;",
    [user_id],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      const cart = results.rows;
      console.log(results);
      if (!cart) {
        res.status(404).json({ msg: "No cart found!" });
        return;
      } else {
        res.status(200).json(cart);
      }
    }
  );
});

// RETURNING user_id, cart_id, product_id, product_quantity

// //post cart by id
// app.post("/cart/:id", (req, res) => {
//   const { id } = req.params;
//   const { quantity } = req.body;
//   const {user_id} =req.session.user.id
//   pool.query(
//     "INSERT INTO users_carts (user_id, cart_id, product_id, product_quantity) VALUES ($1, $2, $3, $4);"[
//       user_id, cart_id, id, quantity
//     ],
//     (error, results) => {
//       if (error) {
//         if (process.env.NODE_ENV === "development") {
//           res.status(500).json({ msg: error.message, stack: error.stack });
//         } else {
//           res.status(500).json({ msg: "Error occurred!" });
//         }
//         return;
//       }
//       const product = results.rows;
//       console.log(results);
//       if (!product) {
//         res.status(404).json({ msg: "No product found!" });
//         return;
//       } else {
//         res.status(200).json(product);
//       }
//     }
//   );
// });

//post cart by id
app.post("/cart/:id", (req, res) => {
  const cart_id = req.params.id;
  const { quantity } = req.body;
  // //Line below is causing error. need to figure out how postman gets session info. terminal shows session is created when post /login credentials succeed, but postman is not getting session data
  // const { user_id } = req.session.user.id;
  const {user_id} = req.body;
  const { product_id } = req.body;
  console.log(req.session.user);
  pool.query(
    "INSERT INTO users_carts (user_id, cart_id, product_id, product_quantity) VALUES ($1, $2, $3, $4);"[
      (user_id, cart_id, product_id, quantity)
    ],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      const product = results.rows;
      console.log(results);
    }
  );
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
}

module.exports.app = app;
