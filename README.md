# Jwellery Shop (Vite + React)

Lightweight demo e-commerce app with two routes: Customer and Admin. Uses localStorage as a simple backend.

Features
- Customer header (search, categories, icons) styled like example screenshot.
- Customer: browse by category, search, select items, register name/phone/address, place order (QR placeholder).
- Admin: login using user `admin` and password `admin`. CRUD products (upload image as base64), view orders, sales by category.

Run
1. cd into project
2. npm install
3. npm run dev

Notes
- Replace images in `/src/assets` with real images. Current code expects `/assets/bangles.jpg`, `/assets/earrings.jpg`, `/assets/mangalsutra.jpg`, `/assets/pendant.jpg`, and `/assets/logo.png`.
- Data is persisted in localStorage under key `jwellery_db_v1`.
