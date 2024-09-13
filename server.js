// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3001;
const DB_NAME = process.env.DB_NAME;

// สร้าง express app
const app = express();

// นำเข้า routes ที่เราสร้างไว้
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/log');
const fileRoutes = require('./routes/file');
const rankRoutes = require('./routes/rank');

// ใช้ cors สำหรับการทำ Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.HTTP,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
}));

// ใช้ middleware สำหรับการ parse ข้อมูลที่เข้ามาเป็น json
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ใช้ routes ที่เราสร้างไว้
app.use('/employee', employeeRoutes);
app.use('/auth', authRoutes);
app.use('/log', logRoutes);
app.use('/file', fileRoutes);
app.use('/rank', rankRoutes);

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
console.log('PORT:', process.env.PORT);
console.log('HTTP:', process.env.HTTP);
