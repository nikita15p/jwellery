import React, {useEffect, useState} from 'react'
import { db, markOrderPaid } from '../lib/storage'
import { resolveImage } from '../lib/utils'

function Login({onOk}){
  const [u,setU]=useState('')
  const [p,setP]=useState('')
  function submit(e){
    e.preventDefault();
    if(u==='admin' && p==='admin'){
      onOk()
    } else {
      alert('invalid')
    }
  }
  return (
    <div style={{padding:20}}>
      <h3>Admin Login</h3>
      <form onSubmit={submit} className="form-row">
        <label>Username <span className="req">*</span></label>
        <input placeholder="user" value={u} onChange={e=>setU(e.target.value)} />
        <label>Password <span className="req">*</span></label>
        <input placeholder="pass" type="password" value={p} onChange={e=>setP(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  )
}

export default function Admin(){
  const [logged, setLogged] = useState(false)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [orders, setOrders] = useState([])
  const [verifyingOrder, setVerifyingOrder] = useState(null)
  const [verifyRef, setVerifyRef] = useState('')
  const [verifyProof, setVerifyProof] = useState(null)
  const [tab, setTab] = useState('products')

  useEffect(()=>{
    if(logged){
      setProducts(db.listProducts().map(resolveImage));
      setCategories(db.getCategories());
      setOrders(db.listOrders())
    }
  },[logged])

  function refreshAll(){ setProducts(db.listProducts()); setOrders(db.listOrders()) }

    function resetSeed(){
      if(!confirm('Reset DB to seed data? This will overwrite current data in localStorage.')) return
      // call resetDB from storage
      import('../lib/storage').then(mod=>{
        mod.resetDB()
        setProducts(mod.db.listProducts())
        setCategories(mod.db.getCategories())
        setOrders(mod.db.listOrders())
        alert('Database reset to seed data')
      })
    }
  function editNew(){ setEditing({id:'p_'+Date.now(), title:'', category:categories[0]||'Misc', price:0, count:0, image:''}) }

  function save(){ db.saveProduct(editing); setProducts(db.listProducts()); setEditing(null) }

  function remove(id){ if(confirm('Delete?')){ db.deleteProduct(id); setProducts(db.listProducts()) }}

  function onUpload(e){
    const f = e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ()=> setEditing({...editing, image: reader.result})
    reader.readAsDataURL(f)
  }

  return (
    <div>
      {!logged && <Login onOk={()=>setLogged(true)} />}
      {logged && (
        <div className="admin-layout">
          <div className="admin-sidebar">
            <h4>Admin</h4>
            <div className="small muted">Products</div>
            <button className="btn" onClick={editNew}>Add Product</button>
            <button className="btn" onClick={resetSeed}>Reset Seed Data</button>
            <div style={{marginTop:12}}>
              <div className="small">Orders</div>
              <div className="muted small">{orders.length} orders</div>
            </div>
            <div style={{marginTop:12}}>
              <div className="small">Sales</div>
              <pre className="small muted">{JSON.stringify(db.getSalesByCategory(),null,2)}</pre>
            </div>
          </div>
          <div className="admin-main">
            <div className="admin-tabs">
              <div className={"admin-tab "+(tab==='products'?'active':'')} onClick={()=>setTab('products')}>Products</div>
              <div className={"admin-tab "+(tab==='orders'?'active':'')} onClick={()=>setTab('orders')}>Orders</div>
            </div>

            {tab==='products' && (
              <div className="admin-products">
                <h3>Products</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  {products.map(p=> (
                    <div key={p.id} className="card">
                      <img src={p.image} alt="" style={{height:120,objectFit:'cover'}} onError={(e)=>{ e.target.onerror=null; e.target.src=new URL('/src/assets/placeholder.png', import.meta.url).href }} />
                      <h4>{p.title}</h4>
                      <div className="muted">{p.category} • ₹{p.price} • {p.count}</div>
                      <div style={{marginTop:8,display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>setEditing(p)}>Edit</button>
                              <button className="btn danger" onClick={()=>remove(p.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {editing && (
                  <div style={{marginTop:18}} className="card">
                    <h4>{editing.id?'Edit Product':'New Product'}</h4>
                    <div className="form-row">
                      <label>Title <span className="req">*</span></label>
                      <input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="Title" />
                      <label>Category</label>
                      <select value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>
                        {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Price <span className="req">*</span></label>
                      <input type="number" value={editing.price} onChange={e=>setEditing({...editing,price:+e.target.value})} placeholder="Price" />
                      <label>Count <span className="req">*</span></label>
                      <input type="number" value={editing.count} onChange={e=>setEditing({...editing,count:+e.target.value})} placeholder="Count" />
                    </div>
                    <div className="form-row" style={{flexDirection:'column'}}>
                      <label>Description</label>
                      <textarea value={editing.description || ''} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Optional product description" />
                    </div>
                    <div className="form-row">
                      <input type="file" onChange={onUpload} />
                    </div>
                    {editing.image && <img src={editing.image} alt="preview" style={{height:120}} />}
                    <div style={{marginTop:8}}>
                      <button className="btn" onClick={save}>Save</button>
                      <button className="btn" onClick={()=>setEditing(null)} style={{marginLeft:8}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab==='orders' && (
              <div className="admin-orders">
                <h3>Orders</h3>
                {orders.length===0 && <div className="muted">No orders yet</div>}
                {orders.map(o=> (
                  <div key={o.id} className="card" style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div><strong>{o.customer.name}</strong> • {o.customer.phone} • <span className="small muted">{o.status || 'pending'}</span></div>
                      <div className="small muted">₹{o.total || o.items.reduce((s,i)=>s + (i.price||0)*i.qty,0)}</div>
                    </div>
                    <div className="small muted">{o.customer.address}</div>
                    <div style={{marginTop:6}}>
                      {o.items.map(it=> <div key={it.id}>{it.title} x {it.qty}</div>)}
                    </div>
                    <div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
                      {o.status !== 'paid' && (
                        <>
                          {/* quick no-proof mark */}
                          <button className="btn" onClick={async ()=>{
                            const res = markOrderPaid(o.id, {by:'admin', method: 'manual'})
                            if(!res.ok){
                              if(res.reason === 'insufficient_stock'){
                                alert('Cannot mark paid — insufficient stock for some items: '+JSON.stringify(res.shortages))
                              } else alert('Could not mark paid: '+res.reason)
                            } else {
                              alert('Order marked as paid and inventory updated')
                              refreshAll()
                            }
                          }}>Mark Paid</button>

                          {/* pull-model verify: show inputs when toggled */}
                          {!verifyingOrder && <button className="btn" onClick={()=>{ setVerifyingOrder(o.id); setVerifyRef(''); setVerifyProof(null) }}>Verify Payment</button>}
                        </>
                      )}
                      {o.status === 'paid' && <div className="small">Paid at: {o.paidAt ? new Date(o.paidAt).toLocaleString() : '—'}</div>}
                    </div>

                    {verifyingOrder === o.id && (
                      <div style={{marginTop:10}}>
                        <div className="form-row">
                          <input placeholder="Transaction reference (UTR)" value={verifyRef} onChange={e=>setVerifyRef(e.target.value)} />
                          <input type="file" onChange={(e)=>{
                            const f = e.target.files && e.target.files[0]
                            if(!f) return
                            const r = new FileReader()
                            r.onload = ()=> setVerifyProof(r.result)
                            r.readAsDataURL(f)
                          }} />
                        </div>
                        <div style={{display:'flex',gap:8,marginTop:8}}>
                          <button className="btn" onClick={async ()=>{
                            // submit verify: call markOrderPaid with paymentInfo
                            const paymentInfo = { method: 'manual', reference: verifyRef || undefined, proof: verifyProof }
                            const res = markOrderPaid(o.id, paymentInfo)
                            if(!res.ok){
                              if(res.reason === 'insufficient_stock'){
                                alert('Cannot mark paid — insufficient stock for some items: '+JSON.stringify(res.shortages))
                              } else {
                                alert('Could not mark paid: '+res.reason)
                              }
                            } else {
                              alert('Order verified and marked as paid')
                              setVerifyingOrder(null)
                              setVerifyRef('')
                              setVerifyProof(null)
                              refreshAll()
                            }
                          }}>Confirm & Mark Paid</button>
                          <button className="btn" onClick={()=>{ setVerifyingOrder(null); setVerifyRef(''); setVerifyProof(null) }}>Cancel</button>
                        </div>
                        {verifyProof && <div style={{marginTop:8}}><img src={verifyProof} alt="proof" style={{height:120}} /></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
