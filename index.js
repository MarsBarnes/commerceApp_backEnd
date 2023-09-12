const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const app = express();
require("dotenv").config();
const session = require("express-session");
const { Pool } = require("pg");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;

const cors = require("cors");

app.use(cors());

// Use Helmet! Details on the headers Helmet sets: https://helmetjs.github.io/
app.use(helmet());

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
console.log({ secret: process.env.secret });
app.use(
  session({
    secret: process.env.secret,
    // 48hour cookie timeout
    cookie: { maxAge: 172800000, secure: true, sameSite: false },
    resave: false,
    saveUninitialized: false,
    store,
  })
);

//ensure logged in
// later add ensureAuthentication to the routes below that require login
function ensureAuthentication(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader) {
    console.log("bearerHeader", bearerHeader);
    const token = bearerHeader.replace(/^Bearer /i, "");
    console.log("token", token);
    pool.query(
      "SELECT user_id, created_at FROM token WHERE token = $1::uuid",
      [token],
      (error, results) => {
        if (error) {
          if (process.env.NODE_ENV === "development") {
            res.status(500).json({ msg: error.message, stack: error.stack });
          } else {
            res.status(500).json({ msg: "Error occurred!" });
          }
          return;
        }

        if (results.rows.length !== 1) {
          res
            .status(403)
            .json({ msg: "You're not authorized to view this page" });
          return;
        }

        const user_id = results.rows[0].user_id;
        console.log("user_id", user_id);
        req.user_id = user_id;
        next();
      }
    );
  } else {
    res.status(403).json({ msg: "You're not authorized to view this page" });
  }
}

//passport
// app.use(passport.initialize());
// app.use(passport.session());

//root
app.get("/", (req, res) => {
  res.send("Hello Worldtdtrdr");
});

//login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // console.log(`${username}`);
  pool.query(
    "SELECT user_id, passwordhashed, username FROM login WHERE username = $1;",
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
      console.log(user);
      if (!user) {
        res.status(404).json({ msg: "No user found!" });
        return;
      }
      if (user.passwordhashed === password) {
        pool.query(
          "INSERT INTO token (user_id) VALUES ($1) RETURNING *;",
          [user.user_id],
          (error, results) => {
            if (error) {
              if (process.env.NODE_ENV === "development") {
                res
                  .status(500)
                  .json({ msg: error.message, stack: error.stack });
              } else {
                res.status(500).json({ msg: "Error occurred!" });
              }
              return;
            }
            req.session.authenticated = true;
            req.session.user = {
              id: user.user_id,
              username,
              token: results.rows[0].token,
            };
            console.log(req.session);
            res
              .status(200)
              .json({ msg: "Success", token: results.rows[0].token });
          }
        );
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

//get requests can not have a body. will need to change all get requests with bodies to have params instead. or session/cookies
//view all in cart
app.get("/cart", ensureAuthentication, (req, res) => {
  const { user_id } = req;
  pool.query(
    `SELECT users_carts.user_id, users_carts.product_id, users_carts.cart_id, users_carts.product_quantity, products.product_name, products.product_description, products.color, products.quantity_available, products.price
    FROM users_carts
    INNER JOIN products ON users_carts.product_id = products.id
    WHERE users_carts.user_id = $1;`,
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
app.post("/cart", ensureAuthentication, async (req, res) => {
  const { user_id } = req;
  const { product_quantity, product_id } = req.body;
  try {
    const results = await pool.query(
      "SELECT id FROM carts WHERE user_id = $1;",
      [user_id]
    );
    const cart_id = results.rows[0].id;
    console.log("cart_id", cart_id);
    console.log([user_id, cart_id, product_id, product_quantity]);
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
app.delete("/cart/:product_id", ensureAuthentication, (req, res) => {
  const { user_id } = req;
  const { product_id } = req.params;
  console.log("user_id", user_id);
  console.log("product_id", product_id);
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
app.post("/cart/checkout", ensureAuthentication, async (req, res) => {
  const { user_id } = req;
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
      "INSERT INTO orders (user_id) VALUES ($1) RETURNING id, created_at",
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
    await pool.query("DELETE FROM users_carts WHERE user_id = $1", [user_id]);

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

//view all orders
app.get("/orders", ensureAuthentication, (req, res) => {
  const { user_id } = req;
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
      const orders = results.rows;
      console.log(results);
      if (!orders) {
        res.status(404).json({ msg: "No orders found!" });
        return;
      } else {
        res.status(200).json(orders);
      }
    }
  );
});

//make this not a post, maybe a get?
// View Orders details by order id
app.get("/orders/:order_id", ensureAuthentication, (req, res) => {
  const { order_id } = req.params;
  const { user_id } = req;
  pool.query(
    "SELECT * FROM users_orders WHERE user_id = $1 AND order_id = $2;",
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
      const order = results.rows;
      console.log(results);
      if (!order) {
        res.status(404).json({ msg: "No orders found!" });
        return;
      } else {
        res.status(200).json(order);
      }
    }
  );
});

// View user account
app.get("/user", ensureAuthentication, (req, res) => {
  const { user_id } = req;
  pool.query(
    `SELECT id, firstname, lastname, email, username
      FROM users
      INNER JOIN token ON token.user_id = users.id
      INNER JOIN login ON login.user_id = users.id
      WHERE id = $1 ;`,
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
      const user = results.rows[0];
      console.log("results: " + user);
      if (!user) {
        res.status(404).json({ msg: "No user found!" });
        return;
      } else {
        res.status(200).json(user);
      }
    }
  );
});

// Update user account
app.post("/user", ensureAuthentication, (req, res) => {
  const { user_id } = req;
  const { firstname, lastname, email, username } = req.body;
  pool.query(
    //  update the following to change frirstname, lastname, email in users table given info passed via user_id and req.body
    `
UPDATE users
SET
  firstname = $2,
  lastname = $3,
  email = $4
WHERE users.id = $1
`,
    [user_id, firstname, lastname, email],
    (error, results) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          res.status(500).json({ msg: error.message, stack: error.stack });
        } else {
          res.status(500).json({ msg: "Error occurred!" });
        }
        return;
      }
      pool.query(
        //  update the following to change username in login table given user_ud passed via req
        `
UPDATE login
SET
  username = $1
WHERE login.user_id = $2
`,
        [username, user_id],
        (error, results) => {
          if (error) {
            if (process.env.NODE_ENV === "development") {
              res.status(500).json({ msg: error.message, stack: error.stack });
            } else {
              res.status(500).json({ msg: "Error occurred!" });
            }
            return;
          }
          const user = results.rows;
          console.log(user);
          if (!user) {
            res.status(404).json({ msg: "Error!" });
            return;
          } else {
            res.status(200).json({ msg: "Account Updated!" });
          }
        }
      );
    }
  );
});

//todo
//add salt and hash
//Sign up with username and password.
// INSERT INTO carts a cart uuid for the newly made user uuid. (1 to 1 relationship between cart and user.)
app.post("/register", async (req, res) => {
  const { firstname, lastname, email, passwordhashed, username } = req.body;

  try {
    const results = await pool.query(
      "INSERT INTO users (firstname, lastname, email) VALUES ($1, $2, $3) RETURNING id;",
      [firstname, lastname, email]
    );
    const user_id = results.rows[0].id;

    await pool.query(
      "INSERT INTO login (user_id, username, passwordhashed) VALUES ($1, $2, $3);",
      [user_id, username, passwordhashed]
    );

    await pool.query("INSERT INTO carts (user_id) VALUES ($1);", [user_id]);
    res.status(200).json({ msg: "Account created" });
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

app.post("/logout", ensureAuthentication, async (req, res) => {
  const { user_id } = req;

  try {
    const results = await pool.query("DELETE FROM token WHERE user_id = $1;", [
      user_id,
    ]);
    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    if (error) {
      if (process.env.NODE_ENV === "development") {
        return res.status(500).json({ msg: error.message, stack: error.stack });
      } else {
        return res.status(500).json({ msg: "Error occurred!" });
      }
    }
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
}

module.exports.app = app;
