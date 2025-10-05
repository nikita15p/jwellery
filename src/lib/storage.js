const STORAGE_KEY = 'jwellery_db_v1'

const seed = {
  categories: [
    'Bangles',
    'Earrings',
    'Mangalsutra',
    'Pendant',
    'Set',
    'Anklet'
  ],
  products: [
  {id: 'b1', title: 'Gold Bangle Set', category: 'Bangles', price: 1200, count: 5, image: '/assets/Bangles.png', description: 'Traditional gold-plated bangles with colored stones.'},
  {id: 'e1', title: 'Flower Earrings', category: 'Earrings', price: 250, count: 10, image: '/assets/Earrings.png', description: 'Lightweight floral earrings perfect for daily wear.'},
  {id: 'm1', title: 'Classic Mangalsutra', category: 'Mangalsutra', price: 800, count: 7, image: '/assets/Mangalsutra.png', description: 'Elegant mangalsutra with black beads and a gold pendant.'},
  {id: 'p1', title: 'Tribal Pendant', category: 'Pendant', price: 450, count: 12, image: '/assets/Payal.png', description: 'Tribal-inspired pendant with antique finish.'}
  ,{id: 's1', title: 'Matching Set', category: 'Set', price: 2200, count: 3, image: '/assets/Set.png', description: 'Coordinated necklace and earring set for occasions.'}
  ,{id: 'a1', title: 'Delicate Anklet', category: 'Anklet', price: 199, count: 8, image: '/assets/Anklet.png', description: 'Lightweight anklet with tiny charms.'}
  ],
  orders: [],
  customers: []
}

function read(){
  const raw = localStorage.getItem(STORAGE_KEY)
  if(!raw){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return JSON.parse(JSON.stringify(seed))
  }
  return JSON.parse(raw)
}

function write(db){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export const db = {
  getCategories(){
    return read().categories
  },
  listProducts(){
    return read().products
  },
  getProduct(id){
    return read().products.find(p=>p.id===id)
  },
  saveProduct(product){
    const data = read()
    const idx = data.products.findIndex(p=>p.id===product.id)
    if(idx>=0) data.products[idx] = product
    else data.products.push(product)
    write(data)
  },
  deleteProduct(id){
    const data = read()
    data.products = data.products.filter(p=>p.id!==id)
    write(data)
  },
  placeOrder(order){
    // Backwards-compatible: immediately place and reduce inventory
    const data = read()
    data.orders.push({...order, status: 'paid', createdAt: Date.now()})
    // reduce counts
    order.items.forEach(item=>{
      const p = data.products.find(x=>x.id===item.id)
      if(p) p.count = Math.max(0, p.count - item.qty)
    })
    write(data)
  },
  listOrders(){
    return read().orders
  },
  listCustomers(){
    return read().customers
  },
  // Save or update a customer using phone as unique id. Returns {ok:true, created?:bool, updated?:bool, customer}
  saveCustomer(c){
    const data = read()
    const phone = (c.phone || '').toString().trim()
    if(!phone) return {ok:false, reason: 'missing_phone'}
    // Use phone as unique id
    const existingIdx = data.customers.findIndex(x => (x.phone || '').toString().trim() === phone)
    const customerRecord = { id: phone, phone, name: c.name || '', address: c.address || '' }
    if(existingIdx >= 0){
      // update existing
      data.customers[existingIdx] = { ...data.customers[existingIdx], ...customerRecord }
      write(data)
      return {ok:true, updated:true, customer: data.customers[existingIdx]}
    }
    // insert
    data.customers.push(customerRecord)
    // keep only last 20
    if(data.customers.length>20) data.customers = data.customers.slice(-20)
    write(data)
    return {ok:true, created:true, customer: customerRecord}
  },
  getSalesByCategory(){
    const data = read()
    const result = {}
    data.categories.forEach(cat=> result[cat]=0)
    data.orders.forEach(o=>{
      o.items.forEach(it=>{
        const p = data.products.find(x=>x.id===it.id)
        if(p) result[p.category] += it.qty * p.price
      })
    })
    return result
  }
}

// New functions for pending/order-confirm flow
export function createPendingOrder(order){
  const data = read()
  const o = {...order, id: order.id || ('o_'+Date.now()), status: 'pending', createdAt: Date.now()}
  data.orders.push(o)
  write(data)
  return o.id
}

export function markOrderPaid(orderId, paymentInfo){
  const data = read()
  const o = data.orders.find(x => x.id === orderId)
  if(!o) return {ok:false, reason:'not_found'}
  if(o.status === 'paid') return {ok:false, reason:'already_paid'}

  // Check stock availability before committing
  const shortages = []
  o.items.forEach(it => {
    const p = data.products.find(x => x.id === it.id)
    if(!p) shortages.push({id: it.id, reason: 'missing_product'})
    else if(p.count < it.qty) shortages.push({id: it.id, reason: 'insufficient', available: p.count, requested: it.qty})
  })
  if(shortages.length) return {ok:false, reason:'insufficient_stock', shortages}

  // Commit: reduce inventory and mark paid
  o.items.forEach(it => {
    const p = data.products.find(x => x.id === it.id)
    if(p) p.count = Math.max(0, p.count - it.qty)
  })
  o.status = 'paid'
  o.paymentInfo = paymentInfo || {}
  o.paidAt = Date.now()
  write(data)
  return {ok:true}
}

export function resetDB(){
  localStorage.removeItem(STORAGE_KEY)
  // read() will write seed if missing
  read()
}

