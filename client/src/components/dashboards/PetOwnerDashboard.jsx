import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CalendarClock, ShieldCheck, PawPrint, UserRoundCog, RotateCcw, HeartPulse, ClipboardList, Heart, Clock, Users, ShoppingBag, RefreshCcw, Edit, Trash2, ShoppingCart, Package, Eye, Truck, WalletCards } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardSidebar from '../DashboardSidebar.jsx';
import AppointmentBookingModal from '../AppointmentBookingModal.jsx';
import HealthRecordModal from '../HealthRecordModal.jsx';
import CommunityBlogSection from '../CommunityBlogSection.jsx';
import MatchmakingWorkspace from '../MatchmakingWorkspace.jsx';
import AdoptionForm from '../../pages/AdoptionForm.jsx';
import { formatLKR } from '../../utils/currency.js';
import { getUploadUrl } from '../../utils/media.js';
import '../../styles/admin.css';
import './Dashboard.css';

const sections = [
  { key: "pets", label: "My Pets", icon: PawPrint },
  { key: "health-records", label: "Health Records", icon: Heart },
  { key: "appointments", label: "Appointments", icon: Clock },
  { key: "community", label: "Community", icon: Users },
  { key: "matchmaking", label: "Matchmaking", icon: Heart },
  { key: "bought-products", label: "Bought Products", icon: ShoppingCart },
  { key: "adoption", label: "Adoption", icon: ShoppingBag }
];

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  
  const [active, setActive] = useState("pets");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    const section = new URLSearchParams(location.search).get("section");
    if (section && sections.some((item) => item.key === section)) {
      setActive(section);
    }
  }, [location.search]);

  useEffect(() => {
    if (active === "pets") loadPets();
    if (active === "health-records") {
      loadMedicalRecords();
      loadPets();
    }
    if (active === "appointments") loadAppointments();
    if (active === "bought-products") loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  async function run(action) {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  function flash(message) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2500);
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }

  function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function orderShortId(order) {
    return `#${String(order?._id || '').slice(-8).toUpperCase() || 'ORDER'}`;
  }

  function paymentLabel(order) {
    if (order.paymentMethod === 'cod') return 'Cash on delivery';
    if (order.paymentMethod === 'card') return order.paymentLast4 ? `Card ending ${order.paymentLast4}` : 'Card';
    return order.paymentMethod || 'Payment';
  }

  function productImage(product) {
    return product?.images?.[0] ? getUploadUrl(product.images[0], '') : '';
  }

  function orderProductNames(order) {
    return order.items
      ?.map((item) => `${item.product?.name || 'Product'} x ${item.quantity}`)
      .join(', ') || 'No products';
  }

  function totalOrderQuantity(order) {
    return order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
  }

  function getRecordTone(status) {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'ok' || normalized === 'completed') return 'ok';
    if (normalized === 'due' || normalized === 'due-soon' || normalized === 'pending' || normalized === 'upcoming') return 'warn';
    return 'neutral';
  }

  function isVetRecord(record) {
    return Boolean(
      record.createdByRole === 'veterinarian' ||
      record.veterinarian ||
      record.vetNotes ||
      record.diagnosis ||
      record.treatment ||
      record.prescriptions?.length
    );
  }

  function recordSourceLabel(record) {
    return isVetRecord(record) ? 'Veterinarian added notes' : 'Pet owner added record';
  }

  function recordDateValue(record) {
    return record.recordDate || record.visitDate || record.createdAt;
  }

  async function loadPets() {
    await run(async () => {
      const res = await api.get("/pets");
      setPets(res.data.items || res.data.pets || []);
    });
  }

  async function loadAppointments() {
    await run(async () => {
      const res = await api.get("/appointments");
      setAppointments(res.data.items || res.data || []);
    });
  }

  async function loadMedicalRecords() {
    await run(async () => {
      const res = await api.get("/medical-records");
      setMedicalRecords(res.data.items || res.data || []);
    });
  }

  async function loadOrders() {
    await run(async () => {
      const res = await api.get("/market/orders");
      setOrders(res.data.items || []);
    });
  }

  // Section renderers
  const renderPetsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>My Pets</h1>
          <p>Manage and view all your pet profiles</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" onClick={() => navigate('/pets')} type="button">
            <PawPrint size={16} /> Add New Pet
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {pets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <PawPrint size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>No pets yet. Start by adding your first pet profile.</p>
          <button className="admin-btn primary" onClick={() => navigate('/pets')} type="button" style={{ marginTop: '16px' }}>
            <PawPrint size={16} /> Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="pet-profile-grid">
          {pets.map((pet) => (
            <article key={pet._id} className="pet-profile-card">
              <div className="pet-card-media">
                {pet.images && pet.images.length > 0 ? (
                  <img src={pet.images[0]} alt={pet.name} className="pet-photo" />
                ) : (
                  <div className="pet-photo-fallback">
                    <PawPrint size={42} />
                    <p>No photo</p>
                  </div>
                )}
                {pet.species && (
                  <span className="pet-species-badge">
                    <PawPrint size={14} /> {pet.species}
                  </span>
                )}
              </div>

              <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <div className="pet-meta-grid">
                  <div><strong>Breed:</strong> {pet.breed || 'Not set'}</div>
                  <div><strong>Age:</strong> {pet.age != null ? `${pet.age} years` : 'Unknown'}</div>
                  <div><strong>Gender:</strong> {pet.gender || 'Unknown'}</div>
                </div>

                <div className={`pet-vaccination-status ${pet.vaccinationStatus === 'up-to-date' || pet.vaccinationStatus === 'upToDate' ? 'ok' : pet.vaccinationStatus ? 'warn' : ''}`}>
                  <CalendarClock size={16} /> Vaccination: {pet.vaccinationStatus || 'Unknown'}
                </div>

                <div className="pet-card-actions">
                  <button 
                    onClick={() => navigate('/pets')} 
                    className="primary-button compact" 
                    type="button"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPet(pet);
                      setShowDetailModal(true);
                    }} 
                    className="danger-button" 
                    type="button"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showDetailModal && selectedPet && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPet.name}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)} type="button">×</button>
            </div>
            
            <div className="modal-body">
              {selectedPet.images && selectedPet.images.length > 0 && (
                <img src={selectedPet.images[0]} alt={selectedPet.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px', maxHeight: '300px', objectFit: 'cover' }} />
              )}
              
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-key">Breed:</span>
                  <span className="detail-val">{selectedPet.breed || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Age:</span>
                  <span className="detail-val">{selectedPet.age ? `${selectedPet.age} years` : '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Type:</span>
                  <span className="detail-val">{selectedPet.type || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Color:</span>
                  <span className="detail-val">{selectedPet.color || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Microchip:</span>
                  <span className="detail-val">{selectedPet.microchip || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Vaccination:</span>
                  <span className="detail-val">{selectedPet.vaccinationStatus || '-'}</span>
                </div>
                {selectedPet.notes && (
                  <div className="detail-row full-width">
                    <span className="detail-key">Notes:</span>
                    <span className="detail-val">{selectedPet.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowDetailModal(false)} type="button">Close</button>
              <button className="admin-btn primary" onClick={() => { navigate('/pets'); setShowDetailModal(false); }} type="button">
                ✏️ Edit Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHealthRecordsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Health Records</h1>
          <p>Manage medical and vaccination records for your pets</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" type="button" onClick={() => setShowAddRecordModal(true)}>
            <Heart size={16} /> Add Record
          </button>
        </div>
      </div>

      <div className="health-records-summary">
        <div className="report-stat">
          <span>Total Records</span>
          <strong>{medicalRecords.length}</strong>
        </div>
        <div className="report-stat">
          <span>Active</span>
          <strong>{medicalRecords.filter((record) => getRecordTone(record.status) === 'ok').length}</strong>
        </div>
        <div className="report-stat">
          <span>Due Soon</span>
          <strong>{medicalRecords.filter((record) => getRecordTone(record.status) === 'warn').length}</strong>
        </div>
        <div className="report-stat">
          <span>Vet Notes</span>
          <strong>{medicalRecords.filter((record) => isVetRecord(record)).length}</strong>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {medicalRecords.length === 0 ? (
        <div className="report-note" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <HeartPulse size={36} style={{ marginBottom: 10 }} />
          <p style={{ margin: 0 }}>No health records yet. Add your first medical or vaccination record.</p>
        </div>
      ) : (
        <div className="health-records-grid">
          {medicalRecords
            .slice()
            .sort((left, right) => new Date(recordDateValue(right) || 0) - new Date(recordDateValue(left) || 0))
            .map((record) => {
              const tone = getRecordTone(record.status);
              const vetRecord = isVetRecord(record);
              return (
                <article className={`health-record-card ${vetRecord ? 'vet-record-card' : 'owner-record-card'}`} key={record._id}>
                  <div className="health-record-card-top">
                    <div>
                      <p className="health-record-label">{recordSourceLabel(record)}</p>
                      <h3>{record.pet?.name || 'Unknown pet'}</h3>
                    </div>
                    <span className={`health-record-status ${tone}`}>{record.status || 'active'}</span>
                  </div>

                  <div className="health-record-meta">
                    <div><strong>Record Type</strong><span>{record.recordType || '-'}</span></div>
                    <div><strong>Date</strong><span>{formatDate(recordDateValue(record))}</span></div>
                    <div>
                      <strong>{vetRecord ? 'Veterinarian' : 'Provider'}</strong>
                      <span>{record.veterinarian?.name || record.provider || '-'}</span>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="health-record-section owner-note">
                      <strong>Pet owner record</strong>
                      <p>{record.notes}</p>
                    </div>
                  )}

                  {(record.vetNotes || record.diagnosis || record.treatment || record.prescriptions?.length > 0) && (
                    <div className="health-record-section vet-note">
                      <strong>Veterinarian notes</strong>
                      {record.diagnosis && <p><span>Diagnosis:</span> {record.diagnosis}</p>}
                      {record.treatment && <p><span>Treatment:</span> {record.treatment}</p>}
                      {record.prescriptions?.length > 0 && <p><span>Prescriptions:</span> {record.prescriptions.join(', ')}</p>}
                      {record.vetNotes && <p><span>Notes:</span> {record.vetNotes}</p>}
                    </div>
                  )}
                </article>
              );
            })}
        </div>
      )}
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Appointments</h1>
          <p>View and manage your pet care appointments</p>
        </div>
        <div className="admin-main-actions">
          <button className="admin-btn primary" type="button" onClick={() => setShowAppointmentModal(true)}>
            <Clock size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>No appointments scheduled. Book your first appointment now.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Service</th>
                <th>Provider</th>
                <th>Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.pet?.name || '-'}</td>
                  <td>{apt.serviceType || '-'}</td>
                  <td>{apt.provider?.name || '-'}</td>
                  <td>{new Date(apt.scheduledAt).toLocaleDateString() || '-'}</td>
                  <td>{apt.status || 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBoughtProductsSection = () => {
    const boughtProductCount = orders.reduce((sum, order) => sum + totalOrderQuantity(order), 0);
    const pendingOrders = orders.filter((order) => order.paymentStatus === 'pending' || order.orderStatus === 'placed');
    const deliveredOrders = orders.filter((order) => order.orderStatus === 'delivered');

    return (
      <div className="admin-main-modern">
        <div className="admin-main-header">
          <div>
            <h1>Bought Products</h1>
            <p>View products you bought from pet shops, delivery status, and payment details.</p>
          </div>
          <div className="admin-main-actions">
            <button className="admin-btn secondary" onClick={loadOrders} disabled={loading} type="button">
              <RefreshCcw size={16} /> Refresh
            </button>
            <button className="admin-btn primary" onClick={() => navigate('/market')} type="button">
              <ShoppingCart size={16} /> Shop More
            </button>
          </div>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <div className="owner-buy-summary">
          <div className="owner-buy-stat">
            <ShoppingCart size={20} />
            <span>Bought Products</span>
            <strong>{loading ? '...' : boughtProductCount}</strong>
          </div>
          <div className="owner-buy-stat">
            <Clock size={20} />
            <span>Pending Orders</span>
            <strong>{loading ? '...' : pendingOrders.length}</strong>
          </div>
          <div className="owner-buy-stat">
            <Truck size={20} />
            <span>Delivered</span>
            <strong>{loading ? '...' : deliveredOrders.length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="report-note">Loading bought products...</div>
        ) : orders.length === 0 ? (
          <div className="owner-buy-empty">
            <Package size={46} />
            <h3>No bought products yet</h3>
            <p>Products you buy from the marketplace will appear here with status and delivery details.</p>
            <button className="admin-btn primary" onClick={() => navigate('/market')} type="button">
              <ShoppingCart size={16} /> Go to Shop
            </button>
          </div>
        ) : (
          <div className="owner-buy-list">
            {orders.map((order) => (
              <article className="owner-buy-card" key={order._id}>
                <div className="owner-buy-card-top">
                  <div>
                    <p className="owner-buy-label">{orderShortId(order)}</p>
                    <h3>{orderProductNames(order)}</h3>
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  <span className={`status ${order.orderStatus || 'placed'}`}>{order.orderStatus || 'placed'}</span>
                </div>

                <div className="owner-buy-products">
                  {order.items?.slice(0, 3).map((item) => (
                    <div className="owner-buy-product" key={item._id || item.product?._id}>
                      <div className="shop-product-thumb">
                        {productImage(item.product) ? <img src={productImage(item.product)} alt={item.product?.name || 'Product'} /> : <Package size={18} />}
                      </div>
                      <div>
                        <strong>{item.product?.name || 'Product'}</strong>
                        <span>Qty {item.quantity} - {formatLKR(item.price || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="owner-buy-meta">
                  <span><WalletCards size={15} /> {paymentLabel(order)} - {order.paymentStatus || 'pending'}</span>
                  <strong>{formatLKR(order.total)}</strong>
                </div>

                {order.paymentMethod === 'cod' && order.orderStatus === 'placed' && (
                  <div className="owner-buy-pending-note">Waiting for shop approval.</div>
                )}

                <div className="pet-card-actions">
                  <button className="primary-button compact" onClick={() => setSelectedOrder(order)} type="button">
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="dashboard-modal-backdrop">
            <div className="dashboard-modal-panel owner-order-detail-modal">
              <div className="shop-detail-header">
                <div>
                  <p className="eyebrow">Bought product details</p>
                  <h2>{orderShortId(selectedOrder)}</h2>
                  <p>{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <span className={`status ${selectedOrder.orderStatus || 'placed'}`}>{selectedOrder.orderStatus || 'placed'}</span>
              </div>

              <div className="shop-detail-summary">
                <div>
                  <Truck size={16} />
                  <span>{selectedOrder.shippingAddress || 'No shipping address provided'}</span>
                </div>
                <div>
                  <WalletCards size={16} />
                  <span>{paymentLabel(selectedOrder)} - {selectedOrder.paymentStatus || 'pending'}</span>
                </div>
                <div>
                  <Package size={16} />
                  <span>{totalOrderQuantity(selectedOrder)} products</span>
                </div>
              </div>

              <div className="shop-detail-section">
                <h3>Products</h3>
                <div className="shop-detail-items">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id || item.product?._id} className="shop-detail-item">
                      <div className="shop-product-thumb">
                        {productImage(item.product) ? <img src={productImage(item.product)} alt={item.product?.name || 'Product'} /> : <Package size={18} />}
                      </div>
                      <div>
                        <strong>{item.product?.name || 'Product'}</strong>
                        <span>{item.product?.category || 'Uncategorized'} - Qty {item.quantity}</span>
                      </div>
                      <strong>{formatLKR((item.price || 0) * (item.quantity || 1))}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shop-detail-section">
                <h3>Delivery Details</h3>
                <div className="shop-detail-fields">
                  <span>Name</span>
                  <strong>{selectedOrder.shippingName || user?.name || 'Not available'}</strong>
                  <span>Email</span>
                  <strong>{selectedOrder.shippingEmail || user?.email || 'Not available'}</strong>
                  <span>Phone</span>
                  <strong>{selectedOrder.shippingPhone || 'Not available'}</strong>
                  <span>Tracking</span>
                  <strong>{selectedOrder.trackingNumber || 'Not assigned'}</strong>
                </div>
              </div>

              <div className="shop-detail-total">
                <span>Total</span>
                <strong>{formatLKR(selectedOrder.total)}</strong>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" type="button" onClick={() => setSelectedOrder(null)}>
                  Done
                </button>
                <button className="btn-small" type="button" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCommunitySection = () => (
    <CommunityBlogSection />
  );

  const renderMatchmakingSection = () => (
    <MatchmakingWorkspace embedded />
  );

  const renderAdoptionSection = () => (
    <AdoptionForm embedded />
  );

  const renderSection = () => {
    switch (active) {
      case "pets":
        return renderPetsSection();
      case "health-records":
        return renderHealthRecordsSection();
      case "appointments":
        return renderAppointmentsSection();
      case "bought-products":
        return renderBoughtProductsSection();
      case "community":
        return renderCommunitySection();
      case "matchmaking":
        return renderMatchmakingSection();
      case "adoption":
        return renderAdoptionSection();
      default:
        return renderPetsSection();
    }
  };

  const summary = {
    totalPets: pets.length,
    upcomingAppointments: appointments.filter((a) => a.status === "pending").length
  };

  return (
    <div className="dashboard-with-sidebar">
      <DashboardSidebar />
      <main className="admin-shell-modern">
        {success && <div className="admin-alert success">{success}</div>}
        {renderSection()}
      </main>
      <AppointmentBookingModal 
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        pets={pets}
        onSuccess={loadAppointments}
      />
      <HealthRecordModal 
        isOpen={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
        pets={pets}
        onSuccess={loadMedicalRecords}
      />
    </div>
  );
};

export default PetOwnerDashboard;
