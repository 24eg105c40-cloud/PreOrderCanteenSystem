import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Search, Clock3, Leaf, Coffee, Utensils, RefreshCw, CheckCircle2, ClipboardList, Plus, X, ChefHat } from 'lucide-react'

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')
const fallbackFoods = [
  { id: 1, name: 'Masala Dosa', description: 'Crispy dosa with potato masala and chutneys', price: 65, available: true, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80' },
  { id: 2, name: 'Veg Fried Rice', description: 'Wok-tossed rice, garden vegetables and herbs', price: 90, available: true, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80' },
  { id: 3, name: 'Paneer Wrap', description: 'Spiced paneer, fresh greens and mint sauce', price: 85, available: true, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80' },
  { id: 4, name: 'Veg Sandwich', description: 'Toasted sandwich with cheese and crunchy veggies', price: 55, available: true, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80' },
  { id: 5, name: 'Cold Coffee', description: 'Chilled creamy coffee, made fresh', price: 45, available: true, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80' },
  { id: 6, name: 'Idli Sambar', description: 'Soft steamed idlis with hot sambar', price: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80' }
]
const money = n => `₹${Number(n || 0).toFixed(2)}`
const localMinDateTime = () => { const d = new Date(Date.now() + 30 * 60000); d.setMinutes(Math.ceil(d.getMinutes()/15)*15, 0, 0); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16) }

export default function App() {
  const [foods, setFoods] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [tab, setTab] = useState('menu')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [customer, setCustomer] = useState({ name: '', phone: '', pickupTime: localMinDateTime() })
  const [showCheckout, setShowCheckout] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [newFood, setNewFood] = useState({ name: '', description: '', price: '', imageUrl: '', available: true })

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try { const data = await response.json(); message = data.message || data.detail || message } catch {}
      throw new Error(message)
    }
    if (response.status === 204) return null
    return response.json()
  }
  async function loadFoods() {
    setLoading(true)
    try {
      const data = await request('/foods')
      setFoods(data); setApiOnline(true)
    } catch {
      setFoods(fallbackFoods); setApiOnline(false)
    } finally { setLoading(false) }
  }
  async function loadOrders() {
    try { const data = await request('/orders'); setOrders(data); setApiOnline(true) }
    catch { setNotice('Start the Spring Boot backend to load live orders.') }
  }
  useEffect(() => { loadFoods() }, [])
  useEffect(() => { if (tab === 'orders') loadOrders() }, [tab])

  const visibleFoods = useMemo(() => foods.filter(f => f.available !== false && `${f.name} ${f.description || ''}`.toLowerCase().includes(search.toLowerCase())), [foods, search])
  const cartItems = foods.filter(f => cart[f.id]).map(f => ({ ...f, quantity: cart[f.id] }))
  const cartCount = cartItems.reduce((n, item) => n + item.quantity, 0)
  const total = cartItems.reduce((n, item) => n + Number(item.price) * item.quantity, 0)
  const updateQty = (id, delta) => setCart(prev => { const next = { ...prev }; const amount = (next[id] || 0) + delta; if (amount <= 0) delete next[id]; else next[id] = Math.min(amount, 50); return next })

  async function placeOrder(event) {
    event.preventDefault()
    if (!cartItems.length) return
    if (!apiOnline) { setNotice('The backend is offline. Start Spring Boot first, then refresh the menu.'); return }
    try {
      for (const item of cartItems) {
        await request('/orders', { method: 'POST', body: JSON.stringify({ customerName: customer.name, customerPhone: customer.phone, foodItemId: item.id, quantity: item.quantity, pickupTime: customer.pickupTime }) })
      }
      setCart({}); setShowCheckout(false); setNotice('Order placed! Your canteen order is confirmed.'); setTab('orders'); await loadOrders()
    } catch (e) { setNotice(e.message || 'Could not place order. Please try again.') }
  }
  async function addFood(event) {
    event.preventDefault()
    try {
      const food = await request('/foods', { method: 'POST', body: JSON.stringify({ ...newFood, price: Number(newFood.price), imageUrl: newFood.imageUrl || null, available: true }) })
      setFoods(prev => [...prev, food]); setShowAddFood(false); setNewFood({ name: '', description: '', price: '', imageUrl: '', available: true }); setNotice('Food item added successfully.')
    } catch (e) { setNotice(`Could not add item: ${e.message}. Is the backend running?`) }
  }
  async function updateStatus(order, status) {
    try { await request(`/orders/${order.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); await loadOrders(); setNotice(`Order #${order.id} updated to ${status}.`) }
    catch (e) { setNotice(e.message) }
  }
  async function deleteFood(food) {
    if (!window.confirm(`Delete ${food.name} from the menu?`)) return
    try { await request(`/foods/${food.id}`, { method: 'DELETE' }); setFoods(prev => prev.filter(f => f.id !== food.id)); setNotice('Food item deleted.') }
    catch (e) { setNotice(`Could not delete: ${e.message}`) }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e => {e.preventDefault(); setTab('menu')}}><span className="brand-icon"><ChefHat size={23}/></span><span>campus<span className="brand-light">bite</span><small>CANTEEN PRE-ORDER</small></span></a>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${tab==='menu'?'active':''}`} onClick={() => setTab('menu')}><Utensils size={18}/> Food menu <span className="nav-arrow">›</span></button>
      <button className={`nav-item ${tab==='orders'?'active':''}`} onClick={() => setTab('orders')}><ClipboardList size={18}/> My orders</button>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Clock3 size={18}/></span><b>Skip the queue.</b><p>Order ahead and pick up fresh.</p></div><div className="status-line"><span className={`status-dot ${apiOnline?'online':''}`}></span>{apiOnline?'Backend connected':'Demo menu mode'}</div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><ChefHat size={22}/> campus<span>bite</span></div><div className="breadcrumb">Campus canteen <span>/</span> {tab==='menu'?'Food menu':'Order history'}</div><div className="top-actions"><span className="open-pill"><i/> Canteen open</span><button className="cart-top" onClick={() => setShowCheckout(true)}><ShoppingBag size={18}/><span>Cart</span><b>{cartCount}</b></button></div></header>
      <div className="content">
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
        {tab==='menu' ? <>
          <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR CAMPUS, YOUR CRAVINGS</div><h1>Good food.<br/><em>Zero waiting.</em></h1><p>Beat the lunch rush. Pre-order your favourites and pick them up fresh, right on time.</p><div className="hero-features"><span><Clock3 size={16}/> Ready when you are</span><span><Leaf size={16}/> Made fresh daily</span></div></div><div className="hero-art"><div className="hero-circle"></div><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85" alt="Fresh colourful meal"/><div className="floating-note"><span className="note-icon"><CheckCircle2 size={18}/></span><span><b>Order ahead</b><small>More time for you</small></span></div><div className="hero-number">01 <span>/ FRESH PICKS</span></div></div></section>
          <section className="menu-section"><div className="section-head"><div><div className="eyebrow dark">MADE FOR YOUR BREAK</div><h2>Today's menu<span>.</span></h2><p>Freshly prepared, campus-approved.</p></div><button className="outline-btn" onClick={() => setShowAddFood(true)}><Plus size={16}/> Add food</button></div>
            <div className="menu-tools"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your favourites..."/>{search&&<button onClick={()=>setSearch('')}><X size={15}/></button>}</div><div className="menu-caption"><span className="tiny-dot"/>{visibleFoods.length} ITEMS AVAILABLE <button onClick={loadFoods} title="Refresh menu"><RefreshCw size={14}/></button></div></div>
            {loading ? <div className="empty-state">Loading today's menu…</div> : <div className="food-grid">{visibleFoods.map((food, i)=><article className="food-card" key={food.id}><div className="food-photo"><img src={food.imageUrl || fallbackFoods[i%fallbackFoods.length].imageUrl} alt={food.name} onError={e=>{e.currentTarget.src=fallbackFoods[i%fallbackFoods.length].imageUrl}}/><span className="veg-tag"><Leaf size={12}/> VEG</span><button className="delete-food" title="Delete food" onClick={()=>deleteFood(food)}><X size={15}/></button></div><div className="food-info"><div className="food-meta"><span>CHEF'S PICK</span><span><Clock3 size={12}/> 10–15 MIN</span></div><h3>{food.name}</h3><p>{food.description || 'Freshly prepared and ready to enjoy.'}</p><div className="food-bottom"><b>{money(food.price)}</b><div className="quantity">{cart[food.id] ? <><button onClick={()=>updateQty(food.id,-1)} aria-label="Decrease quantity">−</button><span>{cart[food.id]}</span><button onClick={()=>updateQty(food.id,1)} aria-label="Increase quantity">+</button></> : <button className="add-btn" onClick={()=>updateQty(food.id,1)}><Plus size={16}/> Add</button>}</div></div></div></article>)}</div>}
            {!visibleFoods.length&&!loading&&<div className="empty-state">No food items match that search.</div>}
          </section>
        </> : <section className="orders-section"><div className="eyebrow dark">YOUR FOOD, YOUR TIME</div><h2>Order history<span>.</span></h2><p className="orders-intro">Keep track of your canteen pre-orders.</p><button className="outline-btn refresh-orders" onClick={loadOrders}><RefreshCw size={15}/> Refresh orders</button>{orders.length===0?<div className="empty-state"><ClipboardList size={30}/><h3>No orders yet</h3><p>Your placed orders will show up here.</p><button className="primary-btn" onClick={()=>setTab('menu')}>Explore menu</button></div>:<div className="orders-list">{orders.slice().reverse().map(order=><article className="order-card" key={order.id}><div className="order-title"><div><small>ORDER #{order.id}</small><h3>{order.foodItem?.name || 'Food item'} × {order.quantity}</h3><p>{order.customerName} · Pickup {String(order.pickupTime||'').replace('T',' ')}</p></div><b>{money(order.totalPrice)}</b></div><div className="order-footer"><span className={`status status-${String(order.status).toLowerCase()}`}>{order.status}</span><label>Update status <select value={order.status} onChange={e=>updateStatus(order,e.target.value)}><option>PLACED</option><option>PREPARING</option><option>READY</option><option>COLLECTED</option><option>CANCELLED</option></select></label></div></article>)}</div>}</section>}
        <footer><span>© 2026 CampusBite</span><span>FRESH FOOD · SMARTER BREAKS</span></footer>
      </div>
    </main>
    {showCheckout&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCheckout(false)}}><div className="modal"><div className="modal-head"><div><span className="eyebrow dark">ALMOST THERE</span><h2>Your order<span>.</span></h2></div><button className="close-btn" onClick={()=>setShowCheckout(false)}><X/></button></div>{!cartItems.length?<div className="empty-state"><ShoppingBag size={28}/><p>Your cart is empty. Add something tasty first.</p><button className="primary-btn" onClick={()=>setShowCheckout(false)}>Browse menu</button></div>:<><div className="checkout-items">{cartItems.map(item=><div className="checkout-item" key={item.id}><div><b>{item.name}</b><small>{item.quantity} × {money(item.price)}</small></div><strong>{money(item.quantity*item.price)}</strong></div>)}</div><div className="checkout-total"><span>Total</span><b>{money(total)}</b></div><form className="checkout-form" onSubmit={placeOrder}><label>Your name<input required maxLength="100" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Enter your full name"/></label><label>Phone number<input required pattern="[0-9+ -]{7,30}" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="Enter phone number"/></label><label>Pickup time<input type="datetime-local" required min={localMinDateTime()} value={customer.pickupTime} onChange={e=>setCustomer({...customer,pickupTime:e.target.value})}/></label><button className="primary-btn full-btn" type="submit">Place pre-order · {money(total)}</button>{!apiOnline&&<small className="warning-text">Connect the backend to submit a real order.</small>}</form></>}</div></div>}
    {showAddFood&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAddFood(false)}}><div className="modal"><div className="modal-head"><div><span className="eyebrow dark">MENU MANAGEMENT</span><h2>Add food<span>.</span></h2></div><button className="close-btn" onClick={()=>setShowAddFood(false)}><X/></button></div><form className="checkout-form" onSubmit={addFood}><label>Food name<input required maxLength="100" value={newFood.name} onChange={e=>setNewFood({...newFood,name:e.target.value})} placeholder="e.g. Veg Biryani"/></label><label>Description<input value={newFood.description} onChange={e=>setNewFood({...newFood,description:e.target.value})} placeholder="Short description"/></label><label>Price (₹)<input type="number" required min="0.01" step="0.01" value={newFood.price} onChange={e=>setNewFood({...newFood,price:e.target.value})} placeholder="80"/></label><label>Image URL (optional)<input type="url" value={newFood.imageUrl} onChange={e=>setNewFood({...newFood,imageUrl:e.target.value})} placeholder="https://..."/></label><button className="primary-btn full-btn" type="submit">Save food item</button></form></div></div>}
  </div>
}
