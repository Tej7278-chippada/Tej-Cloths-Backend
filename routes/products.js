// routes/products.js
const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const router = express.Router();

// Multer setup for file uploads // Backend: Setting up Multer to accept a "media" field for images or videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder for storing files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Generate unique filename
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Add product
router.post('/add/products', upload.fields([{ name: 'media', maxCount: 5 }]), async (req, res) => {
  try {
    const { title, price, stockStatus, stockCount, gender, deliveryDays, description } = req.body;
    // Log incoming form data and file data
    console.log("Form data:", req.body);
    console.log("Files:", req.files);
    const mediaPaths = req.files['media'] ? req.files['media'].map(file => file.path) : [];

    const product = new Product({
      title,
      price,
      stockStatus,
      stockCount: stockStatus === 'In Stock' ? stockCount : undefined,
      gender,
      deliveryDays,
      description,
      media: mediaPaths,
    });
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Update product
router.put('/:id', upload.fields([{ name: 'media', maxCount: 5 }]), async (req, res) => {
  try {
    const { title, price, stockStatus, stockCount, gender, deliveryDays, description } = req.body;
    const mediaPaths = req.files['media'] ? req.files['media'].map(file => file.path) : null;

    const updateData = {
      title,
      price,
      stockStatus,
      stockCount: stockStatus === 'In Stock' ? stockCount : undefined,
      gender,
      deliveryDays,
      description,
    };

    if (mediaPaths) {
      updateData.media = mediaPaths;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
