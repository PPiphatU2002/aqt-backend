const { connection } = require('../database');

exports.getStocks = (req, res) => {
    connection.query('SELECT * FROM `stocks`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getStock = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `stocks` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addStock = async (req, res) => {
    try {
        const { name, set_id, dividend_amount, closing_price, comment, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `stocks` WHERE `name` = ?',
            [name], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "Name already exists" });
                } else {
                    const customerData = {
                        name,
                        set_id,
                        dividend_amount,
                        closing_price,
                        comment,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `stocks` SET ?',
                        [customerData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding stock" });
                            }
                            res.json({ message: "New Stock added", results });
                        }
                    );
                }
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateStock = async (req, res) => {
    try {
        const { name, set_id, dividend_amount, closing_price, comment, emp_id } = req.body;
        const stockId = req.params.no;
        const [existingStocks] = await connection.promise().query('SELECT * FROM `stocks` WHERE `name` = ? AND `no` != ?', [name, stockId]);
        if (existingStocks.length > 0) {
            return res.status(400).json({ message: "Name already exists" });
        }
        const updatedData = {
            name,
            set_id,
            dividend_amount,
            closing_price,
            comment,
            emp_id,
            updated_date: new Date()
        };

        connection.query("UPDATE `stocks` SET ? WHERE `no` = ?", [updatedData, stockId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating stock" });
            }
            res.json({ message: "Stock updated successfully", results });
        });

    } catch (error) {
        console.log("Update Stock error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteStock = (req, res) => {
    try {
        const StockId = req.params.no;
        connection.query('DELETE FROM `stocks` WHERE no = ?', [StockId], function (err, results) {
            res.json(results);
        }
        );

        console.log("Stock deleted successfully");

    } catch (error) {
        console.log("Delete Stock error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateClosePriceByName = async (req, res) => {
    try {
        const { name, closing_price, emp_id  } = req.body;

        const [existingStocks] = await connection.promise().query('SELECT * FROM `stocks` WHERE `name` = ?', [name]);
        if (existingStocks.length === 0) {
            return res.status(404).json({ message: "ไม่พบหุ้นที่มีชื่อดังกล่าว" });
        }

        const updatedData = {
            emp_id,
            closing_price,
            updated_date: new Date()
        };

        connection.query("UPDATE `stocks` SET ? WHERE `name` = ?", [updatedData, name], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตราคาปิด" });
            }
            res.json({ message: "อัปเดตราคาปิดสำเร็จ", results });
        });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการอัปเดตราคาปิด", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}

exports.updateDividendYieldByName = async (req, res) => {
    try {
        const { name, dividend_amount, emp_id  } = req.body;

        const [existingStocks] = await connection.promise().query('SELECT * FROM `stocks` WHERE `name` = ?', [name]);
        if (existingStocks.length === 0) {
            return res.status(404).json({ message: "ไม่พบหุ้นที่มีชื่อดังกล่าว" });
        }

        const updatedData = {
            emp_id,
            dividend_amount,
            updated_date: new Date()
        };

        connection.query("UPDATE `stocks` SET ? WHERE `name` = ?", [updatedData, name], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "เกิดข้อผิดพลาดในการจำนวนปันผล" });
            }
            res.json({ message: "อัปเดตจำนวนปันผลสำเร็จ", results });
        });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการจำนวนปันผล", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
    }
}
