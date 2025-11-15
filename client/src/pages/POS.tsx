import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Cart from '../components/pos/Cart';
import Receipt from '../components/pos/Receipt';
import api from '../utils/api';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Digital'>('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      // Check stock
      if (existingItem.quantity >= product.stock_quantity) {
        alert('Insufficient stock');
        return;
      }
      updateCartQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.stock_quantity <= 0) {
        alert('Product out of stock');
        return;
      }
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          quantity: 1,
          unit_price: product.price,
          subtotal: product.price
        }
      ]);
    }
    setSearchTerm('');
    setFilteredProducts([]);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      alert('Insufficient stock');
      return;
    }

    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity,
            subtotal: item.unit_price * quantity
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Clear cart?')) {
      setCart([]);
      setAmountPaid('');
      setNotes('');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paid < 0) {
      alert('Amount paid cannot be negative');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/sales', {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        amount_paid: paid,
        notes: notes || null
      });

      if (response.data.success) {
        setReceipt(response.data.data);
        setCart([]);
        setAmountPaid('');
        setNotes('');
        setSearchTerm('');
        fetchProducts(); // Refresh products to update stock
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process sale';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const paid = parseFloat(amountPaid) || 0;
  const due = total - paid;

  if (receipt) {
    return (
      <div className="p-6">
        <Receipt
          sale={receipt}
          items={receipt.items}
          onClose={() => setReceipt(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <Header title="Point of Sale" />

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-status-error bg-opacity-10 border border-status-error text-status-error rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Search */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-border-light rounded p-4">
              <Input
                label="Search Products"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              {filteredProducts.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto border border-border-light rounded">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity <= 0}
                      className={`w-full text-left px-4 py-3 border-b border-border-light hover:bg-bg-secondary ${
                        product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-text-secondary">
                            {product.sku} - ${product.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-sm text-text-secondary">
                          Stock: {product.stock_quantity}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Cart
              items={cart}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateCartQuantity}
            />
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-4">
            <div className="bg-white border border-border-light rounded p-4">
              <h3 className="text-lg font-bold text-text-primary mb-4">Payment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Cash"
                        checked={paymentMethod === 'Cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Digital')}
                      />
                      <span>Cash</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="Digital"
                        checked={paymentMethod === 'Digital'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Digital')}
                      />
                      <span>Digital</span>
                    </label>
                  </div>
                </div>

                <div className="text-3xl font-bold text-center py-4 border-t border-b border-border-light">
                  Total: ${total.toFixed(2)}
                </div>

                <Input
                  label="Amount Paid"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                />

                {due > 0 && (
                  <div className="p-3 bg-status-warning bg-opacity-10 border border-status-warning rounded">
                    <p className="text-sm font-semibold">Amount Due:</p>
                    <p className="text-xl font-bold">${due.toFixed(2)}</p>
                  </div>
                )}

                {due < 0 && (
                  <div className="p-3 bg-status-info bg-opacity-10 border border-status-info rounded">
                    <p className="text-sm font-semibold">Change:</p>
                    <p className="text-xl font-bold">${Math.abs(due).toFixed(2)}</p>
                  </div>
                )}

                <Input
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  as="textarea"
                  rows={3}
                />

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={clearCart}
                    className="flex-1"
                    disabled={cart.length === 0 || loading}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    onClick={handleProcessSale}
                    className="flex-1"
                    disabled={cart.length === 0 || loading}
                  >
                    {loading ? 'Processing...' : 'Process Sale'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;


