import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads directory exists
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only PDF and Word docs are allowed.'))
    }
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

export const uploadImage = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp']
        const ext = path.extname(file.originalname).toLowerCase()
        if (allowedTypes.includes(ext)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.'))
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
})
