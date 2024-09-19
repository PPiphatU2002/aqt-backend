const bcrypt = require("bcrypt");
const { connection } = require("../database");

exports.getEmployees = (req, res) => {
    connection.query('SELECT * FROM `employees`',
        function (err, results, fields) {
            res.json(results);
        }
    );
}

exports.getEmployee = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `employees` WHERE `no` = ?',
        [no], function (err, results) {
            res.json(results);
        }
    );
}

exports.getEmployeeEmail = (req, res) => {
    const email = req.params.email;
    connection.query('SELECT * FROM `employees` WHERE `email` = ?', 
        [email], function (err, results) {
        res.json(results);
    }
    );
}

exports.getEmployeePhone = (req, res) => {
    const phone = req.params.phone;
    connection.query('SELECT * FROM `employees` WHERE `phone` = ?', 
        [phone], function (err, results) {
        res.json(results);
    }
    );
}

exports.updateEmployeePassword = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query('UPDATE `employees` SET `password`= ?, `updated_date`= now() WHERE no = ?',
            [hashedPassword, req.params.no], function (err, results) {
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
      console.log('Received data:', req.body);
      const { fname, lname, phone, gender } = req.body;
      connection.query('UPDATE `employees` SET `fname`= ?, `lname`= ?, `phone`= ?, `gender`= ?, `updated_date`= now() WHERE no = ?',
        [fname, lname, phone, gender, req.params.no], function (err, results) {
          if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).json({ message: 'Error updating employee' });
          }
          res.json(results);
        }
      );
      console.log('Employee Updated Successfully');
    } catch (error) {
      console.log('Update Employee Error', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  

  exports.updateEmployeeAll = async (req, res) => {
    try {
        const { email, fname, lname, ranks_id, phone, gender, status } = req.body;
        connection.query('SELECT * FROM `employees` WHERE `email` = ? AND `no` != ?', [email, req.params.no], (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            connection.query('UPDATE `employees` SET `email` = ?, `fname` = ?, `lname` = ?, `ranks_id` = ?, `phone` = ?, `gender` = ?, `status` = ?, `updated_date` = now() WHERE `no` = ?',
                [email, fname, lname, ranks_id, phone, gender, status, req.params.no], (err, results) => {
                    if (err) {
                        console.error('Error updating employee:', err);
                        return res.status(500).json({ message: 'Error updating employee' });
                    }
                    res.json(results);
                }
            );
            console.log("Employee Updated Successfully");
        });
    } catch (error) {
        console.log("Update Employee Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateEmployeeStatus = async (req, res) => {
    try {
        const { status} = req.body;
        connection.query('UPDATE `employees` SET `status` = ?, `updated_date` = now() WHERE `no` = ?',
            [status, req.params.no], function (err, results) {
                res.json(results);
            }
        );
        console.log("Employee Updated Successfully");
    } catch (error) {
        console.log("Update Employee Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.deleteEmployee = (req, res) => {
    try {
        const EmployeeId = req.params.no;
        connection.query('DELETE FROM `employees` WHERE no = ?',
            [EmployeeId], function (err, results) {
                res.json({ message: "Employee Deleted", results });
            }
        );

    } catch (error) {
        console.log("Delete Employee Error", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getEmployeesByStatus = (req, res) => {
    const type = req.params.no;
    connection.query('SELECT * FROM `employees` WHERE `status` = ?',
      [type], function (err, results) {
        res.json(results);
      }
    );
  }
