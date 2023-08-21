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

//view all in cart
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

//post cart by id
app.post("/cart", async (req, res) => {
  const { product_quantity, user_id, product_id } = req.body;
  try {
    const results = await pool.query(
      "SELECT id FROM carts WHERE user_id = $1;",
      [user_id]
    );
    const cart_id = results.rows[0].id;
    console.log(cart_id);
    await pool.query(
      `INSERT INTO users_carts (user_id, cart_id, product_id, product_quantity) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, cart_id, product_id)
      DO UPDATE SET product_quantity = EXCLUDED.product_quantity`,
      [user_id, cart_id, product_id, product_quantity]
    );
    res.status(201).json({ msg: "item added to cart" });
  } catch (error) {
    if (error) {
      if (process.env.NODE_ENV === "development") {
        res.status(500).json({ msg: error.message, stack: error.stack });
      } else {
        res.status(500).json({ msg: "Error occurred!" });
      }
      return;
    }
  }
});

// delete from cart by id
app.delete("/cart", (req, res) => {
  const { user_id, product_id } = req.body;
  pool.query(
    "DELETE FROM users_carts WHERE user_id = $1 AND product_id = $2;",
    [user_id, product_id],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      res.status(200).json({ msg: "Item deleted from cart." });
    }
  );
});

//checkout cart. when a cart is not empty, and payment is successful, an order is created, and cart is emptied
app.post("/cart/checkout", async (req, res) => {
  const { user_id } = req.body;
  try {
    const results = await pool.query(
      "SELECT * FROM users_carts WHERE user_id = $1",
      [user_id]
    );
    const cart_checkout = results.rows;
    console.log(cart_checkout);

    //if cart is empty
    if (!cart_checkout[0]) {
      res.status(404).json({ msg: "No items in cart!" });
      return;
    }

    //in a future rendition of this api, logic to handle payment processes will be inserted here
    //if payment successful,
    //generates order id
    const results2 = await pool.query(
      "INSERT INTO orders (user_id) VALUES ($1) RETURNING id",
      [user_id]
    );
    const order_id = results2.rows[0].id;
    console.log(order_id);

    //add stuff from cart checkout to users orders using order id that was just made
    await pool.query(
      `WITH temp AS (
          SELECT user_id, $2::uuid as order_id, product_id, product_quantity FROM users_carts
          WHERE user_id = $1
        )
        INSERT INTO users_orders (user_id, order_id, product_id, product_quantity)
        SELECT user_id, order_id, product_id, product_quantity FROM temp;`,
      [user_id, order_id]
    );
    //if order is successful- clear cart
    await pool.query(
      "DELETE FROM users_carts WHERE user_id = $1", [user_id]
    );

    res.status(200).json(cart_checkout);
  } catch (error) {
    if (error) {
      if (process.env.NODE_ENV === "development") {
        res.status(500).json({ msg: error.message, stack: error.stack });
      } else {
        res.status(500).json({ msg: "Error occurred!" });
      }
      return;
    }
  }
});

app.get("/orders", (req, res) => {
  const { user_id } = req.body;
  pool.query(
    "SELECT * FROM orders WHERE user_id = $1;",
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
        res.status(404).json({ msg: "No orders found!" });
        return;
      } else {
        res.status(200).json(cart);
      }
    }
  );
});

//TODO
// View Orders
// Get /api/orders/:id

//after lunch go through comments in post below
app.post("/orders", (req, res) => {
  const { user_id, order_id } = req.body;
  pool.query(
    // "SELECT * FROM orders WHERE user_id = $1 AND order_id = $2;",
    [user_id, order_id],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      // const cart = results.rows;
      console.log(results);
      if (!cart) {
        res.status(404).json({ msg: "No orders found!" });
        return;
      } else {
        // res.status(200).json(cart);
      }
    }
  );
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
}

module.exports.app = app;
