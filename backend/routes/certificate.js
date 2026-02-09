const express = require('express');
const router = express.Router();
const multer = require('multer');
const certificateController = require('../controllers/certificateController');

const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed!'), false);
        }
    }
});

router.post('/mint', upload.single('file'), certificateController.mintCertificate);
router.post('/confirm', certificateController.confirmCertificate);
router.get('/my', certificateController.getMyCertificates);
router.get('/all', certificateController.getAllCertificates);

module.exports = router;
