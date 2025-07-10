const mysql=require('mysql');
const crypto = require('crypto');
function cmd5(s){return crypto.createHash('md5').update("arping"+s).digest('hex');}
const {v4:guid} = require('uuid');
const con=mysql.createConnection({
  host: '',
  user: 'root',
  password: '',
  database: 'abcd1'
});
con.connect((err)=>{
  if(err){console.error('连接失败: ' + err.stack);return;}
  console.log('已连接到数据库，连接 ID: ' + con.threadId);
});
const express = require('express');
const app = express();
const session = require('express-session');
app.use(session({secret:'你的密鑰',resave:false,saveUninitialized:true,cookie:{secure:false}}));

const M=require('./www/main.js');  for(let fn in M)eval(`${fn}=M.${fn};`);

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));//在 post body 中 從 urlencode格式 提成 javascript json
app.use((req,res,next)=>{dog(req.url);next();});
app.use('/',express.static(__dirname+"/img"));
app.use('/',express.static(__dirname+"/www"));

app.get("/account-create-form",(req,res)=>{res.render('account-create-form');});

/*app.post("/account-create",(req,res)=>{
  let{人員卡號,人員卡密碼,人員卡信箱,人員卡名}=req.body;
  let 人員卡證="人員卡證"+cmd5(人員卡信箱);
  人員卡密碼=cmd5(人員卡密碼);
  let Q=`insert into user(    人員卡號,     人員卡名,     人員卡信箱,     人員卡密碼)
                    values("${人員卡證}","${人員卡號}","${人員卡名}","${人員卡信箱}","${人員卡密碼}")
             on duplicate key update 人員卡號="${人員卡號}",人員卡名="${人員卡名}",人員卡密碼="${人員卡密碼}" `;
  con.query(Q,(e)=>{dog(e);});
  res.send("OK");
});*/

app.post("/account-create", (req, res) => {
  let { username, email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email 或 Password 缺失");
    return;
  }

  const passwordHash = cmd5(password); 
  const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;

  con.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error("資料庫錯誤: ", err);
      res.status(500).send("資料庫操作失敗");
      return;
    }
    if (result.length > 0) {
      res.status(409).send("該 Email 已建立帳號");
      return; 
    }
    const insertQuery = `
      INSERT INTO users (username, email, password_hash) 
      VALUES (?, ?, ?)
    `;
    con.query(insertQuery, [username, email, passwordHash], (err) => {
      if (err) {
        console.error("資料庫錯誤: ", err);
        res.status(500).send("資料庫操作失敗");
      } else {
        res.send("用戶創建成功");
      }
    });
  });
});

/*app.post('/account',(req,res)=>{  
  let Q=`select * from 人員卡`;
  con.query(Q,(e,列S,欄S)=>{
    欄S=欄S.map(x=>x.name);
    let 料={指令:"人員卡",欄S,列S};
    res.send(料);    
  });
});*/

app.post('/course',(req,res)=>{let Q=`select * from 人員卡`;con.query(Q,(e,列S,欄S)=>{
  if (e) {
  console.error('Database query error:', e);
  return res.status(500).send({ error: 'Database query failed' });
  }
  欄S=欄S.map(x=>x.name);
  let 料={指令:"人員卡",欄S,列S};
  res.send(料); 
  });
});

app.get('/current-user', (req, res) => {
  const user = req.session.user; 
  if (!user) {
      return res.status(401).send({ message: "未登入" });
  }
  res.send(user); 
});

// 獲取購物車內容
app.post('/shop', (req, res) => {
  const user = req.session.user;
  if (!user) {
      return res.status(401).send({ error: "未登入" });
  }
  const userId = user.id;
  const Q = `SELECT * FROM cart_items WHERE user_id = ?`;
  con.query(Q, [userId], (err, rows, fields) => {
      if (err) {
          console.error("Database query error:", err.message);
          return res.status(500).send({ error: "獲取購物車內容失敗" });
      }
      const columnNames = fields.map(field => field.name);
      const result = {
          指令: "cart_items",
          欄S: columnNames,
          列S: rows
      };
      res.send(result);
  });
});

app.post('/course/addrow',(req,res)=>{  
  let 人員卡證="人員卡證"+cmd5("人員卡證"+guid());
  let Q=`insert into 人員卡(人員卡證) values('${人員卡證}')`;
  con.query(Q,(e)=>{});
  Q=`select * from 人員卡 where 人員卡證='${人員卡證}'`;
  con.query(Q,(e,列S,欄S)=>{欄S=欄S.map(x=>x.name);
     let 料={指令:"人員卡",欄S,列S};res.send(料); 
  });
});

app.post('/course/update',(req,res)=>{
  let{人員卡證,欄,值}=req.body;
  if (欄 === '人員卡密碼' || 欄.toLowerCase().includes('密碼')) {
    值 = cmd5(值);
  }
  if (欄 === '人員卡信箱') {
    let R = `SELECT 人員卡證 FROM 人員卡 WHERE 人員卡信箱 = '${值}' AND 人員卡證 != '${人員卡證}'`;

    con.query(R, (e, results) => {
      if (results.length > 0) {
        return;
      }
      let Q=`update 人員卡 set ${欄}='${值}' where 人員卡證='${人員卡證}'`;
      con.query(Q,(e)=>{});
    });
  } else {
    let Q=`update 人員卡 set ${欄}='${值}' where 人員卡證='${人員卡證}'`;
     con.query(Q,(e)=>{});
  }
});

app.post('/course/delrow',(req,res)=>{  
  let{刪S}=req.body;
  for(let 證 of 刪S){
    let Q=`delete from 人員卡 where 人員卡證='${證}' `;
    con.query(Q,(e)=>{});
  }
});

app.post('/mypost', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
      return res.status(400).send("Email 或 Password 缺失");
  }
  const passwordHash = cmd5(password);
  const Q = `SELECT id, username, email FROM users WHERE email = ? AND password_hash = ?`;

  con.query(Q, [email, passwordHash], (err, rows) => {
      if (err) {
          console.error("登入查詢錯誤:", err.message);
          return res.status(500).send("登入失敗");
      }
      if (rows.length) {
          req.session.user = rows[0]; 
          res.redirect('/aaa.html');
      } else {
          req.session.user = null; 
          res.send("沒這號人物");
      }
  });
});

// 加入購物車 API
app.post('/add-to-cart', (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
      return res.status(400).send({ message: "缺少必要參數" });
  }
  // 查詢商品庫存
  const checkStockQuery = `SELECT stock FROM products WHERE id = ?`;
  con.query(checkStockQuery, [product_id], (err, rows) => {
      if (err) {
          console.error("查詢庫存錯誤:", err.message);
          return res.status(500).send({ message: "無法查詢商品庫存" });
      }
      const stock = rows[0]?.stock;
      if (!stock || stock < quantity) {
          return res.status(400).send({ message: "庫存不足" });
      }
      const checkCartQuery = `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`;
      con.query(checkCartQuery, [user_id, product_id], (err, rows) => {
        if (err) {
          console.error("查詢錯誤:", err.message);
          return res.status(500).send({ message: "查詢購物車錯誤" });
        }
        if (rows.length > 0) {
          const updateQuery = `UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`;
          con.query(updateQuery, [quantity, user_id, product_id], (err) => {
            if (err) {
              console.error("更新錯誤:", err.message);
              return res.status(500).send({ message: "更新購物車數量錯誤" });
            }
            res.send({ message: "購物車數量已更新" });
          });
        } else {
          const insertQuery = `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)`;
          con.query(insertQuery, [user_id, product_id, quantity], (err) => {
            if (err) {
              console.error("插入錯誤:", err.message);
              return res.status(500).send({ message: "無法加入購物車" });
            }
            res.send({ message: "商品已成功加入購物車" });
          });
        }
      });
   });
});

app.post('/shopimg', (req, res) => {
  const user = req.session.user;
  if (!user) {
      return res.status(401).send({ error: "未登入" });
  }
  const userId = user.id;
  const Q = `SELECT product_id , quantity FROM cart_items WHERE user_id = ?`;
  con.query(Q, [userId], (err, rows, fields) => {
    if (err) {
        console.error("Database query error:", err.message);
        return res.status(500).send({ error: "獲取購物車內容失敗" });
    }
    const columnNames = fields.map(field => field.name);
    const result = {
        指令: "cart_items",
        欄S: columnNames,
        列S: rows
    };
    res.send(result);
  });
});

// 加入order item API
app.post('/add-to-order-item', (req, res) => {
  const { user_id, product_id, quantity, price } = req.body;

  if (!user_id || !product_id || !quantity || !price) {
    return res.status(400).send({ message: "缺少必要參數" });
  }

  const Q = `INSERT INTO order_items (user_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`;
  con.query(Q, [user_id, product_id, quantity, price], (err, result) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).send({ message: "加入訂單失敗" });
    }
    res.send({ message: "成功加入訂單！" });
  });
});

app.post('/delete-cart-item', (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) {
    return res.status(400).send({ message: "缺少必要參數" });
  }
  const Q = `DELETE FROM cart_items WHERE product_id = ? AND quantity = ?`;
  con.query(Q, [product_id, quantity], (err, result) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).send({ message: "刪除失敗" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "找不到對應的商品記錄" });
    }
    res.send({ message: "成功刪除商品！" });
  });
});


app.post('/get-orders', (req, res) => {
  const user = req.session.user;
  if (!user) {
    console.log("未登入，發送 401 回應");
    return res.status(401).send({ error: "未登入" });
  }

  const userId = user.id;
  const Q = `SELECT product_id, quantity, price FROM order_items WHERE user_id = ?`;

  con.query(Q, [userId], (err, results) => {
    if (err) {
      console.error("資料庫錯誤，發送 500 回應:", err.message);
      return res.status(500).send({ message: "查詢訂單失敗" });
    }
    res.send({ orders: results });
  });
});

app.post('/create-order', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).send({ message: "未登入，請先登入。" });
  }
  const userId = user.id;

  // 1. 從 order_items 獲取用戶的所有商品
  const query = `SELECT product_id, quantity, price FROM order_items WHERE user_id = ?`;
  con.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).send({ message: "查詢訂單項目失敗" });
    }

    if (results.length === 0) {
      return res.status(400).send({ message: "沒有待處理的訂單項目" });
    }

    // 2. 計算總金額
    let totalPrice = 0;
    results.forEach(item => {
      totalPrice += item.price;
    });

    // 3. 插入新的訂單資料
    const orderQuery = `INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, 'pending')`;
    con.query(orderQuery, [userId, totalPrice], (err, orderResult) => {
      if (err) {
        console.error("Error inserting order:", err.message);
        return res.status(500).send({ message: "創建訂單失敗" });
      }

      const deleteItemsQuery = `DELETE FROM order_items WHERE user_id = ?`;
      con.query(deleteItemsQuery, [userId], (err) => {
        if (err) {
          console.error("Database query error:", err.message);
          return res.status(500).send({ message: "刪除購物車項目失敗" });
        }
      })
      res.send({ success: true, message: "訂單已成功創建，請前往付款頁面！" });
    });
  });
});

app.get('/get-order-details', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).send({ message: "未登入，請先登入。" });
  }

  const userId = user.id;

  // 檢查 orders 資料表中是否有正確的 created_at 欄位
  const query = `SELECT id, total_price, status, created_at 
                 FROM orders 
                 WHERE user_id = ? AND status = 'pending' 
                 ORDER BY created_at DESC LIMIT 1`;

  con.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).send({ message: "查詢訂單詳情失敗" });
    }

    // 如果查詢結果為空，返回訂單不存在的錯誤訊息
    if (results.length === 0) {
      console.log("No pending orders found for user ID:", userId); // 日誌紀錄
      return res.status(400).send({ message: "沒有待付款的訂單" });
    }

    // 成功返回訂單資料
    console.log("Found pending order:", results[0]);
    res.send({ order: results[0] }); 
  });
});

app.get('/cal',(req,res)=>{
  let{a,b}=req.query;
  let c=Number(a)+Number(b);
  let ans=JSON.stringify(req.session.我員卡列);
  res.send("DONE:"+c+"<br>"+ans);
});
app.get('/cal2', (req, res) => {
  let{a,b}=req.query;  
  res.render('cal2', { a,b });
});

app.listen(3000,()=>{M.dog(`Server is running at http://localhost`);});

/*const http = require('http');
http.createServer((req, res) => {res.writeHead(301,{Location: `https://${req.headers.host}${req.url}`});res.end();}).listen(80, () => {console.log('HTTP server is running on port 80 and redirecting to HTTPS');});

const https = require('https');
const fs = require('fs');
const options = {
  key:  fs.readFileSync('certbot/a8919.duckdns.org/privkey.pem'),
  cert: fs.readFileSync('certbot/a8919.duckdns.org/fullchain.pem')
};
https.createServer(options, app).listen(443, () => {console.log('HTTPS server is running on port 443');});*/
