import React from 'react';

interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const Cart: React.FC<CartProps> = ({ items, onRemoveItem, onUpdateQuantity }) => {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="bg-white border border-border-light rounded p-4">
      <h3 className="text-lg font-bold text-text-primary mb-4">Cart</h3>

      {items.length === 0 ? (
        <p className="text-text-secondary text-center py-8">Cart is empty</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Subtotal</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.product_id}
                    className={`border-b border-border-light ${index % 2 === 0 ? 'bg-white' : 'bg-bg-secondary'}`}
                  >
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-text-secondary">{item.sku}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">${item.unit_price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          onUpdateQuantity(item.product_id, qty);
                        }}
                        className="w-20 px-2 py-1 border border-border-light rounded"
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => onRemoveItem(item.product_id)}
                        className="text-status-error hover:text-text-primary"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border-light pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;


