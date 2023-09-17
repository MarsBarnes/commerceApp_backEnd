--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';


--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login (
    user_id uuid,
    username character varying,
    passwordhashed character varying
);


ALTER TABLE public.login OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    total money
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_name character varying,
    product_description character varying,
    color character varying,
    quantity_available integer,
    price money
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token (
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.token OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    firstname character varying,
    lastname character varying,
    email character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_carts (
    user_id uuid NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_quantity integer NOT NULL,
    price money NOT NULL
);


ALTER TABLE public.users_carts OWNER TO postgres;

--
-- Name: users_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_orders (
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_quantity integer
);


ALTER TABLE public.users_orders OWNER TO postgres;

--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id) FROM stdin;
2e12aa45-1d30-438a-b0dd-fa70576da7ff	c75cba50-bd7b-4270-b90d-717faeba97f8
7fa72335-34a1-4599-95cf-81ad3af83dba	da93a2d5-3d41-4c8b-b01d-a466affe431e
f9e8b95b-48df-49e9-aa88-a103f3d94f1a	35aad411-a569-452d-948a-35ccabe974ba
470c89ee-0aa9-44a7-a18c-9c7a9a41e3ea	f01fbc3a-17d4-4e3b-9f2c-f9bf8bd00842
428ba561-85ee-4d54-8e56-51563792c990	61c81eb5-6657-44cd-b92a-3d02cc4d4fc0
\.


--
-- Data for Name: login; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login (user_id, username, passwordhashed) FROM stdin;
c75cba50-bd7b-4270-b90d-717faeba97f8	a	$2b$10$iksJYmqXKv822BysRmPcRe/C0pPFBfBUbPsKURQ9gThVhEfZy0M3y
da93a2d5-3d41-4c8b-b01d-a466affe431e	d	$2b$10$9.Lf2wUf6Tsg/.7I58T20.FdyDNTxIaYPa.Gj.l6wjORnRWcu1PEG
35aad411-a569-452d-948a-35ccabe974ba	username	$2b$10$Mll9iWxzQJTMK4/.pRc8qOUJsX6SGkgtjdi88gV4HWNrfQlHj0Nau
f01fbc3a-17d4-4e3b-9f2c-f9bf8bd00842	q	$2b$10$V7WXW46akItQWkJlZl9aPuYM/Tcx80MTmQY9QliUfAB4MRHfA3WTu
61c81eb5-6657-44cd-b92a-3d02cc4d4fc0	billiesag	$2b$10$lEe.S6jWe7S8/Kd4hANG6uqb14RNqZVn.ClIjCyI3jOab8ZWjsEvW
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, created_at, total) FROM stdin;
c60c2da8-d5c4-4a9e-8eda-fa61ef9526f7	da93a2d5-3d41-4c8b-b01d-a466affe431e	2023-09-15 18:04:31.208525-04	$11.47
68b75f06-882b-4fd1-a275-c05b1bffd45c	35aad411-a569-452d-948a-35ccabe974ba	2023-09-15 19:14:43.597096-04	$8.48
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, product_name, product_description, color, quantity_available, price) FROM stdin;
8737e1a1-a4b2-48c6-a83c-76a1db8d25a1	Cool Cat Sticker	Adorable cat sticker with sunglasses	Blue	50	$2.99
8092156b-eb1c-4f71-b954-a7394e6d51ff	Space Explorer Sticker	Explore the universe with this space-themed sticker	Black	30	$3.49
36e6f064-444c-4550-a9af-4093456224b7	Rainbow Unicorn Sticker	Magical unicorn sticker with rainbow colors	Multi	20	$4.99
89c7a3ff-ac29-432b-887f-35fd70e7c732	Happy Bee Sticker	Spread positivity with this cute bee sticker	Yellow	40	$1.99
ad3c076a-aaa9-4de4-9f61-d444819fd183	Galactic Adventure Sticker	Embark on a galactic adventure with this sticker	Purple	25	$2.79
a50bf830-7445-4dc6-9a82-ed482362a3d8	Nature Lover Sticker	Celebrate nature with this scenic sticker	Green	35	$2.49
9028a9e5-5088-4e90-96a0-5a2b511ba437	Emoji Expressions Sticker Pack	Express yourself with a variety of emoji stickers	Multi	15	$5.99
373f793b-1443-48fc-968c-5742306b387f	Dinosaur Friends Sticker	Make friends with these adorable dinosaur stickers	Orange	50	$2.29
29f4cefb-f875-404a-b742-7eb6389748b8	Sweet Treats Sticker Set	Satisfy your sweet tooth with these dessert stickers	Pink	30	$3.99
4e42a81c-0f46-4e80-928f-fd51101954dc	Underwater World Sticker	Dive into the beauty of the underwater world	Blue	20	$4.49
643c9380-6b22-4cb0-91dd-c757c33d2d87	Cute Critters Sticker Pack	Collect cute critters from around the world	Multi	40	$1.99
c51678fe-6ea2-483f-9465-e42fbb1d7f43	Magical Fairy Sticker	Believe in magic with this enchanting fairy sticker	Purple	25	$2.79
20edea37-a342-4741-a82c-a34a6d504216	Adventure Awaits Sticker	Get ready for your next adventure with this sticker	Green	35	$2.49
986cea75-2558-47d2-81d8-a0d9f35f124c	Space Cats Sticker Pack	Combining space and cats for a unique sticker experience	Multi	15	$5.99
127c6f3d-bfca-4f4b-a705-2da512a45bee	Dino Land Sticker	Create your own dinosaur world with this sticker	Brown	50	$2.29
b071db9d-0cd2-43cf-ae9d-b58068444a1d	Fruit Friends Sticker Set	Adorable fruit characters to brighten up your day	Yellow	30	$3.99
51d4fc02-78b8-4642-acb9-ca1df978f4e5	Whimsical Woodland Sticker	Explore the whimsical wonders of the woodland	Green	20	$4.49
\.


--
-- Data for Name: token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.token (token, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, firstname, lastname, email) FROM stdin;
c75cba50-bd7b-4270-b90d-717faeba97f8	a	a	a@a
da93a2d5-3d41-4c8b-b01d-a466affe431e	d	d	d@d
35aad411-a569-452d-948a-35ccabe974ba	sdf	f	sdf@f
f01fbc3a-17d4-4e3b-9f2c-f9bf8bd00842	q	q	q@q
61c81eb5-6657-44cd-b92a-3d02cc4d4fc0	billiesag	billiesag	billiesag@billiesage
\.


--
-- Data for Name: users_carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_carts (user_id, cart_id, product_id, product_quantity, price) FROM stdin;
\.


--
-- Data for Name: users_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_orders (user_id, order_id, product_id, product_quantity) FROM stdin;
da93a2d5-3d41-4c8b-b01d-a466affe431e	c60c2da8-d5c4-4a9e-8eda-fa61ef9526f7	8092156b-eb1c-4f71-b954-a7394e6d51ff	1
da93a2d5-3d41-4c8b-b01d-a466affe431e	c60c2da8-d5c4-4a9e-8eda-fa61ef9526f7	36e6f064-444c-4550-a9af-4093456224b7	1
da93a2d5-3d41-4c8b-b01d-a466affe431e	c60c2da8-d5c4-4a9e-8eda-fa61ef9526f7	8737e1a1-a4b2-48c6-a83c-76a1db8d25a1	1
35aad411-a569-452d-948a-35ccabe974ba	68b75f06-882b-4fd1-a275-c05b1bffd45c	8092156b-eb1c-4f71-b954-a7394e6d51ff	1
35aad411-a569-452d-948a-35ccabe974ba	68b75f06-882b-4fd1-a275-c05b1bffd45c	36e6f064-444c-4550-a9af-4093456224b7	1
\.


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_productname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_productname_key UNIQUE (product_name);


--
-- Name: token token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (token);


--
-- Name: users_carts users_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_carts
    ADD CONSTRAINT users_carts_pkey PRIMARY KEY (user_id, cart_id, product_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_orders users_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_orders
    ADD CONSTRAINT users_orders_pkey PRIMARY KEY (user_id, order_id, product_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: login login_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: token token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users_carts users_carts_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_carts
    ADD CONSTRAINT users_carts_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- Name: users_carts users_carts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_carts
    ADD CONSTRAINT users_carts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: users_carts users_carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_carts
    ADD CONSTRAINT users_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users_orders users_orders_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_orders
    ADD CONSTRAINT users_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: users_orders users_orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_orders
    ADD CONSTRAINT users_orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: users_orders users_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_orders
    ADD CONSTRAINT users_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

