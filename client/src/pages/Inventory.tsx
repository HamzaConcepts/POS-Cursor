import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import ProductForm from '../components/inventory/ProductForm';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  category: string;
}

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (lowStockOnly) params.append('low_stock', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      alert(errorMessage);
    }
  };

  const handleSubmit = async (productData: Omit<Product, 'id'>) => {
    try {
      setFormLoading(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const columns = [
    {
      header: 'SKU',
      accessor: 'sku' as keyof Product
    },
    {
      header: 'Name',
      accessor: 'name' as keyof Product
    },
    {
      header: 'Price',
      accessor: (row: Product) => `$${parseFloat(row.price.toString()).toFixed(2)}`
    },
    {
      header: 'Stock',
      accessor: (row: Product) => (
        <span
          className={
            row.stock_quantity <= row.low_stock_threshold
              ? 'text-status-error font-semibold'
              : ''
          }
        >
          {row.stock_quantity}
          {row.stock_quantity <= row.low_stock_threshold && (
            <span className="ml-2 text-xs">⚠ Low Stock</span>
          )}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Product
    },
    {
      header: 'Actions',
      accessor: (row: Product) => (
        <div className="flex gap-2">
          {canEdit && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                className="text-status-info hover:text-text-primary"
              >
                Edit
              </button>
              {user?.role === 'Manager' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.id);
                  }}
                  className="text-status-error hover:text-text-primary"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Header title="Inventory">
        {canEdit && <Button onClick={handleCreate}>Add Product</Button>}
      </Header>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-status-error bg-opacity-10 border border-status-error text-status-error rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-border-light rounded p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Category
              </label>
              <select
                className="w-full px-4 py-2 border border-border-light rounded focus:outline-none focus:border-black"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-text-primary">Low Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-border-light rounded">
          {loading ? (
            <div className="p-8 text-center text-text-secondary">Loading products...</div>
          ) : (
            <Table
              columns={columns}
              data={products}
              emptyMessage="No products found"
            />
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Inventory;


