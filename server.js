//ประกาศใช้ไฟล์ .env
require('dotenv').config();

// นำเข้าโมดูลต่างๆ
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const URL = process.env.HTTP;
const port = process.env.port || 3001;
const DB_NAME = process.env.DB_NAME;

// สร้าง express app
const app = express();

// นำเข้า routes ที่เราสร้างไว้
const employeeRoutes = require("./routes/employee");
const authRoutes = require("./routes/auth");


// ใช้ cors สำหรับการทำ Cross-Origin Resource Sharing
// app.use(cors({ origin: URL, credentials: true }));

app.use(cors({
    origin: URL, // Allow from this origin
    credentials: true, // Allow credentials (cookies, etc.)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed methods
    allowedHeaders: 'Content-Type,Authorization', // Allowed headers
}));

// ใช้ middleware สำหรับการ parse ข้อมูลที่เข้ามาเป็น json

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ใช้ routes ที่เราสร้างไว้
app.use("/employee", employeeRoutes);
app.use('/auth', authRoutes);

// สร้าง route ทดสอบ
app.get('/', (req, res) => {
    console.log('The AI Quant Tech API Is Working');
    res.send('The AI Quant Tech API Is Working');
});
app.get('/test', (req, res) => {
    console.log('Server Is Running');
    res.send('Server Is Running');
});

// รัน server
app.listen(port, () => {
    console.log(`${DB_NAME} Is Running On Port ${port}`);
});

// แสดงค่าต่างๆที่อยู่ในไฟล์ .env
console.log('PORT:', process.env.port);
console.log('HTTP:', process.env.HTTP);