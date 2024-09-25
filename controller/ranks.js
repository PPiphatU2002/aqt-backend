const { connection } = require('../database');

exports.getRanks = (req, res) => {
    connection.query('SELECT * FROM `ranks`', 
        function(err, results, fields) {
            res.json(results);
        }
    );
}

exports.getRank = (req, res) => {
    const no = req.params.no;
    connection.query('SELECT * FROM `ranks` WHERE `no` = ?', 
        [no], function(err, results) {
            res.json(results);
        }
    );
}

exports.addRank = (req, res) => {
    try {
        const { name } = req.body;
        connection.query("INSERT INTO `ranks`(`name`) VALUES (?)", 
            [name], function(err, results) {
                res.json(results);
            }
        );

        console.log("Rank added successfully");

    } catch (error) {
        console.log("Add Rank error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateRank = (req, res) => {
    try {
        const { name } = req.body;
        connection.query("UPDATE `ranks` SET `name` = ? , `updated_date`= now() WHERE no = ?", 
            [name, req.params.no], function(err, results) {
            res.json(results);
        }
    );
        console.log("Rank updated successfully");

    } catch (error) {
        console.log("Update Rank error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteRank = (req, res) => {
    try {
        const RankId = req.params.no;
        connection.query('DELETE FROM `ranks` WHERE no = ?', [RankId], function(err, results) {
            res.json(results);
        }
    );

        console.log("Rank deleted successfully");

    } catch (error) {
        console.log("Delete Rank error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}