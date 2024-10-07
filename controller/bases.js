const { connection } = require('../database');

exports.getBases = (req, res) => {
    connection.query('SELECT * FROM `bases`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getBase = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `bases` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addBase = async (req, res) => {
    try {
        const { base, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `bases` WHERE `base` = ?',
            [base], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "Base already exists" });
                } else {
                    const baseData = {
                        base,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `bases` SET ?',
                        [baseData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding base" });
                            }
                            res.json({ message: "New Base added", results });
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

exports.updateBase = async (req, res) => {
    try {
        const { base, emp_id } = req.body;
        const no = req.params.no;
        connection.query('SELECT * FROM `bases` WHERE `base` = ? AND no != ?', [base, no], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "Base already exists" });
            }
            connection.query('UPDATE `bases` SET `base` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
                [base, emp_id, no], function (err, updateResults) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    res.json({ message: "Base updated", updateResults });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteBase = (req, res) => {
    try {
        const BaseNo = req.params.no;
        connection.query('DELETE FROM `bases` WHERE no = ?',
            [BaseNo], function (err, results) {
                res.json({ message: "Base deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}