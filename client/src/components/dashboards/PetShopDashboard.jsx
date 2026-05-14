import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import DashboardSidebar from '../DashboardSidebar.jsx';
import './Dashboard.css';

function customerName(user) {
  if (!user) return 'Customer';
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Customer';
}

import { formatLKR } from '../../utils/currency.js';

function orderProductNames(order) {
  return order.items
    ?.map((item) => `${item.product?.name || 'Product'} x ${item.quantity}`)
    .join(', ') || 'No items';
}

const PetShopDashboard = () => {
  const [dashboard, setDashboard] = useState({ inventory: [], orders: [], summary: {} });
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    imageFile: null
  });
  const [loading, setLoading] = useState(true);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/market/shop/dashboard');
      setDashboard({
        inventory: data.inventory || [],
        orders: data.orders || [],
        summary: data.summary || {}
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shop dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingCodOrders = useMemo(() => (
    dashboard.orders.filter((order) =>
      order.paymentMethod === 'cod' &&
      order.paymentStatus === 'pending' &&
      order.orderStatus === 'placed'
    )
  ), [dashboard.orders]);

  const lowStockItems = useMemo(() => (
    dashboard.inventory.filter((item) => item.stock <= item.lowStockThreshold)
  ), [dashboard.inventory]);

  async function decideOrder(orderId, action) {
    setUpdatingId(orderId);
    setError('');
    setStatus('');
    try {
      const endpoint = action === 'approve' 
        ? `/market/shop/orders/${orderId}/approve` 
        : `/market/shop/orders/${orderId}/reject`;
      await api.patch(endpoint, { reason: action === 'reject' ? 'Rejected by shop owner' : undefined });
      setStatus(action === 'approve' ? 'Order approved.' : 'Order rejected and stock restored.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} order`);
    } finally {
      setUpdatingId('');
    }
  }

  function updateProductField(field, value) {
    setProductForm((current) => ({ ...current, [field]: value }));
  }

  async function createProduct(event) {
    event.preventDefault();
    setCreatingProduct(true);
    setError('');
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('brand', productForm.brand);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('price', Number(productForm.price));
      formData.append('stock', Number(productForm.stock));
      formData.append('lowStockThreshold', Number(productForm.lowStockThreshold));
      if (productForm.imageFile) {
        formData.append('image', productForm.imageFile);
      }

      await api.post('/market/shop/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProductForm({
        name: '',
        brand: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        lowStockThreshold: '10',
        imageFile: null
      });
      setStatus('Product added to the shop.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setCreatingProduct(false);
    }
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      lowStockThreshold: product.lowStockThreshold || 10,
      imageFile: null
    });
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      category: '',
      description: '',
      price: '',
      stock: '',
      lowStockThreshold: '10',
      imageFile: null
    });
  }

  async function updateProduct(event) {
    event.preventDefault();
    if (!editingProduct) return;
    
    setUpdatingId(editingProduct._id);
    setError('');
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('brand', productForm.brand);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('price', Number(productForm.price));
      formData.append('stock', Number(productForm.stock));
      formData.append('lowStockThreshold', Number(productForm.lowStockThreshold));
      if (productForm.imageFile) {
        formData.append('image', productForm.imageFile);
      }

      await api.put(`/market/shop/products/${editingProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('Product updated successfully.');
      closeEditModal();
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setUpdatingId('');
    }
  }

  async function deleteProduct(productId) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setUpdatingId(productId);
    setError('');
    setStatus('');

    try {
      await api.delete(`/market/shop/products/${productId}`);
      setStatus('Product deleted successfully.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Pet shop workspace</p>
          <h1>Pet Shop Dashboard</h1>
          <p>Manage inventory, review COD approvals, and keep stock healthy.</p>
        </div>
      </div>

      {error && <div className="form-alert error">{error}</div>}
      {status && <div className="form-alert success">{status}</div>}

      <div className="dashboard-grid">
        <div className="stats-section">
          <div className="stat-card">
            <h3>{loading ? '...' : dashboard.summary.totalProducts || 0}</h3>
            <p>Total Products</p>
          </div>
          <div className="stat-card highlight">
            <h3>{loading ? '...' : dashboard.summary.pendingCod || 0}</h3>
            <p>COD Approvals</p>
          </div>
          <div className="stat-card">
            <h3>{loading ? '...' : dashboard.summary.orders || 0}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h3>{loading ? '...' : formatLKR(dashboard.summary.revenue)}</h3>
            <p>Order Value</p>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Add Product</h2>
          </div>
          <form onSubmit={createProduct} className="widget-form-grid">
            <div className="form-group">
              <label htmlFor="product-name">Product name</label>
              <input id="product-name" required value={productForm.name} onChange={(event) => updateProductField('name', event.target.value)} />
            </div>
            <div className="widget-form-grid-2">
              <div className="form-group">
                <label htmlFor="product-brand">Brand</label>
                <input id="product-brand" value={productForm.brand} onChange={(event) => updateProductField('brand', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="product-category">Category</label>
                <input id="product-category" required value={productForm.category} onChange={(event) => updateProductField('category', event.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="product-description">Description</label>
              <textarea id="product-description" rows={3} value={productForm.description} onChange={(event) => updateProductField('description', event.target.value)} />
            </div>
            <div className="widget-form-grid-3">
              <div className="form-group">
                <label htmlFor="product-price">Price</label>
                <input id="product-price" required min="0.01" step="0.01" type="number" value={productForm.price} onChange={(event) => updateProductField('price', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="product-stock">Stock</label>
                <input id="product-stock" required min="0" step="1" type="number" value={productForm.stock} onChange={(event) => updateProductField('stock', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="product-threshold">Low stock</label>
                <input id="product-threshold" min="0" step="1" type="number" value={productForm.lowStockThreshold} onChange={(event) => updateProductField('lowStockThreshold', event.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="product-image">Product Image</label>
              <input 
                id="product-image" 
                type="file"
                accept="image/*"
                onChange={(event) => updateProductField('imageFile', event.target.files?.[0] || null)} 
              />
              {productForm.imageFile && (
                <div className="file-note">
                  📁 {productForm.imageFile.name}
                </div>
              )}
            </div>
            <button className="btn-primary" disabled={creatingProduct} type="submit">
              {creatingProduct ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Cash on Delivery Requests</h2>
            <button className="btn-small" onClick={loadDashboard} disabled={loading}>Refresh</button>
          </div>

          {loading ? (
            <p>Loading orders...</p>
          ) : pendingCodOrders.length === 0 ? (
            <p>No cash on delivery orders are waiting for approval.</p>
          ) : (
            <div className="orders-list">
              {pendingCodOrders.map((order) => (
                <div key={order._id} className="order-row">
                  <div className="order-info">
                    <h3>{customerName(order.user)}</h3>
                    <p>{orderProductNames(order)}</p>
                    <p>{order.shippingAddress}</p>
                    <p>
                      <span className="status pending">COD pending</span>
                      {' '}
                      <strong>{formatLKR(order.total)}</strong>
                    </p>
                  </div>
                  <div className="product-actions">
                    <button className="btn-approve" disabled={updatingId === order._id} onClick={() => decideOrder(order._id, 'approve')}>
                      Approve
                    </button>
                    <button className="btn-reject" disabled={updatingId === order._id} onClick={() => decideOrder(order._id, 'reject')}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Recent Orders</h2>
          </div>
          {loading ? (
            <p>Loading recent orders...</p>
          ) : dashboard.orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="orders-list">
              {dashboard.orders.slice(0, 8).map((order) => (
                <div key={order._id} className="order-item">
                  <span>{customerName(order.user)}</span>
                  <span>{formatLKR(order.total)}</span>
                  <span className={`status ${order.orderStatus}`}>{order.orderStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Inventory</h2>
          </div>
          {loading ? (
            <p>Loading inventory...</p>
          ) : dashboard.inventory.length === 0 ? (
            <p>No products found for this shop.</p>
          ) : (
            <div className="inventory-list">
              {dashboard.inventory.slice(0, 8).map((product) => (
                <div key={product._id} className="inventory-item">
                  <div className="order-info">
                    <h3>{product.name}</h3>
                    <p>{product.category} - {formatLKR(product.price)}</p>
                  </div>
                  <div className="product-actions inventory-actions">
                    <span className={`status ${product.stock <= product.lowStockThreshold ? 'low-stock' : 'in-stock'}`}>
                      {product.stock} in stock
                    </span>
                    <button 
                      className="btn-small" 
                      onClick={() => openEditModal(product)}
                      disabled={updatingId === product._id}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-small" 
                      onClick={() => deleteProduct(product._id)}
                      disabled={updatingId === product._id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="widget">
          <div className="widget-header">
            <h2>Low Stock Alerts</h2>
          </div>
          {loading ? (
            <p>Checking stock...</p>
          ) : lowStockItems.length === 0 ? (
            <p>All listed products are above their low stock threshold.</p>
          ) : (
            <div className="alerts-list">
              {lowStockItems.map((product) => (
                <div key={product._id} className="alert alert-warning">
                  <div className="alert-content">
                    <h3>{product.name}</h3>
                    <p>{product.stock} remaining. Threshold: {product.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditModal && editingProduct && (
        <div className="dashboard-modal-backdrop">
          <div className="dashboard-modal-panel">
            <h2>Edit Product</h2>
            {error && <div className="form-alert error">{error}</div>}
            <form onSubmit={updateProduct} className="widget-form-grid top-gap-16">
              <div className="form-group">
                <label htmlFor="edit-product-name">Product name</label>
                <input id="edit-product-name" required value={productForm.name} onChange={(event) => updateProductField('name', event.target.value)} />
              </div>
              <div className="widget-form-grid-2">
                <div className="form-group">
                  <label htmlFor="edit-product-brand">Brand</label>
                  <input id="edit-product-brand" value={productForm.brand} onChange={(event) => updateProductField('brand', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-product-category">Category</label>
                  <input id="edit-product-category" required value={productForm.category} onChange={(event) => updateProductField('category', event.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-product-description">Description</label>
                <textarea id="edit-product-description" rows={3} value={productForm.description} onChange={(event) => updateProductField('description', event.target.value)} />
              </div>
              <div className="widget-form-grid-3">
                <div className="form-group">
                  <label htmlFor="edit-product-price">Price</label>
                  <input id="edit-product-price" required min="0.01" step="0.01" type="number" value={productForm.price} onChange={(event) => updateProductField('price', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-product-stock">Stock</label>
                  <input id="edit-product-stock" required min="0" step="1" type="number" value={productForm.stock} onChange={(event) => updateProductField('stock', event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-product-threshold">Low stock</label>
                  <input id="edit-product-threshold" min="0" step="1" type="number" value={productForm.lowStockThreshold} onChange={(event) => updateProductField('lowStockThreshold', event.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="edit-product-image">Product Image</label>
                <input 
                  id="edit-product-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => updateProductField('imageFile', event.target.files?.[0] || null)} 
                />
                {productForm.imageFile && (
                  <div className="file-note">
                    📁 {productForm.imageFile.name}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-primary" disabled={updatingId === editingProduct._id} type="submit">
                  {updatingId === editingProduct._id ? 'Updating...' : 'Update Product'}
                </button>
                <button className="btn-small" type="button" onClick={closeEditModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PetShopDashboard;
