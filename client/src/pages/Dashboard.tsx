import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import DashboardCard from '../components/dashboard/DashboardCard';
import Table from '../components/common/Table';
import api from '../utils/api';

interface DashboardStats {
  todaySales: { count: number; revenue: number };
  monthSales: { count: number; revenue: number };
  lowStockCount: number;
  lowStockProducts: any[];
  recentSales: any[];
  topProducts: any[];
  salesTrend: any[];
  monthlyExpenses: number;
  netProfit: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="text-center text-text-secondary">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="p-3 bg-status-error bg-opacity-10 border border-status-error text-status-error rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const recentSalesColumns = [
    {
      header: 'Sale Number',
      accessor: 'sale_number' as keyof typeof stats.recentSales[0]
    },
    {
      header: 'Date',
      accessor: (row: any) => formatDate(row.sale_date)
    },
    {
      header: 'Cashier',
      accessor: 'cashier_name' as keyof typeof stats.recentSales[0]
    },
    {
      header: 'Total',
      accessor: (row: any) => formatCurrency(row.total_amount)
    },
    {
      header: 'Status',
      accessor: 'payment_status' as keyof typeof stats.recentSales[0]
    }
  ];

  const lowStockColumns = [
    {
      header: 'Product',
      accessor: 'name' as keyof any
    },
    {
      header: 'SKU',
      accessor: 'sku' as keyof any
    },
    {
      header: 'Stock',
      accessor: 'stock_quantity' as keyof any
    },
    {
      header: 'Threshold',
      accessor: 'low_stock_threshold' as keyof any
    }
  ];

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard
            title="Today's Sales"
            value={stats.todaySales.count}
            subtitle={formatCurrency(stats.todaySales.revenue)}
          />
          <DashboardCard
            title="Monthly Sales"
            value={stats.monthSales.count}
            subtitle={formatCurrency(stats.monthSales.revenue)}
          />
          <DashboardCard
            title="Monthly Expenses"
            value={formatCurrency(stats.monthlyExpenses)}
          />
          <DashboardCard
            title="Net Profit"
            value={formatCurrency(stats.netProfit)}
            className={stats.netProfit >= 0 ? '' : 'border-status-error'}
          />
          <DashboardCard
            title="Low Stock Alert"
            value={stats.lowStockCount}
            subtitle="products need restocking"
            icon={<span className="text-2xl">⚠️</span>}
            className={stats.lowStockCount > 0 ? 'border-status-warning' : ''}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="bg-white border border-border-light rounded p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Sales Trend (Last 7 Days)</h3>
            {stats.salesTrend.length > 0 ? (
              <div className="space-y-2">
                {stats.salesTrend.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-text-secondary">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="bg-black h-6"
                          style={{
                            width: `${(day.revenue / Math.max(...stats.salesTrend.map((d: any) => d.revenue))) * 100}%`
                          }}
                        />
                        <span className="text-sm font-semibold">
                          {formatCurrency(day.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-8">No sales data available</p>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white border border-border-light rounded p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Top 5 Products (Last 30 Days)</h3>
            {stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product: any) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-text-secondary">{product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(product.total_revenue)}</div>
                      <div className="text-sm text-text-secondary">
                        {product.total_quantity} sold
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-8">No product data available</p>
            )}
          </div>
        </div>

        {/* Quick Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white border border-border-light rounded p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Recent Sales</h3>
            <Table
              columns={recentSalesColumns}
              data={stats.recentSales}
              emptyMessage="No recent sales"
            />
          </div>

          {/* Low Stock Products */}
          <div className="bg-white border border-border-light rounded p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Low Stock Products</h3>
            {stats.lowStockCount > 0 ? (
              <>
                <p className="text-text-secondary text-sm mb-4">
                  Showing first 5 of {stats.lowStockCount} low stock products
                </p>
                <Table
                  columns={lowStockColumns}
                  data={stats.lowStockProducts}
                  emptyMessage="No low stock products"
                />
              </>
            ) : (
              <p className="text-text-secondary text-center py-8">All products are well stocked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
