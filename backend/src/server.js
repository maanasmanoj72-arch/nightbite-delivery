const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

const restaurants = [
  { id: 'r1', name: 'The Burger Lab', cuisine: 'Burgers', rating: 4.8, time: '20–30 min', fee: 25, price: '₹₹', image: 'https://images.unsplash.com/photo-155 burger' .replace(' ', ''), featured: true, description: 'Smash burgers, loaded fries and big flavour.' },
  { id: 'r2', name: 'Casa Italia', cuisine: 'Italian', rating: 4.7, time: '25–35 min', fee: 30, price: '₹₹₹', image: 'https://images.unsplash.com/photo- pasta' .replace(' ', ''), featured: true, description: 'Hand-tossed pizzas and comforting pasta.' },
  { id: 'r3', name: 'Wok & Roll', cuisine: 'Asian', rating: 4.6, time: '20–30 min', fee: 20, price: '₹₹', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d', featured: false, description: 'Street-style Asian bowls, noodles and more.' },
  { id: 'r4', name: 'Curry Culture', cuisine: 'Indian', rating: 4.9, time: '30–40 min', fee: 25, price: '₹₹', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe', featured: true, description: 'Aromatic biryanis and North Indian classics.' },
  { id: 'r5', name: 'Green Theory', cuisine: 'Healthy', rating: 4.5, time: '15–25 min', fee: 15, price: '₹₹', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', featured: false, description: 'Fresh salads, nourishing bowls and smoothies.' },
  { id: 'r6', name: 'Sweet Tooth', cuisine: 'Desserts', rating: 4.7, time: '15–25 min', fee: 15, price: '₹', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', featured: false, description: 'Desserts, waffles and irresistible treats.' }
];
// Keep image URLs valid and editable in one place.
restaurants[0].image = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85';
restaurants[1].image = 'https://images.unsplash.com/photo- pasta'.replace(' ', '');
restaurants[1].image = 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=85';
restaurants[2].image = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&q=85';
restaurants[3].image = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=85';
restaurants[4].image = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=85';
restaurants[5].image = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&q=85';

const menus = {
  r1: [
    { id:'b1', name:'Classic Smash', description:'Double smashed beef-style patty, cheddar, pickles and house sauce.', price:249, category:'Burgers', image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', tag:'Bestseller' },
    { id:'b2', name:'Truffle Mushroom', description:'Mushrooms, Swiss cheese, caramelised onion and truffle mayo.', price:289, category:'Burgers', image:'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=500&q=80' },
    { id:'b3', name:'Loaded Fries', description:'Crispy fries topped with cheese sauce and herbs.', price:149, category:'Sides', image:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80' }
  ],
  r2: [
    { id:'p1', name:'Margherita Pizza', description:'Tomato, mozzarella, basil and olive oil.', price:299, category:'Pizza', image:'https://images.unsplash.com/photo-157 pizza'.replace(' ', '') },
    { id:'p2', name:'Creamy Pesto Pasta', description:'Penne tossed in basil pesto and parmesan.', price:279, category:'Pasta', image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80', tag:'Popular' },
    { id:'p3', name:'Garlic Bread', description:'Toasted bread with garlic butter and herbs.', price:119, category:'Sides', image:'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80' }
  ],
  r3: [
    { id:'a1', name:'Chilli Garlic Noodles', description:'Wok-tossed noodles with crunchy vegetables.', price:219, category:'Noodles', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80' },
    { id:'a2', name:'Crispy Veg Momos', description:'Golden dumplings served with spicy dip.', price:169, category:'Starters', image:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80' },
    { id:'a3', name:'Teriyaki Rice Bowl', description:'Steamed rice, vegetables and savoury teriyaki glaze.', price:249, category:'Rice', image:'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80' }
  ],
  r4: [
    { id:'i1', name:'Chicken Dum Biryani', description:'Fragrant basmati rice layered with rich dum masala.', price:279, category:'Biryani', image:'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80', tag:'Bestseller' },
    { id:'i2', name:'Paneer Butter Masala', description:'Soft paneer in a creamy tomato and butter gravy.', price:249, category:'Mains', image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80' },
    { id:'i3', name:'Butter Naan', description:'Soft tandoor-baked naan brushed with butter.', price:49, category:'Sides', image:'https://images.unsplash.com/photo-1600628422019-6c9b7b7b6d1f?w=500&q=80' }
  ],
  r5: [
    { id:'h1', name:'Avocado Power Bowl', description:'Avocado, quinoa, greens and citrus dressing.', price:289, category:'Bowls', image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80' },
    { id:'h2', name:'Rainbow Salad', description:'Seasonal vegetables, seeds and house vinaigrette.', price:199, category:'Salads', image:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80' },
    { id:'h3', name:'Berry Smoothie', description:'Mixed berries blended with yoghurt.', price:149, category:'Drinks', image:'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&q=80' }
  ],
  r6: [
    { id:'d1', name:'Chocolate Lava Cake', description:'Warm chocolate cake with a molten centre.', price:159, category:'Cakes', image:'https://images.unsplash.com/photo-160 chocolate'.replace(' ', '') },
    { id:'d2', name:'Belgian Waffle', description:'Golden waffle with chocolate drizzle.', price:189, category:'Waffles', image:'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80' },
    { id:'d3', name:'Classic Cheesecake', description:'Creamy baked cheesecake with berry compote.', price:179, category:'Cakes', image:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80' }
  ]
};
menus.r2[0].image = 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80';
menus.r6[0].image = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); }
  catch { return []; }
}
function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

app.get('/api/health', (_req, res) => res.json({ status:'ok', message:'NightBite API is running' }));
app.get('/api/restaurants', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const cuisine = String(req.query.cuisine || 'All');
  const result = restaurants.filter(r =>
    (cuisine === 'All' || r.cuisine === cuisine) &&
    (!q || `${r.name} ${r.cuisine} ${r.description}`.toLowerCase().includes(q))
  );
  res.json({ success:true, data:result });
});
app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) return res.status(404).json({ success:false, message:'Restaurant not found' });
  res.json({ success:true, data:restaurant });
});
app.get('/api/restaurants/:id/menu', (req, res) => {
  if (!restaurants.some(r => r.id === req.params.id)) return res.status(404).json({ success:false, message:'Restaurant not found' });
  res.json({ success:true, data:menus[req.params.id] || [] });
});
app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer || !customer.name || !customer.phone || !customer.address || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ success:false, message:'Please provide customer details and at least one item.' });
  }
  const cleanItems = [];
  for (const item of items) {
    const restaurantMenu = menus[item.restaurantId] || [];
    const product = restaurantMenu.find(p => p.id === item.id);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ success:false, message:'One or more cart items are invalid.' });
    }
    cleanItems.push({ id:product.id, name:product.name, price:product.price, quantity, restaurantId:item.restaurantId, restaurantName:restaurants.find(r=>r.id===item.restaurantId).name });
  }
  const subtotal = cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 30;
  const order = {
    id: crypto.randomUUID(), orderNumber: `NB${Date.now().toString().slice(-7)}`,
    customer: { name:String(customer.name).trim(), phone:String(customer.phone).trim(), address:String(customer.address).trim() },
    items:cleanItems, subtotal, deliveryFee, total:subtotal+deliveryFee,
    status:'Confirmed', createdAt:new Date().toISOString()
  };
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  res.status(201).json({ success:true, message:'Your order has been placed!', data:order });
});
app.get('/api/orders/:id', (req, res) => {
  const order = readOrders().find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) return res.status(404).json({ success:false, message:'Order not found' });
  res.json({ success:true, data:order });
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success:false, message:'Something went wrong on the server.' });
});
app.listen(PORT, () => console.log(`NightBite API running at http://localhost:${PORT}`));
