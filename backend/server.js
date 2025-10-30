const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB);

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => { if (err) return res.status(500).send(err); res.json(rows); });
});

app.post('/products', (req, res) => {
  const { id, name, price, stock, hsn, gst } = req.body;
  db.run('INSERT INTO products(id,name,price,stock,hsn,gst) VALUES(?,?,?,?,?,?)', [id,name,price,stock,hsn,gst], function(err){
    if(err) return res.status(500).send(err.message);
    res.json({ ok:true });
  });
});

app.post('/create-invoice', (req, res) => {
  const inv = req.body;
  db.serialize(()=>{
    db.run('INSERT INTO invoices(id,date,customer,total,payload) VALUES(?,?,?,?,?)', [inv.id, inv.date, inv.customer, inv.total, JSON.stringify(inv)], function(err){
      if(err) return res.status(500).send(err.message);
      const stmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      inv.items.forEach(it => stmt.run(it.qty, it.id));
      stmt.finalize(()=> res.json({ ok:true, invoice: inv }));
    });
  });
});

app.get('/invoices', (req, res) => {
  db.all('SELECT id,date,customer,total FROM invoices ORDER BY date DESC', (err, rows) => { if (err) return res.status(500).send(err); res.json(rows); });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend running on', PORT));
