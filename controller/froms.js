const { connection } = require('../database');

exports.getFroms = (req, res) => {
    connection.query('SELECT * FROM `froms`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getFrom = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `froms` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addFrom = async (req, res) => {
    try {
        const { from, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `froms` WHERE `from` = ?',
            [from], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "From already exists" });
                } else {
                    const fromData = {
                        from,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `froms` SET ?',
                        [fromData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding from" });
                            }
                            res.json({ message: "New From added", results });
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

exports.updateFrom = async (req, res) => {
    try {
        const { from, emp_id } = req.body;
        const no = req.params.no;
        connection.query('SELECT * FROM `froms` WHERE `from` = ? AND no != ?', [from, no], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "From already exists" });
            }
            connection.query('UPDATE `froms` SET `from` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
                [from, emp_id, no], function (err, updateResults) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    res.json({ message: "From updated", updateResults });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteFrom = (req, res) => {
    try {
        const FromNo = req.params.no;
        connection.query('DELETE FROM `froms` WHERE no = ?',
            [FromNo], function (err, results) {
                res.json({ message: "From deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}