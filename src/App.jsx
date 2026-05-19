import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import logo from "./assets/taggiez_logo.png";
import ProductPage from "./ProductPage";

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

const CATEGORIES = ["all","vibes","gaming","collab"];
const PRESETS = ["no cap","slay era","main character","NPC mode","rizz check","glow up"];

function useToasts() {
	const [toasts, setToasts] = useState([]);
	const add = useCallback((msg) => {
		const id = Date.now() + Math.random();
		setToasts(t => [...t, { id, msg }]);
		setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
	}, []);
	return [toasts, add];
}

function ProductCard({ product, onAdd, onView }) {
	const [added, setAdded] = useState(false);
	const handleAdd = () => {
		onAdd(product);
		setAdded(true);
		setTimeout(() => setAdded(false), 900);
	};
	return (
		<div
			className="product-card"
			role="article"
			aria-label={product.name}
			onClick={(e) => {
				// ignore clicks that originate from interactive elements
				if (e.target.closest('button') || e.target.closest('a')) return;
				onView?.(product);
			}}
			style={{ cursor: "pointer" }}
		>
			{product.badge && <span className={`product-badge ${product.badge === 'new' ? 'new' : ''}`}>{product.badge}</span>}
			<div className="product-img-wrap" style={{ background: product.bg }}>
				<div className="product-img-placeholder"><span style={{fontSize:'4rem'}}>{product.emoji}</span></div>
			</div>
			<div className="product-info">
				<p className="product-cat">{product.category}</p>
				{/* product title opens product page via SPA handler */}
				<h3 className="product-name">
					<a
						href={`/product/${product.id}`}
						className="product-link"
						onClick={(e) => { e.preventDefault(); onView?.(product); }}
						style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
					>
						{product.name}
					</a>
				</h3>
				<p className="product-desc">{product.desc}</p>
				<div className="product-footer">
					<div className="product-price"><sup>$</sup>{product.price.toFixed(2)}</div>
					<button
						className="add-to-cart-btn"
						onClick={(e) => { e.stopPropagation(); handleAdd(); }}
						disabled={added}
					>
						{added ? '✅ Added!' : '+ Add to Cart'}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function App() {
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [cart, setCart] = useState([]);
	const [cartOpen, setCartOpen] = useState(false);
	const [category, setCategory] = useState('all');
	const [aiPrompt, setAiPrompt] = useState('');
	const [aiLoading, setAiLoading] = useState(false);
	const [aiImg, setAiImg] = useState(null);
	const [toasts, addToast] = useToasts();
	const aiInputRef = useRef();

	const filtered = category === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === category || p.tags.includes(category));

	const addToCart = (product) => {
		setCart(prev => {
			const exists = prev.find(i => i.id === product.id);
			if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
			return [...prev, { id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 }];
		});
		addToast(`Added "${product.name}"`);
	};

	// open/close product page with history (SPA)
	const openProductPage = (product) => {
		if (!product) return;
		history.pushState({}, "", `/product/${product.id}`);
		setSelectedProduct(product);
		window.scrollTo(0, 0);
	};
	const closeProductPage = () => {
		history.pushState({}, "", "/");
		setSelectedProduct(null);
		window.scrollTo(0, 0);
	};

	// initialize from URL and respond to back/forward
	useEffect(() => {
		const handleLocation = () => {
			const m = window.location.pathname.match(/^\/product\/(\d+)/);
			if (m) {
				const id = parseInt(m[1], 10);
				const p = PRODUCTS.find(x => x.id === id);
				if (p) setSelectedProduct(p);
				else setSelectedProduct(null);
			} else {
				setSelectedProduct(null);
			}
		};
		handleLocation();
		window.addEventListener("popstate", handleLocation);
		return () => window.removeEventListener("popstate", handleLocation);
	}, []);

	const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
	const shipping = cart.length>0 ? 3.99 : 0;
	const total = subtotal + shipping;
	const totalItems = cart.reduce((s,i)=>s + i.qty, 0);

	const generateTag = async () => {
		if (!aiPrompt.trim()) {
			addToast('Enter a prompt first');
			return;
		}
		setAiLoading(true);
		// quick client-side SVG mock of generated tag
		const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='100%' height='100%' fill='#fff8ec'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Lilita One, sans-serif' font-size='80' fill='#FF3C78'>${aiPrompt.replace(/</g,'')}</text></svg>`;
		const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
		await new Promise(r => setTimeout(r, 900));
		setAiImg(url);
		addToast('AI tag generated');
		setAiLoading(false);
	};

	const handleCheckout = () => {
		if (cart.length === 0) {
			addToast('Cart is empty');
			return;
		}
		addToast('Checkout simulated — thanks!');
		setCart([]);
		setCartOpen(false);
	};

	useEffect(() => {
		// small accessibility: close cart on ESC
		const onKey = (e) => { if (e.key === 'Escape') setCartOpen(false); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<div>
			<nav>
				<a className="nav-logo" href="#root">
					<img src={logo} alt="Taggiez" className="site-logo" />
				</a>
				<div className="nav-actions">
					<a className="nav-link" href="#shop">Shop</a>
					<a className="nav-link" href="#about">About</a>
					<a className="nav-login-btn" href="https://designer.taggiez.com">
						✏️ Login
					</a>
					<button className="nav-cart-btn" onClick={() => setCartOpen(true)} aria-label={`Cart, ${totalItems} items`}>
						🛒 <span className="nav-cart-label">Cart</span>
						<span className="cart-badge">{totalItems}</span>
					</button>
				</div>
			</nav>

			{!selectedProduct && (
				<header className="hero">
					<div className="hero-floating-tag" style={{left: '14%', top: '32%'}}>🧢</div>
					<div className="hero-floating-tag" style={{right: '12%', top: '20%'}}>⭐</div>
					<div className="hero-eyebrow">👧 Kid-designed · 🔥 Trend-native · 📦 Ships fast</div>
					<h1 className="hero-title"><span className="hl-yellow">Tags</span> <span className="hl-pink">That</span></h1>
					<h1 className="hero-title" style={{marginTop:'6px', fontSize:'clamp(3.5rem, 9vw, 6.5rem)'}}>Absolutely Slap</h1>
					<p className="hero-subtitle">Meme-inspired embroidered tags for your backpack, keys, and gear. Designed by Kylen & Piper, two kids who actually know what's trending.</p>

					<div className="hero-ctas">
						<a href="#shop" className="btn-primary" onClick={(e)=>{e.preventDefault(); document.getElementById('shop').scrollIntoView({behavior:'smooth'})}}>🛍️ Shop Tags</a>
					</div>

					<div className="hero-trust">
						<div className="hero-trust-item">🎂 Ships in 5–7 days</div>
						<div className="hero-trust-item">🔒 Secure checkout</div>
						<div className="hero-trust-item">💯 100% kid-designed</div>
						<div className="hero-trust-item">↩️ Free returns</div>
					</div>
				</header>
			)}

			<section className="marquee-section" aria-hidden>
				<div className="marquee-track" style={{paddingLeft: '1.5rem'}}>
					{[...PRESETS, ...PRESETS].map((p,i) => (
						<div key={i} className="marquee-item">{p} <span className="marquee-dot">♦</span></div>
					))}
				</div>
			</section>

			{/* content: either exclusive product page (header+footer kept) or the main site */}
			{selectedProduct ? (
				<ProductPage product={selectedProduct} addToCart={(p) => { addToCart(p); }} onBack={closeProductPage} />
			) : (
				<main>
					<section id="shop" className="section">
						<div className="section-header">
							<span className="section-label">Shop</span>
							<h2 className="section-title"><span style={{color:'#000'}}>Our</span> <span className="hl">Tags</span></h2>
						</div>

						<div className="product-filters">
							{CATEGORIES.map(c => (
								<button key={c} className={`filter-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
							))}
						</div>

						<div className="products-grid">
							{filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={openProductPage} />)}
						</div>
					</section>

					<section id="about" className="section about-section">
						<div className="section-header">
							<span className="section-label">The Story</span>
							<h2 className="section-title">
              <span style={{color:'#000'}}>Built by</span> <span className="hl">Kids</span>, <br/>
              <span style={{color:'#000'}}>For</span> <span className="hl">Kids</span>
            </h2>
						</div>
						<div className="about-grid">
							<div className="about-copy">
								<h3 className="section-title">Made by kids, for vibes</h3>
								<p>Taggiez was born when Kylen (CEO) noticed that the accessories brands selling to kids were... not designed by kids. The memes were off. The references were out of season. It was giving adult vibes.</p>
								<p>So he and his sister Piper started Taggiez — a direct-to-consumer brand that turns this week's trending phrase into an embroidered tag you can clip anywhere.</p>
								<div className="about-stat-row">
									<div className="about-stat">
										<div className="about-stat-num">7 days</div>
										<div className="about-stat-label">AVG SHIP TIME</div>
									</div>
									<div className="about-stat">
										<div className="about-stat-num">100%</div>
										<div className="about-stat-label">KID-DESIGNED</div>
									</div>
								</div>
							</div>
							<div className="about-team">
								<div className="team-card">
									<div className="team-avatar">👑</div>
									<div className="team-name">Kylen</div>
									<div className="team-role">CEO</div>
								</div>
								<div className="team-card">
									<div className="team-avatar">📣</div>
									<div className="team-name">Piper</div>
									<div className="team-role">CMO</div>
								</div>
								<div className="team-card">
									<div className="team-avatar">🧠</div>
									<div className="team-name">Bobby "Dad"</div>
									<div className="team-role">Tech Advisor</div>
								</div>
								<div className="team-card">
									<div className="team-avatar">💼</div>
									<div className="team-name">Erin "Mom"</div>
									<div className="team-role">Legal Advisor</div>
								</div>
							</div>
						</div>
					</section>
				</main>
			)}

			<footer>
				<div className="footer-grid">
					<div className="footer-brand">
						<div className="nav-logo">
							<img src={logo} alt="Taggiez" className="site-logo" style={{ width: '160px', maxWidth: '160px', height: 'auto', objectFit: 'contain', display: 'block' }} />
						</div>
						<p>Small shop making big vibes.</p>
					</div>
					<div className="footer-col"><h4>Links</h4><ul><li><a href="#shop">Shop</a></li><li><a href="#create">Create</a></li></ul></div>
					<div className="footer-col"><h4>Contact</h4><ul><li><a href="mailto:sup@taggiez.com">sup@taggiez.com</a></li></ul></div>
				</div>
				<div className="footer-bottom">
					<div>© 2026 Taggiez, LLC</div>
					<div className="made-by-badge">Kid-made</div>
				</div>
			</footer>

			{/* CART SIDEBAR */}
			<div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
			<aside className={`cart-sidebar ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
				<div className="cart-header">
					<h2>Cart</h2>
					<button className="cart-close-btn" onClick={() => setCartOpen(false)}>✕</button>
				</div>
				<div className="cart-items">
					{cart.length === 0 ? (
						<div className="cart-empty"><div className="cart-empty-icon">🧾</div><div>Your cart is empty</div></div>
					) : cart.map(item => (
						<div key={item.id} className="cart-item">
							<div className="cart-item-icon">{item.emoji}</div>
							<div className="cart-item-info">
								<div className="cart-item-name">{item.name}</div>
								<div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
								<div className="cart-item-qty">
									<button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
									<div className="qty-num">{item.qty}</div>
									<button className="qty-btn" onClick={() => updateQty(item.id, +1)}>+</button>
								</div>
							</div>
							<button className="remove-btn" onClick={() => removeItem(item.id)}>🗑️</button>
						</div>
					))}
				</div>
				<div className="cart-footer">
					<div className="cart-totals">
						<div className="cart-total-row"><div>Subtotal</div><div>${subtotal.toFixed(2)}</div></div>
						<div className="cart-total-row"><div>Shipping</div><div>${shipping.toFixed(2)}</div></div>
						<div className="cart-total-row grand"><div>Total</div><div>${total.toFixed(2)}</div></div>
					</div>
					<button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
				</div>
			</aside>

			{/* TOASTS */}
			<div className="toast-stack" aria-live="polite">
				{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
			</div>
		</div>
	);
}