import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Compliance documents (company certificate, VAT certificate, ID, address
// proof): images or PDF, 5 MB each. The controller re-checks the real file
// type from the file's bytes, this filter is only the first gate.
export const uploadDocs = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPEG, PNG and WEBP are allowed."), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
}).fields([
  { name: "companyCert", maxCount: 1 },
  { name: "vatCert", maxCount: 1 },
  { name: "authId", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
]);

export default upload;
