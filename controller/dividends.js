const { connection } = require('../database');

exports.getDividends = (req, res) => {
    connection.query('SELECT * FROM `dividends`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getDividend = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `dividends` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addDividend = async (req, res) => {
    try {
        const { stock_id, dividend, emp_id, created_date, updated_date } = req.body;

        // ลบการตรวจสอบ dividend ที่มีอยู่แล้ว
        const dividendData = {
            stock_id,
            dividend,
            emp_id,
            created_date,
            updated_date,
        };

        connection.query('INSERT INTO `dividends` SET ?',
            [dividendData], function (err, results) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error adding dividend" });
                }
                res.json({ message: "New Dividend added", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateDividend = async (req, res) => {
    try {
        const { stock_id, dividend, emp_id } = req.body;
        const no = req.params.no;

        // ลบการตรวจสอบ dividend ที่มีอยู่แล้ว
        connection.query('UPDATE `dividends` SET `stock_id` = ?, `dividend` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
            [stock_id, dividend, emp_id, no], function (err, updateResults) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Internal server error" });
                }
                res.json({ message: "Dividend updated", updateResults });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


exports.deleteDividend = (req, res) => {
    try {
        const DividendNo = req.params.no;
        connection.query('DELETE FROM `dividends` WHERE no = ?',
            [DividendNo], function (err, results) {
                res.json({ message: "Dividend deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}