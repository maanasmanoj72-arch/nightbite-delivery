import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, Bike, Check, ChefHat, ChevronDown, Clock3, Flame, Heart, MapPin, Minus, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Star, X, Menu as MenuIcon } from 'lucide-react';
import api from './api';

const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const cuisines = ['All','Burgers','Italian','Asian','Indian','Healthy','Desserts'];

export default function App() {
  const [restaurants,setRestaurants] = useState([]);
  const [activeCuisine,setActiveCuisine] = useState('All');
  const [search,setSearch] = useState('');
  const [cart,setCart] = useState([]);
  const [selected,setSelected] = useState(null);
  const [menu,setMenu] = useState([]);
  const [cartOpen,setCartOpen] = useState(false);
  const [checkout,setCheckout] = useState(false);
  const [customer,setCustomer] = useState({name:'',phone:'',address:''});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [toast,setToast] = useState('');
  const [placed,setPlaced] = useState(null);
  const [mobileNav,setMobileNav] = useState(false);

  async function loadRestaurants() {
    setLoading(true); setError('');
    try { const {data} = await api.get('/restaurants',{params:{q:search,cuisine:activeCuisine}}); setRestaurants(data.data); }
    catch { setError('Could not connect to the food server. Make sure the backend is running on port 5000.'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ const t=setTimeout(loadRestaurants,250); return ()=>clearTimeout(t); },[search,activeCuisine]);
  const subtotal = useMemo(()=>cart.reduce((s,i)=>s+i.price*i.quantity,0),[cart]);
  const totalQty = cart.reduce((s,i)=>s+i.quantity,0);
  const delivery = cart.length ? 30 : 0;
  const total = subtotal + delivery;
  function notify(message){ setToast(message); setTimeout(()=>setToast(''),2400); }
  async function openRestaurant(r){
    setSelected(r); setMenu([]);
    try { const {data}=await api.get(`/restaurants/${r.id}/menu`); setMenu(data.data); }
    catch { notify('Could not load menu. Please try again.'); }
  }
  function addItem(item,restaurant){
    setCart(old=>{
      const key = `${restaurant.id}-${item.id}`;
      const found = old.find(x=>x.key===key);
      if(found) return old.map(x=>x.key===key?{...x,quantity:x.quantity+1}:x);
      return [...old,{...item,key,restaurantId:restaurant.id,restaurantName:restaurant.name,quantity:1}];
    });
    notify(`${item.name} added to your bag`);
  }
  function changeQty(key,delta){ setCart(old=>old.map(i=>i.key===key?{...i,quantity:i.quantity+delta}:i).filter(i=>i.quantity>0)); }
  async function placeOrder(e){
    e.preventDefault();
    if(!/^[0-9+\-\s]{8,15}$/.test(customer.phone)){ notify('Enter a valid phone number'); return; }
    try {
      const payload={customer,items:cart.map(i=>({id:i.id,restaurantId:i.restaurantId,quantity:i.quantity}))};
      const {data}=await api.post('/orders',payload);
      setPlaced(data.data); setCart([]); setCheckout(false); setCartOpen(false); setCustomer({name:'',phone:'',address:''});
    } catch(err){ notify(err.response?.data?.message || 'Order failed. Please try again.'); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Flame size={22} fill="currentColor"/></span><span>NIGHT<span className="brand-accent">BITE</span><small>GOOD FOOD. NO WAIT.</small></span></a>
      <nav className={mobileNav?'nav-links open':'nav-links'}>
        <a href="#discover" onClick={()=>setMobileNav(false)}>Discover</a><a href="#how" onClick={()=>setMobileNav(false)}>How it works</a><a href="#footer" onClick={()=>setMobileNav(false)}>About</a>
      </nav>
      <div className="header-actions"><div className="delivery-location"><MapPin size={15}/><span>Delivering to <b>Your location</b></span><ChevronDown size={14}/></div><button className="cart-button" onClick={()=>setCartOpen(true)}><ShoppingBag size={18}/><span>My bag</span>{totalQty>0&&<i>{totalQty}</i>}</button><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><MenuIcon/></button></div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"></span> YOUR NEXT FAVOURITE MEAL IS HERE</div>
          <h1>Good food.<br/><em>Great mood.</em><br/>Delivered.</h1>
          <p>From midnight cravings to everyday favourites — the city's best bites are just a tap away.</p>
          <a className="primary-btn" href="#discover">Explore restaurants <ArrowUpRight size={18}/></a>
          <div className="hero-proof"><div className="avatar-stack"><span>👨🏽‍🍳</span><span>🥗</span><span>🍔</span></div><div><b>Made for food lovers</b><small>Fresh picks. Fast delivery. Always.</small></div></div>
        </div>
        <div className="hero-visual"><div className="hero-glow"></div><img className="hero-food" src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1100&q=90" alt="Juicy gourmet burger"/><div className="floating-card rating-card"><span className="rating-icon"><Star size={16} fill="currentColor"/></span><div><b>4.9 / 5</b><small>Foodies love us</small></div></div><div className="floating-card delivery-card"><span className="delivery-icon"><Bike size={19}/></span><div><b>Fast delivery</b><small>At your doorstep</small></div></div><div className="hero-sticker">FRESH<br/>& TASTY<span>✳</span></div></div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><div></div><span>01 — 06</span></div>
      </section>

      <section className="benefits" id="how"><div className="benefit"><span><Bike/></span><div><b>Quick delivery</b><small>Hot food, right on time</small></div></div><div className="benefit"><span><ChefHat/></span><div><b>Top local kitchens</b><small>Handpicked food spots</small></div></div><div className="benefit"><span><ShieldCheck/></span><div><b>Safe & secure</b><small>Simple, reliable ordering</small></div></div><div className="benefit"><span><Heart/></span><div><b>Made with love</b><small>Every bite counts</small></div></div></section>

      <section className="discover section-wrap" id="discover">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-dot"></span> THE GOOD STUFF</div><h2>Find your <em>craving.</em></h2><p>Good things are cooking around you.</p></div><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food or restaurants..."/>{search&&<button onClick={()=>setSearch('')}><X size={16}/></button>}</div></div>
        <div className="filter-row">{cuisines.map(c=><button key={c} className={activeCuisine===c?'filter active':'filter'} onClick={()=>setActiveCuisine(c)}>{c}</button>)}</div>
        <div className="results-line"><span>{loading?'Finding tasty places...':`${restaurants.length} places to make you happy`}</span><span className="sort-label">CURATED FOR YOU <Sparkles size={13}/></span></div>
        {error&&<div className="error-box">{error}<button onClick={loadRestaurants}>Retry</button></div>}
        {loading?<div className="loading-grid">{[1,2,3].map(x=><div className="skeleton" key={x}/>)}</div>:<div className="restaurant-grid">{restaurants.map((r,i)=><article className="restaurant-card" key={r.id} onClick={()=>openRestaurant(r)}><div className="restaurant-image"><img src={r.image} alt={r.name}/><span className="image-label">{r.featured?'NIGHTBITE PICK':'LOCAL FAVOURITE'}</span><button className="heart-btn" onClick={e=>{e.stopPropagation();notify('Saved to your favourites')}}><Heart size={17}/></button></div><div className="restaurant-info"><div className="restaurant-title"><h3>{r.name}</h3><span className="rating"><Star size={13} fill="currentColor"/> {r.rating}</span></div><p>{r.cuisine} <span>·</span> {r.price}</p><div className="restaurant-meta"><span><Clock3 size={14}/>{r.time}</span><span>Delivery {money(r.fee)}</span></div></div></article>)}</div>}
        {!loading&&!error&&restaurants.length===0&&<div className="empty-state"><span>🍽️</span><h3>No bites found</h3><p>Try another search or cuisine.</p></div>}
      </section>

      <section className="promo section-wrap"><div className="promo-content"><span className="promo-kicker">A LITTLE SOMETHING EXTRA</span><h2>Big cravings.<br/><em>Zero compromise.</em></h2><p>Discover your new go-to meal, made fresh by kitchens worth knowing.</p><a href="#discover">Find your next bite <ArrowRight size={17}/></a></div><div className="promo-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=85" alt="Fresh colourful food bowl"/><span>FRESH<br/>IS THE<br/>VIBE.</span></div></section>
    </main>
    <footer id="footer"><a className="brand" href="#"><span className="brand-mark"><Flame size={22} fill="currentColor"/></span><span>NIGHT<span className="brand-accent">BITE</span><small>GOOD FOOD. NO WAIT.</small></span></a><p>Good food has a way of making everything better.</p><span className="copyright">© 2026 NIGHTBITE. MADE FOR THE HUNGRY.</span></footer>

    {selected&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><div className="menu-modal"><button className="close-btn" onClick={()=>setSelected(null)}><X/></button><div className="menu-hero"><img src={selected.image} alt={selected.name}/><div><span className="eyebrow">TONIGHT'S GOOD PICK</span><h2>{selected.name}</h2><p>{selected.description}</p><div className="modal-meta"><span><Star size={14} fill="currentColor"/> {selected.rating}</span><span><Clock3 size={14}/> {selected.time}</span><span>{selected.cuisine}</span></div></div></div><div className="menu-list-heading"><div><h3>The menu</h3><p>Made fresh. Delivered with care.</p></div><span>ADD YOUR FAVOURITES</span></div><div className="menu-items">{menu.map(item=><div className="menu-item" key={item.id}><img src={item.image} alt={item.name}/><div className="menu-item-copy">{item.tag&&<span className="item-tag">{item.tag}</span>}<h4>{item.name}</h4><p>{item.description}</p><b>{money(item.price)}</b></div><button className="add-btn" onClick={()=>addItem(item,selected)}><Plus size={16}/> ADD</button></div>)}</div><button className="modal-cart-btn" onClick={()=>{setSelected(null);setCartOpen(true)}}>View bag · {totalQty} items <ArrowRight size={17}/></button></div></div>}

    {cartOpen&&<div className="overlay drawer-overlay" onMouseDown={e=>e.target===e.currentTarget&&setCartOpen(false)}><aside className="cart-drawer"><div className="drawer-head"><div><span className="eyebrow">YOUR ORDER</span><h2>{checkout?'Delivery details':'Your bag'} <span>({totalQty})</span></h2></div><button className="close-btn" onClick={()=>{setCartOpen(false);setCheckout(false)}}><X/></button></div>
      {!checkout?<>{cart.length===0?<div className="cart-empty"><span>🛍️</span><h3>Your bag is waiting</h3><p>Find something delicious and add it here.</p><button className="primary-btn" onClick={()=>setCartOpen(false)}>Explore food <ArrowRight size={16}/></button></div>:<><div className="cart-items">{cart.map(i=><div className="cart-row" key={i.key}><img src={i.image} alt={i.name}/><div className="cart-row-copy"><b>{i.name}</b><small>{i.restaurantName}</small><strong>{money(i.price*i.quantity)}</strong></div><div className="qty-control"><button onClick={()=>changeQty(i.key,-1)}><Minus size={13}/></button><span>{i.quantity}</span><button onClick={()=>changeQty(i.key,1)}><Plus size={13}/></button></div></div>)}</div><div className="bill"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery fee</span><b>{money(delivery)}</b></div><div className="bill-total"><span>Total</span><b>{money(total)}</b></div></div><button className="checkout-btn" onClick={()=>setCheckout(true)}>Continue to checkout <ArrowRight size={17}/></button><p className="secure-note"><ShieldCheck size={14}/> Safe and secure checkout</p></>}</>:<form className="checkout-form" onSubmit={placeOrder}><p className="form-intro">Where should we bring your delicious order?</p><label>Full name<input required minLength="2" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Your name"/></label><label>Phone number<input required value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="+91 98765 43210"/></label><label>Delivery address<textarea required minLength="8" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} placeholder="House no., street, area, landmark..." rows="3"/></label><div className="checkout-total"><span>Amount to pay on delivery</span><b>{money(total)}</b></div><button className="checkout-btn" type="submit">Place my order <ArrowRight size={17}/></button><button type="button" className="back-btn" onClick={()=>setCheckout(false)}>← Back to bag</button></form>}</aside></div>}

    {placed&&<div className="overlay"><div className="success-modal"><div className="success-icon"><Check size={34}/></div><span className="eyebrow">ORDER CONFIRMED</span><h2>You're in for a treat!</h2><p>Your order has been sent to the kitchen. Get ready for something delicious.</p><div className="order-number">ORDER ID <b>{placed.orderNumber}</b></div><div className="success-total"><span>Total · {placed.items.length} line items</span><b>{money(placed.total)}</b></div><button className="checkout-btn" onClick={()=>setPlaced(null)}>Back to NightBite</button></div></div>}
    {toast&&<div className="toast"><BadgeCheck size={17}/>{toast}</div>}
  </div>;
}
