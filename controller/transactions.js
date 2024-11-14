const { connection } = require('../database');

exports.getTransactions = (req, res) => {
    connection.query('SELECT * FROM `transactions`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getTransaction = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `transactions` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addTransaction = async (req, res) => {
    try {
        const { stock_detail_id, type, amount, price, commission_id, from_id, emp_id, created_date, updated_date } = req.body;
        
        const detailData = {
            stock_detail_id,
            type,
            amount,
            price,
            commission_id,
            from_id,
            emp_id,
            created_date,
            updated_date,
        }
        
        connection.query('INSERT INTO `transactions` SET ?', [detailData], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error adding detail" });
            }
            res.json({ message: "New Transaction added", results });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateTransaction = async (req, res) => {
    try {
        const { stock_detail_id, type, amount, price,commission_id, emp_id } = req.body;
        const detailNo = req.params.no;

        connection.query('UPDATE `transactions` SET `stock_detail_id`= ?, `type`= ?, `amount`= ?, `price`= ?, `commission_id`= ?, `emp_id`= ?, `updated_date`= NOW() WHERE no = ?',
            [stock_detail_id, type, amount, price, commission_id, emp_id, detailNo], function (err, results) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error updating detail" });
                }
                res.json({ message: "Transaction updated", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteTransaction = (req, res) => {
    try {
        const detailNo = req.params.no;
        connection.query('DELETE FROM `transactions` WHERE no = ?',
            [detailNo], function (err, results) {
                res.json({ message: "Transaction deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}