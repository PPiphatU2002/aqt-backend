const { connection } = require('../database');

exports.getDetails = (req, res) => {
    connection.query('SELECT * FROM `stocks_detail`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getDetail = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `stocks_detail` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addDetail = async (req, res) => {
    try {
        const { customer_id, stock_id, price, amount, money, balance_dividend, present_price, total, present_profit, percent, port, from_id, comment, emp_id, created_date, updated_date } = req.body;
        
        const detailData = {
            customer_id,
            stock_id,
            price,
            amount,
            money,
            balance_dividend,
            present_price,
            total,
            present_profit,
            percent,
            port,
            from_id,
            comment,
            emp_id,
            created_date,
            updated_date,
        }
        
        connection.query('INSERT INTO `stocks_detail` SET ?', [detailData], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error adding detail" });
            }
            res.json({ message: "New Detail added", results });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateDetail = async (req, res) => {
    try {
        const { customer_id, stock_id, price, amount, money, balance_dividend, present_price, total, present_profit, percent, port, from_id, comment, emp_id } = req.body;
        const detailNo = req.params.no;

        connection.query('UPDATE `stocks_detail` SET `customer_id`= ?, `stock_id`= ?, `price`= ?, `amount`= ?, `money`= ?, `balance_dividend`= ?, `present_price`= ?, `total`= ?, `present_profit`= ?, `percent`= ?, `port`= ?, `from_id`= ?, `comment`= ?, `emp_id`= ?, `updated_date`= NOW() WHERE no = ?',
            [customer_id, stock_id, price, amount, money, balance_dividend, present_price, total, present_profit, percent, port, from_id, comment, emp_id, detailNo], function (err, results) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error updating detail" });
                }
                res.json({ message: "Detail updated", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteDetail = (req, res) => {
    try {
        const detailNo = req.params.no;
        connection.query('DELETE FROM `stocks_detail` WHERE no = ?',
            [detailNo], function (err, results) {
                res.json({ message: "Detail deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}