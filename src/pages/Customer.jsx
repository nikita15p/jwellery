import React, {useEffect, useState} from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import CartPanel from '../components/CartPanel'
import { db, createPendingOrder } from '../lib/storage'

export default function Customer(){
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({name:'',phone:'',address:''})
  const [txRef, setTxRef] = useState('')
  const [txProof, setTxProof] = useState(null)

  useEffect(()=>{
    setCategories(db.getCategories())
    setProducts(db.listProducts())
  },[])

  function refresh(){ setProducts(db.listProducts()) }

  function onAdd(p){
    // check latest stock
    const prod = db.getProduct(p.id)
    if(!prod || prod.count <= 0) return alert('Product out of stock')
    setCart(prev=>{
      const ex = prev.find(x=>x.id===p.id)
      if(ex){
        if(ex.qty + 1 > prod.count) return prev // don't exceed available
        return prev.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x)
      }
      return [...prev,{id:p.id,title:p.title,price:p.price,qty:1, max: prod.count}]
    })
  }

  function onChangeQty(id, qty){
    const prod = db.getProduct(id)
    const allowed = prod ? prod.count : Infinity
    const clamped = Math.max(0, Math.min(qty, allowed))
    setCart(c=>c.map(it=>it.id===id?{...it,qty:clamped, max: allowed}:it).filter(it=>it.qty>0))
  }

  function onPlaceOrder(){
    if(!customer.name || !customer.phone) return alert('Please register with name and phone')
    // basic phone validation: digits only and length 7-15
    const phoneDigits = (customer.phone || '').toString().replace(/\D/g,'')
    if(phoneDigits.length < 7 || phoneDigits.length > 15) return alert('Please enter a valid phone number')

    // Save or update customer using phone as unique id
    const res = db.saveCustomer({ ...customer, phone: phoneDigits })
    if(!res.ok) return alert('Could not save customer: ' + (res.reason || 'unknown'))

    // validate against latest stock before creating pending order
    const shortages = []
    const latestProducts = db.listProducts()
    cart.forEach(it => {
      const p = latestProducts.find(x=>x.id===it.id)
      if(!p || p.count < it.qty) shortages.push({id: it.id, title: it.title, available: p? p.count:0, requested: it.qty})
    })
    if(shortages.length) return alert('Some items exceed available stock: ' + JSON.stringify(shortages))

    const order = {
      id: 'o_'+Date.now(),
      customer: { id: phoneDigits, phone: phoneDigits, name: customer.name, address: customer.address },
      items: cart,
      total: cart.reduce((s,i)=>s + i.qty * i.price, 0),
      paymentInfo: txRef || txProof ? { reference: txRef || undefined, proof: txProof || undefined } : undefined
    }
    // create a pending order; admin will confirm payment and commit inventory change
    createPendingOrder(order)
    setCart([])
    refresh()
    alert('Order placed — inventory will be updated once payment is confirmed by admin. Show QR for payment.')
  }

  const shown = products.filter(p=> (!selectedCat || p.category===selectedCat) && p.title.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <Header categories={categories} onSearch={setFilter} onSelectCategory={setSelectedCat} />
      <div className="container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <div style={{marginBottom:12}}>
              {categories.map(c=> (
                <button key={c} className={"category-pill "+(selectedCat===c? 'active':'')} onClick={()=>setSelectedCat(selectedCat===c?null:c)}>{c}</button>
              ))}
            </div>
            <div className="grid">
              {shown.map(p=> <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
            </div>
          </div>

          <aside style={{width:320,marginLeft:18}}>
            <div className="card">
              <h3>Register / Customer</h3>
              <div className="form-row"><label>Name <span className="req">*</span></label><input placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} /></div>
              <div className="form-row"><label>Phone <span className="req">*</span></label><input placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} /></div>
              <div className="form-row"><label>Address</label><textarea placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} /></div>
              <div style={{height:8}} />
              <h4 style={{margin:0}}>Payment (optional)</h4>
              <div className="form-row"><input placeholder="Transaction reference (UTR)" value={txRef} onChange={e=>setTxRef(e.target.value)} /></div>
              <div className="form-row"><input type="file" onChange={(e)=>{
                const f = e.target.files && e.target.files[0]
                if(!f) return
                const r = new FileReader()
                r.onload = ()=> setTxProof(r.result)
                r.readAsDataURL(f)
              }} /></div>
            </div>
            <div style={{height:12}} />
            <CartPanel items={cart} onPlaceOrder={onPlaceOrder} onChangeQty={onChangeQty} />
          </aside>
        </div>
      </div>
    </div>
  )
}
