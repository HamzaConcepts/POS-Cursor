import React from 'react';
import Button from '../common/Button';

interface ReceiptItem {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ReceiptProps {
  sale: {
    sale_number: string;
    sale_date: string;
    cashier_name: string;
    total_amount: number;
    payment_method: string;
    amount_paid: number;
    amount_due: number;
    payment_status: string;
  };
  items: ReceiptItem[];
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, items, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-border-light rounded p-6 max-w-2xl mx-auto">
      <div className="print:hidden mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Receipt</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center border-b border-border-light pb-4">
          <h1 className="text-3xl font-bold mb-2">POS System</h1>
          <p className="text-text-secondary">Receipt</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">Sale Number:</p>
            <p className="font-semibold">{sale.sale_number}</p>
          </div>
          <div>
            <p className="text-text-secondary">Date:</p>
            <p className="font-semibold">
              {new Date(sale.sale_date).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-text-secondary">Cashier:</p>
            <p className="font-semibold">{sale.cashier_name}</p>
          </div>
          <div>
            <p className="text-text-secondary">Payment Method:</p>
            <p className="font-semibold">{sale.payment_method}</p>
          </div>
        </div>

        <div className="border-t border-b border-border-light py-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-2">Item</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-border-light">
                  <td className="py-2">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-text-secondary">{item.sku}</div>
                  </td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                  <td className="text-right py-2 font-semibold">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 text-right">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">${sale.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span>${sale.amount_paid.toFixed(2)}</span>
          </div>
          {sale.amount_due > 0 && (
            <div className="flex justify-between text-status-error font-semibold">
              <span>Amount Due:</span>
              <span>${sale.amount_due.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold">{sale.payment_status}</span>
          </div>
        </div>

        <div className="text-center text-text-secondary text-sm pt-4 border-t border-border-light">
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;


