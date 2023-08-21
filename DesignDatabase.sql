CREATE TABLE users(
   id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
   firstName varchar,
   lastName varchar,
   email varchar UNIQUE,
   username varchar UNIQUE,
   passwordHashed varchar

);

CREATE TABLE orders(
   id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
   user_id uuid REFERENCES users(id)

);

CREATE TABLE carts(
   id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
   user_id uuid REFERENCES users(id)

);

CREATE TABLE products(
   id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
   productName varchar UNIQUE,
   productDescription varchar,
   color varchar,
   quantityAvailable integer


);

CREATE TABLE users_orders(
    user_id uuid REFERENCES users(id),
    order_id uuid REFERENCES orders(id),
    product_id uuid REFERENCES products(id),
    PRIMARY KEY (user_id, order_id, product_id),
    product_quantity integer

);

CREATE TABLE users_carts(
    user_id uuid REFERENCES users(id),
    cart_id uuid REFERENCES carts(id),
    product_id uuid REFERENCES products(id),
    PRIMARY KEY (user_id, cart_id, product_id),
    product_quantity integer

);