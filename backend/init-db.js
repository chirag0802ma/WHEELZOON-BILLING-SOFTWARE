const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY, name TEXT, price REAL, stock INTEGER, hsn TEXT, gst REAL)`);
  db.run(`CREATE TABLE IF NOT EXISTS invoices(id TEXT PRIMARY KEY, date TEXT, customer TEXT, total REAL, payload TEXT)`);
  const stmt = db.prepare('INSERT OR IGNORE INTO products(id,name,price,stock,hsn,gst) VALUES(?,?,?,?,?,?)');
  stmt.run('T001','MRF Tyre 185/65 R15',5000,12,'4011',18);
  stmt.run('T002','CEAT Tyre 195/55 R16',6200,8,'4011',18);
  stmt.run('W001','Alloy Wheel 16"',8500,5,'8714',18);
  stmt.finalize(()=>db.close());
});
console.log('DB initialized');
