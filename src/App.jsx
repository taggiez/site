import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const PRODUCTS = [
  { id:1, name:"no cap fr fr", category:"vibes", emoji:"🧢", price:8.99, badge:"🔥 trending", desc:"For when you're being 100% real. No lies detected.", bg:"#FFE135", tags:["meme","phrase"] },
  { id:2, name:"main character", category:"vibes", emoji:"⭐", price:8.99, badge:"new", desc:"Because every day is your origin story.", bg:"#FF3C78", tags:["meme","aesthetic"] },
  { id:3, name:"slay & serve", category:"vibes", emoji:"💅", price:8.99, badge:"🔥 trending", desc:"Look good. Feel good. Slay everything.", bg:"#9B5DE5", tags:["meme","aesthetic"] },
  { id:4, name:"NPC mode on", category:"gaming", emoji:"🤖", price:9.99, badge:"new", desc:"Sometimes you just gotta idle in the hallway.", bg:"#00C2FF", tags:["gaming","meme"] },
  { id:5, name:"POV: living rent-free", category:"vibes", emoji:"🧠", price:8.99, badge:null, desc:"When you can't stop thinking about it.", bg:"#B6FF4B", tags:["meme","phrase"] },
  { id:6, name:"skill issue 💀", category:"gaming", emoji:"💀", price:9.99, badge:"🔥 trending", desc:"The original tech support response.", bg:"#FF6B1A", tags:["gaming","meme"] },
  { id:7, name:"delulu is the solulu", category:"vibes", emoji:"🌸", price:8.99, badge:null, desc:"Manifest first, reality check later.", bg:"#FFB6C1", tags:["meme","phrase"] },
  { id:8, name:"rizz god", category:"collab", emoji:"✨", price:10.99, badge:"limited", desc:"Natural rizz can't be bought. This tag can.", bg:"#FFE135", tags:["meme","collab"] },
];

const CATEGORIES = ["all", "vibes", "gaming", "collab"];

// --- COMPONENTS ---

const ProductCard = ({ product, onAdd }) => (
  <div className="product-card">
    {product.badge && <div className={`product-badge ${product.badge.includes('new') ? 'new' : ''}`}>{product.badge}</div>}
    <div className="product-img-wrap" style={{ backgroundColor: product.bg }}>
      <div className="product-img-placeholder">{product.emoji}</div>
    </div>
    <div className="product-info">
      <div className="product-cat">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.desc}</p>
      <div className="product-footer">
        <span className="product-price"><sup>$</sup>{product.price}</span>
        <button className="add-to-cart-btn" onClick={() => onAdd(product)}>Add to Cart</button>
      </div>
    </div>
  </div>
);

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [toasts, setToasts] = useState([]);

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    addToast(`✅ ${product.name} added!`);
  };

  const filtered = category === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="app-container">
      {/* TOASTS */}
      <div className="toast-stack">
        {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">Tag<span>giez</span></a>
        <ul className="nav-links">
          <li><a href="#shop">Shop</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <button className="nav-cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>
      </nav>

      {/* HERO */}
      <header className="hero">
        <span className="hero-eyebrow">👧 Kid-designed • 🔥 Trend-native</span>
        <h1 className="hero-title">
          <span className="hl-yellow">Tags</span> That <br />
          <span className="hl-pink">Absolutely Slap</span>
        </h1>
        <p className="hero-subtitle">Meme-inspired embroidered tags for your backpack and gear.</p>
        <div className="hero-ctas">
          <a href="#shop" className="btn-primary">🛍️ Shop Tags</a>
        </div>
      </header>

      {/* SHOP */}
      <section className="section" id="shop">
        <div className="section-header">
          <span className="section-label">🛒 The Drop</span>
          <h2 className="section-title">Fresh Tags, <span className="hl">Just Dropped</span></h2>
        </div>
        <div className="product-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="products-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
        </div>
      </section>

      {/* CART OVERLAY */}
      {cartOpen && (
        <div className="cart-overlay open" onClick={() => setCartOpen(false)}>
          <div className="cart-sidebar open" onClick={e => e.stopPropagation()}>
             <div className="cart-header">
                <h2>Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="cart-close-btn">X</button>
             </div>
             <div className="cart-items">
                {cart.length === 0 ? <p>Your cart is empty!</p> : cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <span>{item.emoji}</span>
                    <div>
                      <p>{item.name}</p>
                      <p>${item.price} x {item.qty}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;