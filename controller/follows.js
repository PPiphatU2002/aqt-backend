const { connection } = require('../database');

exports.getFollows = (req, res) => {
    connection.query('SELECT * FROM `stocks_follow`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getFollow = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `stocks_follow` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.addFollow = async (req, res) => {
    try {
        const { name, set_id, dividend_amount, closing_price, comment, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `stocks_follow` WHERE `name` = ?',
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
                    connection.query('INSERT INTO `stocks_follow` SET ?',
                        [customerData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding stock" });
                            }
                            res.json({ message: "New Follow added", results });
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

exports.updateFollow = async (req, res) => {
    try {
        const { name, set_id, dividend_amount, closing_price, comment, emp_id } = req.body;
        const stockId = req.params.no;
        const [existingFollows] = await connection.promise().query('SELECT * FROM `stocks_follow` WHERE `name` = ? AND `no` != ?', [name, stockId]);
        if (existingFollows.length > 0) {
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

        connection.query("UPDATE `stocks_follow` SET ? WHERE `no` = ?", [updatedData, stockId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating stock" });
            }
            res.json({ message: "Follow updated successfully", results });
        });

    } catch (error) {
        console.log("Update Follow error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteFollow = (req, res) => {
    try {
        const FollowId = req.params.no;
        connection.query('DELETE FROM `stocks_follow` WHERE no = ?', [FollowId], function (err, results) {
            res.json(results);
        }
        );

        console.log("Follow deleted successfully");

    } catch (error) {
        console.log("Delete Follow error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

