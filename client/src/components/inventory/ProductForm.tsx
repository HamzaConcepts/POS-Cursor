import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

interface Product {
  id?: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  category: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    cost_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 10,
    category: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || 0,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 10,
        category: product.category || ''
      });
    }
  }, [product]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.cost_price < 0) {
      newErrors.cost_price = 'Cost price cannot be negative';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = 'Low stock threshold cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="SKU *"
          value={formData.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
          error={errors.sku}
          required
        />
      </div>

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        type="textarea"
        as="textarea"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price *"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          error={errors.price}
          required
        />

        <Input
          label="Cost Price *"
          type="number"
          step="0.01"
          min="0"
          value={formData.cost_price}
          onChange={(e) => handleChange('cost_price', parseFloat(e.target.value) || 0)}
          error={errors.cost_price}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          value={formData.stock_quantity}
          onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value) || 0)}
          error={errors.stock_quantity}
        />

        <Input
          label="Low Stock Threshold"
          type="number"
          min="0"
          value={formData.low_stock_threshold}
          onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 0)}
          error={errors.low_stock_threshold}
        />
      </div>

      <Input
        label="Category"
        value={formData.category}
        onChange={(e) => handleChange('category', e.target.value)}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;


