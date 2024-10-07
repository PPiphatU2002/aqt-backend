const { connection } = require('../database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const profileStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        const profileDir = path.join(__dirname, '../uploads/profile/');
            if (!fs.existsSync(profileDir)) {
                fs.mkdirSync(profileDir, { recursive: true });
            }
        callback(null, profileDir);
    },

    filename: function (req, file, callback) {
        const extension = file.originalname.split('.').pop();
        const baseName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
        let newFileName = file.originalname;

        fs.readdir(path.join(__dirname, '../uploads/profile/'), (err, files) => {
            if (err) {
                console.error('Error getting directory information:', err);
                callback(err);
            } else {
                let count = 1;
                while (files.includes(newFileName)) {
                    newFileName = `${baseName}_${count}.${extension}`;
                    count++;
                }
                callback(null, newFileName);
            }
        });
    }
});
const uploadProfile = multer({ storage: profileStorage });

exports.getProfile = (req, res) => {
    fs.readdir('./uploads/profile', (err, files) => {
        if (err) {
            console.error('Error getting directory information:', err);
            res.status(500).send('Internal server error');
        } else {
            res.json(files);
        }
    });
}

exports.readDefault = (req, res) => {
    const { picture } = req.params;
    res.sendFile(path.join(__dirname, `../uploads/default/${picture}`));
}

exports.readProfile = (req, res) => {
    const { picture } = req.params;
    res.sendFile(path.join(__dirname, `../uploads/profile/${picture}`));
}

exports.downloadProfile = (req, res) => {
    const { picture } = req.params;
    res.download(path.join(__dirname, `../uploads/profile/${picture}`));
}

exports.uploadProfile = (req, res) => {
    uploadProfile.single('file')(req, res, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            res.status(500).send('Internal server error');
        } else {
            res.json({
                message: 'File uploaded',
                file: req.file
            });
        }
    });
}

exports.updateProfile = async (req, res) => {
    try {
        const { no, picture } = req.body;
        connection.query('UPDATE employees SET picture = ?, updated_date = now() WHERE no = ?',
            [picture, no],function(err, results) {
                if (err) {
                    console.error('Error updating Profile:', err);
                    return res.status(500).send('Internal server error');
                }

                if (results.affectedRows === 0) {
                    return res.status(404).send('Profile not found or no changes made');
                }

                res.json({
                    message: 'Profile updated successfully',
                    results
                });
            }
        );
    } catch (error) {
        console.error('Error updating Profile:', error);
        res.status(500).send('Internal server error');
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        const { no } = req.params;
        const [employee] = await connection.promise().query('SELECT picture FROM employees WHERE no = ?', [no]);

        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const ProfilePath = path.join(__dirname, '../uploads/profile', employee[0].picture);

        if (fs.existsSync(ProfilePath)) {
            fs.unlinkSync(ProfilePath);
        } else {
            return res.status(404).json({ message: 'Profile not found' });
        }

        await connection.promise().query('UPDATE employees SET picture = NULL WHERE no = ?', [no]);

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete Profile', error });
    }
};
