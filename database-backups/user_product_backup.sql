--
-- PostgreSQL database dump (User & Product Service)
--

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: user_product_admin
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    img character varying
);


ALTER TABLE public.categories OWNER TO user_product_admin; -- Đã đổi owner

--
-- Name: products; Type: TABLE; Schema: public; Owner: user_product_admin
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "categoryId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    img character varying
);


ALTER TABLE public.products OWNER TO user_product_admin; -- Đã đổi owner

--
-- Name: users; Type: TABLE; Schema: public; Owner: user_product_admin
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "firstName" character varying,
    "lastName" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO user_product_admin; -- Đã đổi owner

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: user_product_admin
--

COPY public.categories (id, name, description, "createdAt", "updatedAt", img) FROM stdin;
763ec452-4e65-41dc-81b6-202326fb3c62	Áo	Các loại áo khoác, áo sơ mi,..	2025-04-28 07:01:57.275333	2025-04-28 07:01:57.275333	http://localhost:5173/src/assets/images/categories/ao.jpg
7a7541f7-84cc-4ec2-93f4-726fc70faef5	Quần 	Các loại quần nam nữ	2025-05-07 18:14:26.957203	2025-05-07 18:14:26.957203	http://localhost:5173/src/assets/images/categories/quan.jpg
b8d1c381-24d9-460b-93ca-781bdcfac3e9	Váy	Váy ngắn, dài cho nữ	2025-05-04 06:17:21.265044	2025-05-04 06:17:21.265044	http://localhost:5173/src/assets/images/categories/vay.jpg
e40f8d99-7bed-4f78-ac5f-27d3190505b2	Phụ Kiện	Các loại phụ kiến quý phái và sang trọng	2025-05-07 18:14:26.957203	2025-05-07 18:14:26.957203	http://localhost:5173/src/assets/images/categories/phukien.jpg
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: user_product_admin
--

COPY public.products (id, name, description, price, "stockQuantity", "categoryId", "createdAt", "updatedAt", img) FROM stdin;
c59b9f2f-dccc-4344-8139-ff3e1a50b636	Áo Khoác Bomber Nam	Áo khoác bomber phong cách thời trang	399000.00	43	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-08 00:17:40.236205	2025-05-10 01:20:29.726502	https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-loxc0qdd89nb2c.webp
a3c738bb-80d5-4bb6-9f46-afcbf3e2d37e	Quần Jeans Slimfit Xanh	Quần jeans nam ống côn, màu xanh wash	450000.00	100	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-04 06:20:16.199518	2025-05-04 06:20:16.199518	https://down-vn.img.susercontent.com/file/687ad3657fc30faa7c287025b87d843c@resize_w900_nl.webp
f57b8f15-a15f-49b7-979e-cb6595714d12	Áo Thun Basic	Áo thun cotton 100% form rộng	150000.00	99	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-07 18:14:29.150796	2025-05-10 00:36:08.325358	https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m5y1wp2p0md28b.webp
7981b901-46ad-49a2-a1d7-d2b820918b6c	Áo Khoác Dù Nữ	Áo khoác dù nữ form rộng	289000.00	37	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-08 00:17:40.236205	2025-05-10 02:03:14.463848	https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-loxc0qdd9o7r1b.webp
5059052c-f244-4a96-b047-313f1f7b88e1	Quần cạp liền	Quần cạp liền	250000.00	80	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-07 18:14:29.150796	2025-05-07 18:14:29.150796	http://localhost:5173/src/assets/images/products/quan1.jpg
fe76d546-add7-410a-8909-e771e59b3e6e	Chân váy đổ 2 tầng đan dây	Chân váy đổ 2 tầng đan dây siêu đẹp	450000.00	100	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-12 00:15:28.610109	2025-05-12 00:15:28.610109	http://localhost:5173/src/assets/images/products/vay1.jpg
f469705a-cb61-489c-a9f4-7a09a22deef9	Túi tote. Freesize	Túi tote. Freesize	460000.00	100	e40f8d99-7bed-4f78-ac5f-27d3190505b2	2025-05-12 00:43:47.180525	2025-05-12 00:43:47.180525	http://localhost:5173/src/assets/images/products/phukien1.jpg
86ab3956-95e3-41ba-8790-6ae263a74742	Áo Khoác Cardigan	Áo cardigan len dày dặn	359000.00	44	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-08 00:17:40.236205	2025-05-10 02:03:29.409731	https://down-vn.img.susercontent.com/file/vn-11134201-7r98o-lvyq6xe1cfqt19.webp
875ff59b-149d-4cbf-a012-e3cddae5a0d1	Áo Khoác Jean Nam	Áo khoác jean nam form rộng	450000.00	28	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-07 18:14:26.898859	2025-05-10 02:11:36.067699	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-loqaeymwmpn4e6.webp
cb5d4813-97de-447f-b9b0-b2dece7d226b	Áo Khoác Dù 3 Lớp	Chống nước cực tốt	260000.00	95	763ec452-4e65-41dc-81b6-202326fb3c62	2025-04-28 07:33:38.398371	2025-05-10 02:24:58.775049	https://down-vn.img.susercontent.com/file/f92af179125ccc6387638efad4231020.webp
20aa660c-c8fa-4005-8467-3cbd79c6def2	Áo Khoác Dù 2 Lớp Unisex	Áo khoác dù 2 lớp nam nữ	299000.00	58	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-08 00:17:40.236205	2025-05-11 03:38:40.091396	https://down-vn.img.susercontent.com/file/fd92e107591a638945a20a1dc617fd9d.webp
9ebc7eeb-26a4-46ec-ab79-951da670c059	Túi unisex	Túi unisex	460000.00	100	e40f8d99-7bed-4f78-ac5f-27d3190505b2	2025-05-12 00:45:47.819448	2025-05-12 00:45:47.819448	http://localhost:5173/src/assets/images/products/phukien2.jpg
cd0e3651-3d3f-4f57-b3de-76bf38b6b7c2	Túi tote coffee lover	Túi tote coffee lover	200000.00	100	e40f8d99-7bed-4f78-ac5f-27d3190505b2	2025-05-12 00:47:30.039828	2025-05-12 00:47:30.039828	http://localhost:5173/src/assets/images/products/phukien3.jpg
77c7747f-30b0-41ab-b18a-36cf8be949a8	Túi tote xếp ly unisex	Túi tote xếp ly unisex	200000.00	100	e40f8d99-7bed-4f78-ac5f-27d3190505b2	2025-05-12 00:48:13.915359	2025-05-12 00:48:13.915359	http://localhost:5173/src/assets/images/products/phukien4.jpg
5193425f-9dd2-4206-a889-e6eecee98f4b	Túi bán nguyệt nữ	Túi bán nguyệt nữ	260000.00	100	e40f8d99-7bed-4f78-ac5f-27d3190505b2	2025-05-12 00:49:04.608709	2025-05-12 00:49:04.608709	http://localhost:5173/src/assets/images/products/phukien5.jpg
147c9985-0a34-4eee-bc3e-3107786df014	Chân váy may	Chân váy may	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:24:47.001229	2025-05-12 00:24:47.001229	http://localhost:5173/src/assets/images/products/vay3.jpg
04d247e5-94e8-49da-bce7-fd2472ec80ec	Quần Jean Baggy	Quần jean baggy ống rộng	420000.00	45	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-07 18:14:26.898859	2025-05-07 18:14:26.898859	https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m3wze86ls2id45.webphttps://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m3wze86ls2id45.webp
4ad34712-cd92-43ab-98dc-5aa1ced12166	Áo Khoác Dù 2 Lớp	Chống nước nhẹ, có lớp lót lưới	265000.00	92	763ec452-4e65-41dc-81b6-202326fb3c62	2025-04-28 07:03:29.20529	2025-05-10 00:26:04.279971	https://down-vn.img.susercontent.com/file/84fd0ff747f14ce3b32d4ed1b23b9a3a.webp
0cd36088-ce10-4cce-a9ab-c0b1072a9cb7	Áo Khoác Jean Nam	Áo khoác jean nam cổ điển	450000.00	29	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-08 00:17:40.236205	2025-05-10 00:26:33.605902	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-loqaeymwmpn4e6.webp
d9b48e9c-7c3f-4ff4-bb91-98295024c157	Áo Khoác Cardigan	Áo cardigan len dệt kim	355000.00	39	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-07 18:14:26.898859	2025-05-10 00:46:31.490568	https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m5y1wm2rekpj90.webp
15724ed9-a041-4210-9383-16beb34ea426	Quần Jean Straight	Quần jean ống đứng basic	399000.00	40	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-07 18:14:26.898859	2025-05-07 18:14:26.898859	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvk4i715zifwfc.webp
303cc3b3-9157-46b4-a901-90c185b26361	Áo Khoác Bomber Nữ	Áo khoác bomber phong cách Hàn Quốc	299000.00	47	763ec452-4e65-41dc-81b6-202326fb3c62	2025-05-07 18:14:26.898859	2025-05-10 01:02:50.742467	https://down-vn.img.susercontent.com/file/a3989255d673b18b372bd61a4299482e.webp
5be0aa4d-3148-4d87-988c-bb767049d4c8	Quần Jean Skinny	Quần jean skinny co giãn	380000.00	35	7a7541f7-84cc-4ec2-93f4-726fc70faef5	2025-05-07 18:14:26.898859	2025-05-07 18:14:26.898859	https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lvk4i7163q589f.webp
f8de92fa-c68c-45b5-b898-cc66d26b6444	Váy trắng dáng sơ mi	Váy trắng dáng sơ mi	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:23:06.170983	2025-05-12 00:23:06.170983	http://localhost:5173/src/assets/images/products/vay2.jpg
4cf89bb2-8058-4437-a4d2-162be86ceb42	Đầm cổ tròn	Đầm cổ tròn	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:21:31.83334	2025-05-12 00:21:31.83334	http://localhost:5173/src/assets/images/products/vay4.jpg
00aea94b-6b58-4f7b-beb4-5ea28c9be3d7	Đầm cổ vuông 3 tầng đổ	Đầm cổ vuông 3 tầng đổ	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:32:22.881304	2025-05-12 00:32:22.881304	http://localhost:5173/src/assets/images/products/vay5.jpg
542097fa-46ce-44c6-bc59-918f81006652	Đầm cổ đức	Đầm cổ đức	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:32:58.659782	2025-05-12 00:32:58.659782	http://localhost:5173/src/assets/images/products/vay6.jpg
f1b51169-2f80-487b-bab6-7385414648a4	Đầm 2 dây chân	Đầm 2 dây chân	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:33:51.70666	2025-05-12 00:33:51.70666	http://localhost:5173/src/assets/images/products/vay7.jpg
d8bd98da-dd62-4610-8495-e9872f2f100f	Đầm dáng A	Đầm dáng A	460000.00	100	b8d1c381-24d9-460b-93ca-781bdcfac3e9	2025-05-12 00:34:56.464867	2025-05-12 00:34:56.464867	http://localhost:5173/src/assets/images/products/vay8.jpg
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user_product_admin
--

COPY public.users (id, email, password, "firstName", "lastName", "createdAt", "updatedAt") FROM stdin;
7f32faf3-d331-4305-b70d-3272239e6b52	testuser1@example.com	$2b$10$VLf7KXaSHc/xFOeTDe72puQFXXawm77XM62AwF0wjmNp62ieG2uFC	Test	UserOne	2025-04-26 01:01:30.188561	2025-04-26 01:01:30.188561
d839c3bd-3970-40f1-9582-650890e91574	testuser@example.com	$2b$10$1j.9RtToSWmDgD/RpWpR5OYJVm5BTfURPK9vQxoVhwvdwXL6T4Ohi	Test	User	2025-05-04 06:11:24.612322	2025-05-04 06:11:24.612322
7d2a0c93-de37-44ed-a84d-5c0c2ef9257c	na@gmail.com	$2b$10$xqd0tvJmCH70tyIrquu7PObZtu6jHimdhbg0dLFlP3XUvy.dKc55O	a	ng	2025-05-05 04:15:33.788257	2025-05-05 04:15:33.788257
b99983e8-8707-4de8-a77e-c22191381c86	na2@gmail.com	$2b$10$Wt7OZWDGZlnqOWWWLwBIjuQ/S7BD4FUa4kGHTnNT8ZboqCkqcEUHq	Ngoc 	Anh	2025-05-11 10:54:57.806879	2025-05-11 10:54:57.806879
\.


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: categories UQ_8b0be371d28245da6e4f4b61878; Type: CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: products FK_ff56834e735fa78a15d0cf21926; Type: FK CONSTRAINT; Schema: public; Owner: user_product_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--