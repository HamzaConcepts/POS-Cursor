import { query, queryOne } from '../config/database.js';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split('T')[0];

    // Today's sales
    const todaySales = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE DATE(sale_date) = $1`,
      [today]
    );

    // This month's sales
    const monthSales = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE DATE(sale_date) >= $1`,
      [startOfMonth]
    );

    // Low stock products count and list
    const lowStockCount = await queryOne(
      `SELECT COUNT(*) as count
       FROM products
       WHERE stock_quantity <= low_stock_threshold`
    );

    const lowStockProducts = await query(
      `SELECT id, name, sku, stock_quantity, low_stock_threshold
       FROM products
       WHERE stock_quantity <= low_stock_threshold
       ORDER BY stock_quantity ASC
       LIMIT 5`
    );

    // Recent sales (last 10)
    const recentSales = await query(
      `SELECT s.*, u.full_name as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.cashier_id = u.id
       ORDER BY s.sale_date DESC
       LIMIT 10`
    );

    // Top selling products (last 30 days)
    const topProducts = await query(
      `SELECT 
         p.id,
         p.name,
         p.sku,
         SUM(si.quantity) as total_quantity,
         SUM(si.subtotal) as total_revenue
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       JOIN products p ON si.product_id = p.id
       WHERE DATE(s.sale_date) >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY p.id, p.name, p.sku
       ORDER BY total_revenue DESC
       LIMIT 5`
    );

    // Sales trend (last 7 days)
    const salesTrend = await query(
      `SELECT 
         DATE(sale_date) as date,
         COUNT(*) as count,
         COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE DATE(sale_date) >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(sale_date)
       ORDER BY date ASC`
    );

    // Monthly expenses
    const monthlyExpenses = await queryOne(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM expenses
        WHERE DATE(expense_date) >= $1`,
      [startOfMonth]
    );

    // Monthly revenue for net profit calculation
    const monthlyRevenue = monthSales[0]?.revenue || 0;
    const monthlyExpensesTotal = monthlyExpenses?.total || 0;
    const netProfit = monthlyRevenue - monthlyExpensesTotal;

    res.json({
      success: true,
      data: {
        todaySales: {
          count: todaySales[0]?.count || 0,
          revenue: parseFloat(todaySales[0]?.revenue || 0)
        },
        monthSales: {
          count: monthSales[0]?.count || 0,
          revenue: parseFloat(monthSales[0]?.revenue || 0)
        },
        lowStockCount: lowStockCount?.count || 0,
        lowStockProducts,
        recentSales,
        topProducts,
        salesTrend,
        monthlyExpenses: parseFloat(monthlyExpensesTotal),
        netProfit: parseFloat(netProfit)
      },
      message: 'Dashboard stats retrieved successfully'
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard stats',
      code: 'GET_DASHBOARD_STATS_ERROR'
    });
  }
};

