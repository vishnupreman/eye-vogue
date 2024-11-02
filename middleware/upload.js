const multer = require('multer')
const path = require('path')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads')
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueName + path.extname(file.originalname))
//     }
// })


// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 1024 * 1024 * 5 },
//     fileFilter: (req, file, cb) => {
//         const fileTypes = /jpeg|jpg|png|webp|avif/;
//         const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = fileTypes.test(file.mimetype);
//         if (extname && mimetype) {
//             return cb(null, true);
//         } else {
//             cb(new Error('Only images are allowed'));
//         }
//     }
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5 MB limit
});


module.exports = upload;
