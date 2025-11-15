import { query, queryOne, run } from '../config/database.js';

/**
 * Get all products with optional filters
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, low_stock } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      const searchTerm = `%${search}%`;
      sql += ` AND (name LIKE $${params.length + 1} OR sku LIKE $${params.length + 2} OR description LIKE $${params.length + 3})`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (low_stock === 'true') {
      // No parameter needed for this condition
    }

    sql += ' ORDER BY name ASC';

    const products = await query(sql, params);

    res.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      code: 'GET_PRODUCTS_ERROR'
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await queryOne('SELECT * FROM products WHERE id = $1', [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product',
      code: 'GET_PRODUCT_ERROR'
    });
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      price,
      cost_price,
      stock_quantity,
      low_stock_threshold,
      category
    } = req.body;

    // Validation
    if (!name || !sku || price === undefined || cost_price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, SKU, price, and cost_price are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (price < 0 || cost_price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price and cost_price must be positive numbers',
        code: 'INVALID_PRICE'
      });
    }

    // Check if SKU already exists
    const existingProduct = await queryOne('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists',
        code: 'SKU_EXISTS'
      });
    }

    const result = await queryOne(
      `INSERT INTO products (name, sku, description, price, cost_price, stock_quantity, low_stock_threshold, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        name,
        sku,
        description || null,
        price,
        cost_price,
        stock_quantity || 0,
        low_stock_threshold || 10,
        category || null
      ]
    );

    const newProduct = await queryOne('SELECT * FROM products WHERE id = $1', [result.id]);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      code: 'CREATE_PRODUCT_ERROR'
    });
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      price,
      cost_price,
      stock_quantity,
      low_stock_threshold,
      category
    } = req.body;

    // Check if product exists
    const existingProduct = await queryOne('SELECT * FROM products WHERE id = $1', [id]);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check if SKU is being changed and if it already exists
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await queryOne('SELECT id FROM products WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuExists) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists',
          code: 'SKU_EXISTS'
        });
      }
    }

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a positive number',
        code: 'INVALID_PRICE'
      });
    }

    if (cost_price !== undefined && cost_price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Cost price must be a positive number',
        code: 'INVALID_COST_PRICE'
      });
    }

    await run(
      `UPDATE products 
        SET name = COALESCE($1, name),
           sku = COALESCE($2, sku),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           cost_price = COALESCE($5, cost_price),
           stock_quantity = COALESCE($6, stock_quantity),
           low_stock_threshold = COALESCE($7, low_stock_threshold),
           category = COALESCE($8, category),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        name || null,
        sku || null,
        description !== undefined ? description : null,
        price !== undefined ? price : null,
        cost_price !== undefined ? cost_price : null,
        stock_quantity !== undefined ? stock_quantity : null,
        low_stock_threshold !== undefined ? low_stock_threshold : null,
        category !== undefined ? category : null,
        id
      ]
    );

    const updatedProduct = await queryOne('SELECT * FROM products WHERE id = $1', [id]);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      code: 'UPDATE_PRODUCT_ERROR'
    });
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await queryOne('SELECT * FROM products WHERE id = $1', [id]);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    await run('DELETE FROM products WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      code: 'DELETE_PRODUCT_ERROR'
    });
  }
};


