const express = require('express');
const { Product, Category, sequelize } = require('../models/product');
const { Op } = require('sequelize');
const { validateProduct, checkContentType } = require('../middleware/validation');

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.status(200).json({ status: 200, message: 'OK' });
});

/**
 * CREATE A NEW PRODUCT
 */
router.post('/', checkContentType('application/json'), validateProduct, async (req, res) => {
    try {


        const product = await Product.create(req.body);


        const location = `/api/products/${product.id}`;
        res.status(201)
            .location(location)
            .json(product.serialize());

    } catch (error) {

        res.status(400).json({
            error: 'Bad Request',
            message: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { name } = req.query;
        const where = {};

        if (name) {
            where.name = name;
        }

        const products = await Product.findAll({ where });
        return res.status(200).json(products.map(p => p.serialize()));
    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});

// LIST PRODUCTS BY CATEGORY
router.get('/', async (req, res) => {
    try {
      const { category, name } = req.query;
      const where = {};
  
      if (name) {
        where.name = { [Op.iLike]: `%${name}%` };
      }
  
      if (category) {
        if (Object.values(Category).includes(category)) {
          where.category = category;
        } else {
          return res.status(200).json([]);
        }
      }
  
      const products = await Product.findAll({ where });
      res.status(200).json(products.map(p => p.serialize()));
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // LIST PRODUCTS (ALL FILTERS)
router.get('/', async (req, res) => {
    try {
      const { category, availability, name } = req.query;
      const where = {};
  
      if (name) {
        where.name = { [Op.iLike]: `%${name}%` };
      }
  
      if (availability) {
        where.available = availability === 'true';
      }
  
      if (category) {
        if (Object.values(Category).includes(category)) {
          where.category = category;
        } else {
          return res.status(200).json([]);
        }
      }
  
      const products = await Product.findAll({ where });
      res.status(200).json(products.map(p => p.serialize()));
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

router.get('/', async(req, res) => {
    const products = await Product.findAll();
    return res.status(200).json(products.map(p => p.serialize()));
})

router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByPk(productId);

        if (product) {
            return res.status(200).json(product.serialize());
        }
        else {
            return res.status(404).json({ error: "Not Found" });
        }


    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
})

router.put('/:id', checkContentType('application/json'), validateProduct, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = req.body;
        const dbProduct = await Product.findByPk(productId);

        if (dbProduct) {
            const updatedProduct = await dbProduct.update(product);
            return res.status(200)
            .json(updatedProduct.serialize());
        } else {
            return res.status(404).json({ error: "Not Found" });
        }

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByPk(productId);

        if(product) {
            await product.destroy();
            return res.status(204).json({message: "Product Deleted"});
        } else {
            return res.status(404).json({ error: "Not Found" });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
})



module.exports = router;