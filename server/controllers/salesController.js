import { query, queryOne, run } from '../config/database.js';

/**
 * Generate unique sale number
 */
function generateSaleNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SALE-${timestamp}-${random}`;
}

/**
 * Create a new sale
 */
export const createSale = async (req, res) => {
  try {
    const { items, payment_method, amount_paid, notes } = req.body;
    const cashier_id = req.user.id;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Sale must have at least one item',
        code: 'NO_ITEMS'
      });
    }

    if (!payment_method || !['Cash', 'Digital'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        error: 'Payment method must be Cash or Digital',
        code: 'INVALID_PAYMENT_METHOD'
      });
    }

    // Validate items and calculate total
    let total_amount = 0;
    const saleItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid product_id and quantity',
          code: 'INVALID_ITEM'
        });
      }

      // Get product details
      const product = await queryOne('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with id ${item.product_id} not found`,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Check stock availability
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
          code: 'INSUFFICIENT_STOCK'
        });
      }

      const subtotal = product.price * item.quantity;
      total_amount += subtotal;

      saleItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal,
        product
      });
    }

    // Validate payment
    const paid = amount_paid || 0;
    if (paid < 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount paid cannot be negative',
        code: 'INVALID_AMOUNT'
      });
    }

    const amount_due = total_amount - paid;
    let payment_status = 'Paid';
    if (amount_due > 0) {
      payment_status = paid > 0 ? 'Partial' : 'Pending';
    }

    // Create sale record
    const sale_number = generateSaleNumber();
    const saleResult = await queryOne(
      `INSERT INTO sales (sale_number, cashier_id, total_amount, payment_method, payment_status, amount_paid, amount_due, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [sale_number, cashier_id, total_amount, payment_method, payment_status, paid, amount_due, notes || null]
    );

    const sale_id = saleResult.id;

    // Create sale items and update stock
    for (const item of saleItems) {
      await run(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [sale_id, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );

      // Update product stock
      await run(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Get complete sale data with items
    const sale = await queryOne(
      `SELECT s.*, u.full_name as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       WHERE s.id = $1`,
      [sale_id]
    );

    const saleItemsData = await query(
      `SELECT si.*, p.name as product_name, p.sku
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [sale_id]
    );

    res.status(201).json({
      success: true,
      data: {
        ...sale,
        items: saleItemsData
      },
      message: 'Sale created successfully'
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sale',
      code: 'CREATE_SALE_ERROR'
    });
  }
};

/**
 * Get all sales with optional filters
 */
export const getSales = async (req, res) => {
  try {
    const { start_date, end_date, cashier_id } = req.query;
    let sql = `
      SELECT s.*, u.full_name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      sql += ` AND DATE(s.sale_date) >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND DATE(s.sale_date) <= $${params.length + 1}`;
      params.push(end_date);
    }

    if (cashier_id) {
      sql += ` AND s.cashier_id = $${params.length + 1}`;
      params.push(cashier_id);
    }

    sql += ' ORDER BY s.sale_date DESC';

    const sales = await query(sql, params);

    res.json({
      success: true,
      data: sales,
      message: 'Sales retrieved successfully'
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sales',
      code: 'GET_SALES_ERROR'
    });
  }
};

/**
 * Get a single sale by ID with items
 */
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await queryOne(
      `SELECT s.*, u.full_name as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        code: 'SALE_NOT_FOUND'
      });
    }

    const items = await query(
      `SELECT si.*, p.name as product_name, p.sku
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...sale,
        items
      },
      message: 'Sale retrieved successfully'
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sale',
      code: 'GET_SALE_ERROR'
    });
  }
};

/**
 * Add partial payment to a sale
 */
export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method } = req.body;
    const recorded_by = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number',
        code: 'INVALID_AMOUNT'
      });
    }

    const sale = await queryOne('SELECT * FROM sales WHERE id = $1', [id]);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        code: 'SALE_NOT_FOUND'
      });
    }

    // Add payment record
    await run(
      `INSERT INTO payments (sale_id, amount, payment_method, recorded_by)
       VALUES ($1, $2, $3, $4)`,
      [id, amount, payment_method || sale.payment_method, recorded_by]
    );

    // Update sale payment status
    const new_amount_paid = parseFloat(sale.amount_paid) + parseFloat(amount);
    const new_amount_due = parseFloat(sale.total_amount) - new_amount_paid;

    let payment_status = 'Paid';
    if (new_amount_due > 0) {
      payment_status = 'Partial';
    }

    await run(
      `UPDATE sales 
       SET amount_paid = $1, amount_due = $2, payment_status = $3
       WHERE id = $4`,
      [new_amount_paid, new_amount_due, payment_status, id]
    );

    const updatedSale = await queryOne('SELECT * FROM sales WHERE id = $1', [id]);

    res.json({
      success: true,
      data: updatedSale,
      message: 'Payment added successfully'
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment',
      code: 'ADD_PAYMENT_ERROR'
    });
  }
};


