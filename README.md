# Anomaly detection exercise

## Set up Postgres
Connect to the DB and run these statement to create the table that holds the IPs:

```sql
--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2
-- Dumped by pg_dump version 11.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ip; Type: TABLE; Schema: public; Owner: me
--

CREATE TABLE public.ip (
    ip inet NOT NULL,
    source character varying,
    last_upd timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ip OWNER TO me;

--
-- Name: ip ip_pkey; Type: CONSTRAINT; Schema: public; Owner: me
--

ALTER TABLE ONLY public.ip
    ADD CONSTRAINT ip_pkey PRIMARY KEY (ip);


--
-- Name: idx_name; Type: INDEX; Schema: public; Owner: me
--

CREATE INDEX idx_name ON public.ip USING gist (ip inet_ops);


--
-- PostgreSQL database dump complete
--
```

## Query for an IP
1. Start Postgres: `brew services start postgresql`
2. Start Node: `node index.js`
3. Send a GET request to the endpoint `http://localhost:3000/IP`, specifying the IP. For example: `curl http://localhost:3000/IP/23.239.26.255`

## Sync IPs
1. To download the latest file run: `npm run clone`
2. To process the new files run: `npm run sync`
