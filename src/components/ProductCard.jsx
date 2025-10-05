import React from 'react'

export default function ProductCard({p, onAdd}){
  // Resolve image path: if the product image is referenced under /assets (src/assets),
  // try to load it via import.meta URL so Vite serves it correctly.
  let imgSrc = p.image
  try{
    if(typeof p.image === 'string' && p.image.startsWith('/assets/')){
      // map '/assets/X.png' -> '/src/assets/X.png' for Vite to handle
      imgSrc = new URL('/src' + p.image, import.meta.url).href
    }
  }catch(e){
    // ignore and use original
  }

  // try resolve placeholder too
  let placeholder = '/assets/placeholder.png'
  try{ placeholder = new URL('/src/assets/placeholder.png', import.meta.url).href }catch(e){}

  return (
    <div className="card">
      <img src={imgSrc} alt={p.title} onError={(e)=>{ e.target.onerror=null; e.target.src=placeholder }} />
      <h4>{p.title}</h4>
        <div className="muted">{p.category} • ₹{p.price}</div>
        {p.description && <div style={{marginTop:6,fontSize:13,color:'#444'}}>{p.description}</div>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div className="small">{p.count} available</div>
        {p.count>0 ? (
          <button className="btn" onClick={()=>onAdd(p)}>Select</button>
        ) : (
          <button className="btn" disabled>Out of stock</button>
        )}
      </div>
    </div>
  )
}
