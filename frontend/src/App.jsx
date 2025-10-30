import React, { useEffect, useState } from 'react'
import { fetchProducts, createProduct, createInvoice, listInvoices } from './api'
import jsPDF from 'jspdf'

export default function App(){ 
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [invoices, setInvoices] = useState([])
  const [customer, setCustomer] = useState('Walk-in')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [shopName, setShopName] = useState('WHEELZOON TRADERS')
  const [shopGstin, setShopGstin] = useState('')
  const [shopState, setShopState] = useState('')
  const [customerState, setCustomerState] = useState('')
  const [newProduct, setNewProduct] = useState({id:'',name:'',price:0,stock:0,hsn:'',gst:18})

  useEffect(()=>{ load(); fetchInvoices(); },[])
  async function load(){ const p = await fetchProducts(); setProducts(p); }
  async function fetchInvoices(){ const r = await listInvoices(); setInvoices(r); }

  function addToCart(prod){ const found = cart.find(c=>c.id===prod.id); if(found) setCart(cart.map(c=>c.id===prod.id?{...c,qty:c.qty+1}:c)); else setCart([...cart,{...prod,qty:1}]); }
  function updateQty(id,qty){ if(qty<=0) setCart(cart.filter(c=>c.id!==id)); else setCart(cart.map(c=>c.id===id?{...c,qty}:c)); }
  function subtotal(){ return cart.reduce((s,i)=>s + Number(i.price)*Number(i.qty),0); }
  function gstAmounts(){ let total=0; cart.forEach(it=>{ const t=Number(it.price)*Number(it.qty); total += t*(Number(it.gst||18)/100); }); return total; }
  function total(){ return subtotal()+gstAmounts(); }

  async function handleCreateInvoice(download=false){
    if(!cart.length) return alert('Cart empty');
    const inv = { id:'INV'+String(invoices.length+1).padStart(4,'0'), date:new Date().toISOString(), customer, paymentMode, shopName, shopGstin, shopState, customerState, items:cart.map(({id,name,price,qty,hsn,gst})=>({id,name,price,qty,hsn,gst})), subtotal:subtotal(), gstTotal:gstAmounts(), total:total() }
    const res = await createInvoice(inv); if(res.ok){ alert('Invoice saved'); setCart([]); load(); fetchInvoices(); if(download) downloadPdf(inv); }
  }

  function downloadPdf(inv){
    const doc = new jsPDF({unit:'pt'})
    doc.setFontSize(16); doc.text(inv.shopName||'WHEELZOON TRADERS',40,40)
    doc.setFontSize(10); doc.text('Invoice: '+inv.id,400,40); doc.text('Date: '+new Date(inv.date).toLocaleString(),400,56)
    doc.text('Customer: '+inv.customer,40,80); doc.text('Payment: '+inv.paymentMode,400,80)
    let y=120; doc.setFontSize(9); doc.text('SKU',40,y); doc.text('Item',90,y); doc.text('Qty',340,y); doc.text('Price',420,y); doc.text('GST',480,y); doc.text('Line',540,y); y+=14
    inv.items.forEach(it=>{ const taxable=Number(it.price)*Number(it.qty); const gst=taxable*(Number(it.gst)/100); doc.text(it.id,40,y); doc.text(it.name,90,y); doc.text(String(it.qty),340,y); doc.text('₹'+Number(it.price).toFixed(2),420,y); doc.text(Number(it.gst).toFixed(2)+'%',480,y); doc.text('₹'+(taxable+gst).toFixed(2),540,y); y+=14; if(y>700){doc.addPage(); y=40}})
    y+=10; doc.text('Subtotal: ₹'+inv.subtotal.toFixed(2),40,y); y+=14; doc.text('GST Total: ₹'+inv.gstTotal.toFixed(2),40,y); y+=14; doc.text('Total: ₹'+inv.total.toFixed(2),40,y)
    doc.save(inv.id+'.pdf')
  }

  async function handleAddProduct(){
    if(!newProduct.id||!newProduct.name) return alert('Provide SKU & name'); await createProduct(newProduct); setNewProduct({id:'',name:'',price:0,stock:0,hsn:'',gst:18}); load();
  }

  return (
    <div style={{fontFamily:'Arial, sans-serif',padding:20}}>
      <h1>{shopName} - Billing</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{width:'35%',border:'1px solid #ddd',padding:10}}>
          <h3>Products</h3>
          <div>{products.map(p=> <div key={p.id} style={{borderBottom:'1px solid #eee',padding:8}}><div><strong>{p.name}</strong></div><div style={{fontSize:12}}>{p.id} • HSN:{p.hsn||'-'} • GST:{p.gst||18}% • ₹{p.price} • Stk:{p.stock}</div><button onClick={()=>addToCart(p)}>Add</button></div>)}</div>
          <hr/>
          <h4>Quick add product</h4>
          <input placeholder="SKU" value={newProduct.id} onChange={e=>setNewProduct({...newProduct,id:e.target.value})}/><br/>
          <input placeholder="Name" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})}/><br/>
          <input placeholder="Price" type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:Number(e.target.value)})}/><br/>
          <input placeholder="Stock" type="number" value={newProduct.stock} onChange={e=>setNewProduct({...newProduct,stock:Number(e.target.value)})}/><br/>
          <input placeholder="HSN" value={newProduct.hsn} onChange={e=>setNewProduct({...newProduct,hsn:e.target.value})}/><br/>
          <input placeholder="GST%" type="number" value={newProduct.gst} onChange={e=>setNewProduct({...newProduct,gst:Number(e.target.value)})}/><br/>
          <button onClick={handleAddProduct}>Add Product</button>
        </div>
        <div style={{width:'40%',border:'1px solid #ddd',padding:10}}>
          <h3>Cart</h3>
          <input placeholder="Customer name" value={customer} onChange={e=>setCustomer(e.target.value)}/>
          <input placeholder="Customer State" value={customerState} onChange={e=>setCustomerState(e.target.value)}/>
          <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option></select>
          <div>{cart.map(it=> <div key={it.id} style={{borderBottom:'1px solid #eee',padding:8}}><div><strong>{it.name}</strong></div><div style={{fontSize:12}}>HSN:{it.hsn||'-'} • GST:{it.gst||18}%</div><input type="number" value={it.qty} onChange={e=>updateQty(it.id,Number(e.target.value))} style={{width:60}}/> <span> ₹{(it.price*it.qty).toFixed(2)}</span></div>)}</div>
          <div>Subtotal: ₹{subtotal().toFixed(2)}</div>
          <div>GST: ₹{gstAmounts().toFixed(2)}</div>
          <div>Total: ₹{total().toFixed(2)}</div>
          <button onClick={()=>handleCreateInvoice(false)}>Create Invoice</button>
          <button onClick={()=>handleCreateInvoice(true)}>Create & Download PDF</button>
        </div>
        <div style={{width:'25%',border:'1px solid #ddd',padding:10}}>
          <h3>Shop Settings</h3>
          <input placeholder="Shop name" value={shopName} onChange={e=>setShopName(e.target.value)}/><br/>
          <input placeholder="Shop GSTIN" value={shopGstin} onChange={e=>setShopGstin(e.target.value)}/><br/>
          <input placeholder="Shop State" value={shopState} onChange={e=>setShopState(e.target.value)}/><br/>
          <h4>Recent invoices</h4>
          <div>{invoices.map(inv=> <div key={inv.id}><strong>{inv.id}</strong> {new Date(inv.date).toLocaleString()} ₹{inv.total}</div>)}</div>
        </div>
      </div>
    </div>
  )
}
