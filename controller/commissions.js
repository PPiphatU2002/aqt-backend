const { connection } = require('../database');

exports.getCommissions = (req, res) => {
    connection.query('SELECT * FROM `commissions`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getCommission = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `commissions` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addCommission = async (req, res) => {
    try {
        const { commission, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `commissions` WHERE `commission` = ?',
            [commission], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "Commission already exists" });
                } else {
                    const commissionData = {
                        commission,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `commissions` SET ?',
                        [commissionData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding commission" });
                            }
                            res.json({ message: "New Commission added", results });
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

exports.updateCommission = async (req, res) => {
    try {
        const { commission, emp_id } = req.body;
        const no = req.params.no;
        connection.query('SELECT * FROM `commissions` WHERE `commission` = ? AND no != ?', [commission, no], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "Commission already exists" });
            }
            connection.query('UPDATE `commissions` SET `commission` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
                [commission, emp_id, no], function (err, updateResults) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    res.json({ message: "Commission updated", updateResults });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteCommission = (req, res) => {
    try {
        const CommissionNo = req.params.no;
        connection.query('DELETE FROM `commissions` WHERE no = ?',
            [CommissionNo], function (err, results) {
                res.json({ message: "Commission deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}