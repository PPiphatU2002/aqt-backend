require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secret = process.env.secret;
const { connection } = require("../database");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    connection.query("SELECT * FROM `employees` WHERE `email` = ?", [email], async function (err, results) {
      if (err) {
        console.error("Login Error", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      const employeeData = results[0];

      if (!employeeData) {
        return res.status(400).json({ message: "Login Failed (Invalid E-Mail Or Password)" });
      }

      const match = await bcrypt.compare(password, employeeData.password);
      if (!match) {
        return res.status(400).json({ message: "Login Failed (Invalid E-Mail Or Password)" });
      }

      const token = jwt.sign({ email: employeeData.email, no: employeeData.no }, secret, { expiresIn: "3h" });
      res.cookie("token", token, {
        maxAge: 3600000,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "none",
      });

      res.json({ success: true, token: token });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.token;
    // console.log("token", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secret);
    const [results] = await connection.promise().query("SELECT * FROM employees WHERE no = ?", decoded.no);
    const employeeData = results[0];

    if (!employeeData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      user: {
        no: employeeData.no,
        fname: employeeData.fname,
        lname: employeeData.lname,
        email: employeeData.email,
        ranks_id: employeeData.ranks_id,
        status: employeeData.status,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ result: "Success", message: "Logout Successful" });
}

exports.register = async (req, res) => {
  try {
    const { email, password, fname, lname, ranks_id, phone, gender, status, created_date, updated_date } = req.body;
    connection.query('SELECT COUNT(*) AS count FROM employees WHERE email = ?', [email], async function (err, results) {
      if (err) {
        console.error('Error Checking E-mail:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results[0].count > 0) {
        return res.status(400).json({ message: 'E-Mail Already Exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const employeeData = {
        email,
        password: hashedPassword,
        fname,
        lname,
        ranks_id,
        phone,
        gender,
        status,
        created_date,
        updated_date,
      };

      connection.query('INSERT INTO employees SET ?', employeeData, function (err, results) {
        if (err) {
          console.error('Employee Creation Failed', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json({ message: 'Employee Created', results });
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};