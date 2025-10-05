import React from 'react'

export default function CartPanel({items, onPlaceOrder, onChangeQty}){
  const total = items.reduce((s,i)=>s + i.qty * i.price,0)
  return (
    <div className="cart-panel">
      <div style={{fontWeight:700}}>Cart</div>
      {items.length===0 && <div className="small muted">No items</div>}
      {items.map(it=> (
        <div key={it.id} style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
          <div className="small">{it.title} x
            <input style={{width:48,marginLeft:6}} type="number" value={it.qty} onChange={(e)=>onChangeQty(it.id, +e.target.value)} />
            {it.max!=null && <span style={{marginLeft:8,fontSize:12,color:'#666'}}>max {it.max}</span>}
          </div>
          <div>₹{it.qty * it.price}</div>
        </div>
      ))}
      <div style={{marginTop:8,fontWeight:700}}>Total: ₹{total}</div>
      <div style={{marginTop:8}}>
        <button className="btn" onClick={()=>onPlaceOrder()}>Pay (Show QR)</button>
      </div>
      <div style={{marginTop:8}}>
        <div className="qr">QR CODE</div>
      </div>
    </div>
  )
}
