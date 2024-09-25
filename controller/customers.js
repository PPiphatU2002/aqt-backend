const { connection } = require('../database');

exports.getCustomers = (req, res) => {
    connection.query('SELECT * FROM `customers`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getCustomer = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `customers` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.getCustomersByType = (req, res) => {
    const typeNo = req.params.no;
    connection.query('SELECT * FROM `customers` WHERE `type_id` = ?',
        [typeNo], function (err, results) {
            res.json(results);
        }
    );
}

exports.addCustomer = async (req, res) => {
    try {
        const { id, nickname, type_id,  from_id, emp_id, created_date, updated_date } = req.body;
        connection.query('SELECT * FROM `customers` WHERE `id` = ?',
            [id], function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "ID already exists" });
                } else {
                    const customerData = {
                        id,
                        nickname,
                        type_id,
                        from_id,
                        emp_id,
                        created_date,
                        updated_date,
                    }
                    connection.query('INSERT INTO `customers` SET ?',
                        [customerData], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error adding customer" });
                            }
                            res.json({ message: "New Customer added", results });
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

exports.updateCustomer = async (req, res) => {
    try {
        const { id, nickname, type_id, from_id, emp_id } = req.body;
        const customerNo = req.params.no;
        connection.query('SELECT * FROM `customers` WHERE `id` = ? AND `no` != ?', [id, customerNo],
            function (err, results) {
                if (results.length > 0) {
                    return res.status(400).json({ message: "ID already exists for another customer" });
                } else {
                    connection.query('UPDATE `customers` SET `id`= ?, `nickname`= ?, `type_id`= ?, `from_id`= ?, `emp_id`= ?, `updated_date`= now() WHERE no = ?',
                        [id, nickname, type_id, from_id, emp_id, customerNo], function (err, results) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: "Error updating customer" });
                            }
                            res.json({ message: "Customer updated", results });
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


exports.deleteCustomer = (req, res) => {
    try {
        const customerNo = req.params.no;
        connection.query('DELETE FROM `customers` WHERE no = ?',
            [customerNo], function (err, results) {
                res.json({ message: "Customer deleted", results });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}