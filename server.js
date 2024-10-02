// server.js
require('dotenv').config();

const fs = require('fs');
const { spawn } = require('child_process');
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
const customerRoutes = require('./routes/customer');
const typeRoutes = require('./routes/type');
const formRoutes = require('./routes/from');
const stockRoutes = require('./routes/stock');
const setRoutes = require('./routes/set');

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
app.use('/customer', customerRoutes);
app.use('/type', typeRoutes);
app.use('/from', formRoutes);
app.use('/stock', stockRoutes);
app.use('/set', setRoutes);

// สร้าง route ทดสอบ
app.get('/', (req, res) => {
    console.log('The AI Quant Tech API Is Working');
    res.send('The AI Quant Tech API Is Working');
});

let pythonProcess;
app.get('/run-closeprice', (req, res) => {
    console.log("Received request to run Close_Price.py");

    const pythonScriptPath = path.join(__dirname, 'datafeed', 'Close_Price.py');
    pythonProcess = spawn('python', [pythonScriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        if (code === 0) {
            const filePath = path.join(__dirname, 'datafeed', 'last_day_close_prices.csv');
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading CSV file:', err);
                    return res.status(500).send('Error reading CSV file');
                }
                res.setHeader('Content-Type', 'text/csv');
                res.send(data);
            });
        } else {
            console.error(`Error: Python script exited with code ${code}`);
            res.status(500).send('Error running Python script');
        }
    });
});

// Route สำหรับยกเลิกการทำงานของ Python script
app.post('/cancel-closeprice', (req, res) => {
    if (pythonProcess) {
        pythonProcess.kill('SIGINT'); // ยกเลิก process
        pythonProcess = null; // รีเซ็ตตัวแปร pythonProcess
        console.log('Python script has been canceled.');
        res.send('Python script has been canceled.');
    } else {
        res.status(400).send('No running Python script to cancel.');
    }
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
