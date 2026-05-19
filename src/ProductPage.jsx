import React, { useState } from "react";

export default function ProductPage({ product, addToCart, onBack }) {
  // placeholders for extra images
  const placeholders = [
    "https://via.placeholder.com/800x500?text=Detail+1",
    "https://via.placeholder.com/800x500?text=Detail+2",
  ];
  const images = [
    // first image mirrors the product preview (emoji on bg)
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='100%' height='100%' fill='${product.bg || '#fff'}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='160'>${product.emoji || ''}</text></svg>`
    )}`,
    ...placeholders,
  ];

  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i+1) % images.length);
  const prev = () => setIdx(i => (i-1 + images.length) % images.length);

  return (
    <section className="product-page section" style={{ padding: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <button className="btn-secondary" onClick={onBack} aria-label="Back" style={{ marginRight: '1rem' }}>← Back</button>
        <span className="section-label">Product</span>
        <h2 className="section-title" style={{ display:'inline-block', marginLeft: '1rem' }}>{product.name}</h2>
      </div>

      <div className="product-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '2rem' }}>
        <div className="product-images" style={{ position: 'relative', background: '#fff' }}>
          <img src={images[idx]} alt={`${product.name} image`} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
          <button onClick={prev} aria-label="Previous" style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)' }}>‹</button>
          <button onClick={next} aria-label="Next" style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)' }}>›</button>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            {images.map((p,i) => (
              <img key={i} src={p} alt={`thumb-${i}`} onClick={()=>setIdx(i)} style={{ width:80, height:50, objectFit:'cover', borderRadius:4, cursor:'pointer', opacity: i===idx ? 1 : 0.6 }} />
            ))}
          </div>
        </div>

        <aside className="product-details" style={{ alignSelf:'start' }}>
          <p className="product-cat" style={{ textTransform:'uppercase', opacity:0.7 }}>{product.category}</p>
          <h3 className="product-name" style={{ marginTop:0 }}>{product.name}</h3>
          <p className="product-desc" style={{ marginTop:'0.5rem' }}>{product.desc}</p>

          <div style={{ marginTop:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:'1.5rem', fontWeight:700 }}>${product.price.toFixed(2)}</div>
            <button className="add-to-cart-btn" onClick={() => { addToCart(product); }} style={{ padding: '0.6rem 1rem' }}>+ Add to Cart</button>
          </div>

          <div style={{ marginTop:'1rem', color:'#666' }}>
            <strong>Shipping:</strong> Usually ships in 5–7 days.
          </div>
        </aside>
      </div>
    </section>
  );
}
