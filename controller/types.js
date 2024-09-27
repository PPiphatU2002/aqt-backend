const { connection } = require('../database');

exports.getTypes = (req, res) => {
    connection.query('SELECT * FROM `types`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getType = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `types` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addType = async (req, res) => {
    try {
        const { type, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `types` WHERE `type` = ?',
            [type], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "Type already exists" });
                } else {
                    const typeData = {
                        type,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `types` SET ?',
                        [typeData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding type" });
                            }
                            res.json({ message: "New Type added", results });
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

exports.updateType = async (req, res) => {
    try {
        const { type, emp_id } = req.body;
        const no = req.params.no;
        connection.query('SELECT * FROM `types` WHERE `type` = ? AND no != ?', [type, no], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "Type already exists" });
            }
            connection.query('UPDATE `types` SET `type` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
                [type, emp_id, no], function (err, updateResults) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    res.json({ message: "Type updated", updateResults });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteType = (req, res) => {
    try {
        const TypeNo = req.params.no;
        connection.query('DELETE FROM `types` WHERE no = ?',
            [TypeNo], function (err, results) {
                res.json({ message: "Type deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}