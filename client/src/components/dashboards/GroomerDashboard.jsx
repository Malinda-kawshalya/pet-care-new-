import React, { useState } from 'react';

const PetShopDashboard = () => {
  const [todayStats, setTodayStats] = useState({
    sales: '$1,250',
    orders: 8,
    revenue: '$8,750',
    customers: 156
  });

  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Dog Food', stock: 45, price: '$29.99', status: 'In Stock' },
    { id: 2, name: 'Cat Toys Bundle', stock: 12, price: '$15.99', status: 'Low Stock' },
    { id: 3, name: 'Pet Vitamins', stock: 0, price: '$39.99', status: 'Out of Stock' }
  ]);

  const [orders, setOrders] = useState([
    { id: 1, customer: 'John Doe', products: 3, total: '$125.50', status: 'Shipped', date: '2025-05-15' },
    { id: 2, customer: 'Jane Smith', products: 1, total: '$29.99', status: 'Pending', date: '2025-05-16' },
    { id: 3, customer: 'Bob Johnson', products: 5, total: '$156.75', status: 'Delivered', date: '2025-05-14' }
  ]);

  return (
    <div className="dashboard-container">
      <h1>Pet Shop Dashboard</h1>

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <h3>{todayStats.sales}</h3>
            <p>Today's Sales</p>
          </div>
          <div className="stat-card">
            <h3>{todayStats.orders}</h3>
            <p>Today's Orders</p>
          </div>
          <div className="stat-card">
            <h3>{todayStats.revenue}</h3>
            <p>This Week Revenue</p>
          </div>
          <div className="stat-card">
            <h3>{todayStats.customers}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="widget">
          <div className="widget-header">
            <h2>Inventory Status</h2>
            <button className="btn-primary">+ Add Product</button>
          </div>
          <div className="inventory-list">
            {products.map(product => (
              <div key={product.id} className="inventory-item">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>Stock: {product.stock} units • Price: {product.price}</p>
                </div>
                <span className={`status ${product.status.toLowerCase().replace(' ', '-')}`}>
                  {product.status}
                </span>
                <div className="product-actions">
                  <button className="btn-small">Edit</button>
                  <button className="btn-small">Restock</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="widget">
          <div className="widget-header">
            <h2>Recent Orders</h2>
            <a href="#" className="link">View All Orders</a>
          </div>
          <div className="orders-table">
            {orders.map(order => (
              <div key={order.id} className="order-row">
                <div className="order-info">
                  <h3>#{order.id}</h3>
                  <p>{order.customer}</p>
                  <p>{order.products} items • {order.total}</p>
                </div>
                <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                <span className="date">{order.date}</span>
                <button className="btn-small">Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="widget quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">📦 Manage Products</button>
            <button className="action-btn">📊 Sales Report</button>
            <button className="action-btn">💳 Pending Orders</button>
            <button className="action-btn">⭐ Customer Reviews</button>
            <button className="action-btn">📈 Analytics</button>
            <button className="action-btn">💬 Messages</button>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="widget">
          <h2>Best Sellers</h2>
          <div className="bestsellers-list">
            <div className="bestseller-item">
              <span className="rank">1</span>
              <span className="product">Premium Dog Food</span>
              <span className="sold">342 sold</span>
            </div>
            <div className="bestseller-item">
              <span className="rank">2</span>
              <span className="product">Pet Toys Pack</span>
              <span className="sold">287 sold</span>
            </div>
            <div className="bestseller-item">
              <span className="rank">3</span>
              <span className="product">Cat Litter Premium</span>
              <span className="sold">215 sold</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="widget">
          <h2>Recent Reviews</h2>
          <div className="reviews-list">
            <div className="review-item">
              <div className="rating">⭐⭐⭐⭐⭐</div>
              <p>"Great quality products and fast delivery!"</p>
              <span className="reviewer">- Sarah M.</span>
            </div>
            <div className="review-item">
              <div className="rating">⭐⭐⭐⭐</div>
              <p>"Good selection of products, could improve packaging"</p>
              <span className="reviewer">- Mike T.</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="widget">
          <h2>⚠️ Low Stock Alert</h2>
          <div className="alert-list">
            <div className="alert-item">
              <span className="product-name">Cat Toys Bundle</span>
              <span className="stock">12 left</span>
              <button className="btn-small">Restock Now</button>
            </div>
            <div className="alert-item">
              <span className="product-name">Pet Vitamins</span>
              <span className="stock">Out of Stock</span>
              <button className="btn-small">Reorder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetShopDashboard;
