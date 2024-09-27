const { connection } = require('../database');

exports.getSets = (req, res) => {
    connection.query('SELECT * FROM `sets`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getSet = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `sets` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addSet = async (req, res) => {
    try {
        const { set, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `sets` WHERE `set` = ?',
            [set], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "Set already exists" });
                } else {
                    const setData = {
                        set,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `sets` SET ?',
                        [setData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding set" });
                            }
                            res.json({ message: "New Set added", results });
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

exports.updateSet = async (req, res) => {
    try {
        const { set, emp_id } = req.body;
        const no = req.params.no;
        connection.query('SELECT * FROM `sets` WHERE `set` = ? AND no != ?', [set, no], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "Set already exists" });
            }
            connection.query('UPDATE `sets` SET `set` = ?, `emp_id` = ?, `updated_date` = now() WHERE no = ?',
                [set, emp_id, no], function (err, updateResults) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    res.json({ message: "Set updated", updateResults });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


exports.deleteSet = (req, res) => {
    try {
        const SetNo = req.params.no;
        connection.query('DELETE FROM `sets` WHERE no = ?',
            [SetNo], function (err, results) {
                res.json({ message: "Set deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}