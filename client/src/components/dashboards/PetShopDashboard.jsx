import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Plus, RefreshCcw, ShoppingBag, Trash2, WalletCards } from 'lucide-react';
import api from '../../services/api.js';
import DashboardSidebar from '../DashboardSidebar.jsx';
import { formatLKR } from '../../utils/currency.js';
import './Dashboard.css';

const shopSections = [
  { key: 'overview' },
  { key: 'add-product' },
  { key: 'inventory' },
  { key: 'cod' },
  { key: 'orders' },
  { key: 'low-stock' }
];

const shopCopy = {
  overview: {
    eyebrow: 'Pet shop workspace',
    title: 'Pet Shop Dashboard',
    description: 'Manage products, approve COD requests, and keep stock healthy from one focused workspace.'
  },
  'add-product': {
    eyebrow: 'Catalog',
    title: 'Add Product',
    description: 'Create a new marketplace listing with price, stock, threshold, and product image.'
  },
  inventory: {
    eyebrow: 'Inventory',
    title: 'Product Inventory',
    description: 'Review stock levels, update product details, and remove unavailable items.'
  },
  cod: {
    eyebrow: 'Approvals',
    title: 'Cash on Delivery Requests',
    description: 'Approve or reject COD orders before stock is committed.'
  },
  orders: {
    eyebrow: 'Orders',
    title: 'Recent Orders',
    description: 'Track recent customer activity and order statuses.'
  },
  'low-stock': {
    eyebrow: 'Stock alerts',
    title: 'Low Stock Alerts',
    description: 'Find products that need attention before customers run into empty shelves.'
  }
};

const shopSectionKeys = new Set(shopSections.map((section) => section.key));

function customerName(user) {
  if (!user) return 'Customer';
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Customer';
}

function orderProductNames(order) {
  return order.items
    ?.map((item) => `${item.product?.name || 'Product'} x ${item.quantity}`)
    .join(', ') || 'No items';
}

function resetProductForm() {
  return {
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    imageFile: null
  };
}

const PetShopDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sectionParam = new URLSearchParams(location.search).get('section');
  const activeSection = sectionParam && shopSectionKeys.has(sectionParam) ? sectionParam : 'overview';
  const pageCopy = shopCopy[activeSection];

  const [dashboard, setDashboard] = useState({ inventory: [], orders: [], summary: {} });
  const [productForm, setProductForm] = useState(resetProductForm);
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

  const recentOrders = useMemo(() => dashboard.orders.slice(0, 8), [dashboard.orders]);
  const inventoryPreview = useMemo(() => dashboard.inventory.slice(0, 8), [dashboard.inventory]);

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

      setProductForm(resetProductForm());
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
    setProductForm(resetProductForm());
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

  function goToSection(section) {
    navigate(section === 'overview' ? '/dashboard/petshop' : `/dashboard/petshop?section=${section}`);
  }

  const renderEmptyState = (icon, title, message, action) => (
    <div className="shop-empty-state">
      <div className="shop-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );

  const renderStats = () => (
    <div className="stats-section shop-stats">
      <button className="stat-card shop-stat-card" type="button" onClick={() => goToSection('inventory')}>
        <span className="shop-stat-icon"><Package size={18} /></span>
        <span className="shop-stat-copy">
          <span className="shop-stat-label">Total products</span>
          <strong>{loading ? '...' : dashboard.summary.totalProducts || 0}</strong>
        </span>
      </button>
      <button className="stat-card shop-stat-card highlight" type="button" onClick={() => goToSection('cod')}>
        <span className="shop-stat-icon"><WalletCards size={18} /></span>
        <span className="shop-stat-copy">
          <span className="shop-stat-label">COD approvals</span>
          <strong>{loading ? '...' : dashboard.summary.pendingCod || 0}</strong>
        </span>
      </button>
      <button className="stat-card shop-stat-card" type="button" onClick={() => goToSection('orders')}>
        <span className="shop-stat-icon"><ShoppingBag size={18} /></span>
        <span className="shop-stat-copy">
          <span className="shop-stat-label">Total orders</span>
          <strong>{loading ? '...' : dashboard.summary.orders || 0}</strong>
        </span>
      </button>
      <div className="stat-card shop-stat-card">
        <span className="shop-stat-icon"><CheckCircle2 size={18} /></span>
        <span className="shop-stat-copy">
          <span className="shop-stat-label">Order value</span>
          <strong className="shop-stat-money">{loading ? '...' : formatLKR(dashboard.summary.revenue)}</strong>
        </span>
      </div>
    </div>
  );

  const renderProductForm = () => (
    <div className="widget shop-form-panel" id="add-product">
      <div className="widget-header">
        <div>
          <h2>Add Product</h2>
          <p className="widget-subtitle">List a product with the details customers need before buying.</p>
        </div>
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
          <label htmlFor="product-image">Product image</label>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(event) => updateProductField('imageFile', event.target.files?.[0] || null)}
          />
          {productForm.imageFile && <div className="file-note">{productForm.imageFile.name}</div>}
        </div>
        <button className="btn-primary shop-submit-button" disabled={creatingProduct} type="submit">
          <Plus size={16} /> {creatingProduct ? 'Adding...' : 'Add product'}
        </button>
      </form>
    </div>
  );

  const renderCodRequests = (compact = false) => (
    <div className="widget" id="cod">
      <div className="widget-header">
        <div>
          <h2>Cash on Delivery Requests</h2>
          <p className="widget-subtitle">{pendingCodOrders.length} waiting for your decision</p>
        </div>
        <button className="btn-small" onClick={loadDashboard} disabled={loading} type="button">
          <RefreshCcw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : pendingCodOrders.length === 0 ? (
        renderEmptyState(<CheckCircle2 size={24} />, 'No pending COD orders', 'Every cash on delivery order is already handled.')
      ) : (
        <div className="orders-list shop-list">
          {pendingCodOrders.slice(0, compact ? 3 : pendingCodOrders.length).map((order) => (
            <div key={order._id} className="order-row shop-order-row">
              <div className="order-info">
                <h3>{customerName(order.user)}</h3>
                <p>{orderProductNames(order)}</p>
                <p>{order.shippingAddress || 'No shipping address provided'}</p>
                <p>
                  <span className="status pending">COD pending</span>
                  {' '}
                  <strong>{formatLKR(order.total)}</strong>
                </p>
              </div>
              <div className="product-actions shop-row-actions">
                <button className="btn-approve" disabled={updatingId === order._id} onClick={() => decideOrder(order._id, 'approve')} type="button">
                  Approve
                </button>
                <button className="btn-reject" disabled={updatingId === order._id} onClick={() => decideOrder(order._id, 'reject')} type="button">
                  Reject
                </button>
              </div>
            </div>
          ))}
          {compact && pendingCodOrders.length > 3 && (
            <button className="btn-small shop-view-all" type="button" onClick={() => goToSection('cod')}>
              View all COD requests
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderRecentOrders = () => (
    <div className="widget" id="recent-orders">
      <div className="widget-header">
        <div>
          <h2>Recent Orders</h2>
          <p className="widget-subtitle">Latest customer activity from your shop.</p>
        </div>
      </div>
      {loading ? (
        <p>Loading recent orders...</p>
      ) : recentOrders.length === 0 ? (
        renderEmptyState(<ShoppingBag size={24} />, 'No orders yet', 'New customer orders will appear here.')
      ) : (
        <div className="orders-list shop-list">
          {recentOrders.map((order) => (
            <div key={order._id} className="order-item shop-order-item">
              <span>{customerName(order.user)}</span>
              <span>{formatLKR(order.total)}</span>
              <span className={`status ${order.orderStatus}`}>{order.orderStatus || 'placed'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInventory = (compact = false) => {
    const items = compact ? inventoryPreview.slice(0, 5) : dashboard.inventory;

    return (
      <div className="widget" id="inventory">
        <div className="widget-header">
          <div>
            <h2>Inventory</h2>
            <p className="widget-subtitle">{dashboard.inventory.length} products in your catalog</p>
          </div>
          <button className="btn-small" type="button" onClick={() => goToSection('add-product')}>
            <Plus size={15} /> Add
          </button>
        </div>
        {loading ? (
          <p>Loading inventory...</p>
        ) : items.length === 0 ? (
          renderEmptyState(
            <Package size={24} />,
            'No products yet',
            'Add your first product so customers can start ordering.',
            <button className="btn-primary" type="button" onClick={() => goToSection('add-product')}>Add product</button>
          )
        ) : (
          <div className="inventory-list shop-list">
            {items.map((product) => (
              <div key={product._id} className="inventory-item shop-inventory-item">
                <div className="shop-product-main">
                  <div className="shop-product-thumb">
                    {product.image ? <img src={product.image} alt={product.name} /> : <Package size={20} />}
                  </div>
                  <div className="order-info">
                    <h3>{product.name}</h3>
                    <p>{product.category || 'Uncategorized'} - {formatLKR(product.price)}</p>
                  </div>
                </div>
                <div className="product-actions inventory-actions">
                  <span className={`status ${product.stock <= product.lowStockThreshold ? 'low-stock' : 'in-stock'}`}>
                    {product.stock} in stock
                  </span>
                  <button className="btn-small" onClick={() => openEditModal(product)} disabled={updatingId === product._id} type="button">
                    Edit
                  </button>
                  <button className="btn-small danger" onClick={() => deleteProduct(product._id)} disabled={updatingId === product._id} type="button">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {compact && dashboard.inventory.length > 5 && (
              <button className="btn-small shop-view-all" type="button" onClick={() => goToSection('inventory')}>
                View full inventory
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLowStock = (compact = false) => {
    const items = compact ? lowStockItems.slice(0, 4) : lowStockItems;

    return (
      <div className="widget" id="low-stock">
        <div className="widget-header">
          <div>
            <h2>Low Stock Alerts</h2>
            <p className="widget-subtitle">{lowStockItems.length} products at or below threshold</p>
          </div>
        </div>
        {loading ? (
          <p>Checking stock...</p>
        ) : items.length === 0 ? (
          renderEmptyState(<CheckCircle2 size={24} />, 'Stock looks healthy', 'All listed products are above their low stock threshold.')
        ) : (
          <div className="alerts-list shop-list">
            {items.map((product) => (
              <div key={product._id} className="alert alert-warning shop-stock-alert">
                <div className="alert-content">
                  <h3>{product.name}</h3>
                  <p>{product.stock} remaining. Threshold: {product.lowStockThreshold}</p>
                </div>
                <button className="btn-small" type="button" onClick={() => openEditModal(product)}>Update stock</button>
              </div>
            ))}
            {compact && lowStockItems.length > 4 && (
              <button className="btn-small shop-view-all" type="button" onClick={() => goToSection('low-stock')}>
                View all stock alerts
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <>
      {renderStats()}
      <div className="shop-overview-grid">
        {renderCodRequests(true)}
        {renderLowStock(true)}
      </div>
      {renderInventory(true)}
      {renderRecentOrders()}
    </>
  );

  const renderContent = () => {
    if (activeSection === 'add-product') return renderProductForm();
    if (activeSection === 'inventory') return renderInventory();
    if (activeSection === 'cod') return renderCodRequests();
    if (activeSection === 'orders') return renderRecentOrders();
    if (activeSection === 'low-stock') return renderLowStock();
    return renderOverview();
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <div className="dashboard-container shop-dashboard">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-primary" type="button" onClick={() => goToSection('add-product')}>
              <Plus size={16} /> Add product
            </button>
            <button className="btn-small" onClick={loadDashboard} disabled={loading} type="button">
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}
        {status && <div className="form-alert success">{status}</div>}

        <div className="dashboard-grid shop-dashboard-grid">
          {renderContent()}
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
                  <label htmlFor="edit-product-image">Product image</label>
                  <input
                    id="edit-product-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateProductField('imageFile', event.target.files?.[0] || null)}
                  />
                  {productForm.imageFile && <div className="file-note">{productForm.imageFile.name}</div>}
                </div>
                <div className="modal-actions">
                  <button className="btn-primary" disabled={updatingId === editingProduct._id} type="submit">
                    {updatingId === editingProduct._id ? 'Updating...' : 'Update product'}
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
