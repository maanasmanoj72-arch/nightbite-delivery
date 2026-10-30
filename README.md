# NightBite — Food Delivery App

A full-stack food delivery demo with **separate `frontend/` and `backend/` folders**.

## Requirements
- Node.js 18+
- Two terminals in VS Code

## 1. Start the backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

## 2. Start the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Included functionality
- Restaurant browsing, cuisine filters, and search
- Restaurant menus loaded from the backend
- Add/remove items, quantity updates, and cart totals
- Checkout form with validation
- Orders created through the API and persisted to `backend/data/orders.json`
- Backend health, restaurant, menu, and order endpoints

## API endpoints
- `GET /api/health`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/menu`
- `POST /api/orders`
- `GET /api/orders/:id`

This is a learning/demo project. It does not process real payments or connect to live restaurants.
