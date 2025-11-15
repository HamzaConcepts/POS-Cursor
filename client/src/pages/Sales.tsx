import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Input from '../components/common/Input';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import api from '../utils/api';

interface Sale {
  id: number;
  sale_number: string;
  sale_date: string;
  cashier_name: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  amount_due: number;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get(`/sales?${params.toString()}`);
      if (response.data.success) {
        setSales(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (sale: Sale) => {
    try {
      const response = await api.get(`/sales/${sale.id}`);
      if (response.data.success) {
        setSelectedSale(response.data.data);
        setIsModalOpen(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sale details';
      alert(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Paid: 'bg-black text-white',
      Partial: 'bg-status-warning text-white',
      Pending: 'bg-status-error text-white'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClasses[status as keyof typeof statusClasses] || ''}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Sale Number',
      accessor: 'sale_number' as keyof Sale
    },
    {
      header: 'Date',
      accessor: (row: Sale) => formatDateTime(row.sale_date)
    },
    {
      header: 'Cashier',
      accessor: 'cashier_name' as keyof Sale
    },
    {
      header: 'Total',
      accessor: (row: Sale) => formatCurrency(row.total_amount)
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method' as keyof Sale
    },
    {
      header: 'Status',
      accessor: (row: Sale) => getStatusBadge(row.payment_status)
    },
    {
      header: 'Actions',
      accessor: (row: Sale) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row);
          }}
          className="text-status-info hover:text-text-primary"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div>
      <Header title="Sales" />

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white border border-border-light rounded p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 text-text-secondary hover:text-text-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border border-border-light rounded">
          {loading ? (
            <div className="p-8 text-center text-text-secondary">Loading sales...</div>
          ) : (
            <Table
              columns={columns}
              data={sales}
              emptyMessage="No sales found"
            />
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSale(null);
        }}
        title={`Sale Details - ${selectedSale?.sale_number || ''}`}
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Sale Number:</p>
                <p className="font-semibold">{selectedSale.sale_number}</p>
              </div>
              <div>
                <p className="text-text-secondary">Date:</p>
                <p className="font-semibold">{formatDateTime(selectedSale.sale_date)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Cashier:</p>
                <p className="font-semibold">{selectedSale.cashier_name}</p>
              </div>
              <div>
                <p className="text-text-secondary">Payment Method:</p>
                <p className="font-semibold">{selectedSale.payment_method}</p>
              </div>
              <div>
                <p className="text-text-secondary">Status:</p>
                <p className="font-semibold">{getStatusBadge(selectedSale.payment_status)}</p>
              </div>
            </div>

            <div className="border-t border-b border-border-light py-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-border-light">
                      <td className="py-2">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-text-secondary">{item.sku}</div>
                      </td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right py-2 font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">{formatCurrency(selectedSale.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>{formatCurrency(selectedSale.amount_paid)}</span>
              </div>
              {selectedSale.amount_due > 0 && (
                <div className="flex justify-between text-status-error font-semibold">
                  <span>Amount Due:</span>
                  <span>{formatCurrency(selectedSale.amount_due)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;


