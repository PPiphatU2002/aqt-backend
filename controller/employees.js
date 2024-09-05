const bcrypt = require("bcrypt");
const { connection } = require("../database");

exports.getEmployees = (req, res) => {
    connection.query('SELECT * FROM `employees`', 
        function(err, results, fields) {
            res.json(results);
        }  
    );
}

exports.getEmployee = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `employees` WHERE `no` = ?', 
        [no], function(err, results) {
            res.json(results);
        }
    );
}

exports.updateEmployeePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query('UPDATE `employees` SET `password`= ?, `updated_date`= now() WHERE no = ?',
            [hashedPassword, req.params.id], function(err, results) {
                res.json(results);
            }
        );

        console.log("Employee Password Updated Successfully");

    } catch (error) {
        console.log("Update Employee Password Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateEmployee = async (req, res) => {
    try {
        const { fname, lname, phone} = req.body;
        connection.query('UPDATE `employees` SET `fname`= ?, `lname`= ?, `phone`= ?, `updated_date`= now() WHERE no = ?',
            [fname, lname, phone , req.params.no], function(err, results) {
                res.json(results);
            }
        );

        console.log("Employee Updated Successfully");

    } catch (error) {
        console.log("Update Employee Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.updateEmployeeAll = async (req, res) => {
    try {
        const {  email, fname, lname, ranks_id, phone } = req.body;
        connection.query('UPDATE `employees` SET  `email`= ?, `fname`= ?, `lname`= ?, `ranks_id`= ?, `phone`= ?, `updated_date`= now() WHERE id = ?',
            [email, fname, lname, ranks_id, phone, req.params.no], function(err, results) {
                res.json(results);
            }
        );

        console.log("User Updated Successfully");

    } catch (error) {
        console.log("Update User Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteEmployee = (req, res) => {
    try {
        const EmployeeId = req.params.no;
        connection.query('DELETE FROM `employees` WHERE no = ?', 
            [EmployeeId], function(err, results) {
                res.json({ message: "Employee Deleted", results });
            }
        );

    } catch (error) {
        console.log("Delete Employee Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
