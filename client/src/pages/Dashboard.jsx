import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Plus,
  Search,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { adminQueues, appointments, modules, petProfiles, roles, services } from "../data/platformData.js";

export default function Dashboard() {
  return (
    <section className="dashboard-page full-screen-section">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Admin and provider workspace</p>
          <h1>Smart pet care dashboard</h1>
          <p>
            Monitor users, approvals, pets, health reminders, appointments, products,
            reports, adoption requests, role access, and AI health alerts from one screen.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="primary-button compact"><Plus size={17} /> New record</button>
          <button className="ghost-button"><Search size={17} /> Search</button>
          <button className="ghost-button"><Download size={17} /> Report</button>
        </div>
      </div>

      <div className="metric-grid wide">
        {services.map((item) => (
          <article key={item.title} className={`metric-card accent-${item.accent}`}>
            <p>{item.title}</p>
            <strong>{item.value}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-layout">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Today&apos;s operational workflow</h2>
            <button className="ghost-button">View all</button>
          </div>
          {appointments.map((item) => (
            <div className="task-row" key={`${item.pet}-${item.time}`}>
              <span className="task-icon"><CalendarDays size={18} /></span>
              <div>
                <strong>{item.pet}</strong>
                <p>{item.service} with {item.provider}</p>
              </div>
              <time>{item.time}</time>
              <em>{item.status}</em>
            </div>
          ))}
        </section>

        <aside className="workspace-panel">
          <div className="panel-heading">
            <h2>Admin checks</h2>
          </div>
          {adminQueues.map((queue, index) => (
            <div className="admin-check" key={queue.title}>
              {index % 2 === 0 ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
              <span><strong>{queue.value}</strong> {queue.title}</span>
            </div>
          ))}
          <div className="mini-module-list">
            {modules.slice(0, 8).map((module) => {
              const Icon = module.icon;
              return (
                <a href={`/modules/${module.id}`} key={module.id}>
                  <Icon size={16} />
                  {module.title}
                </a>
              );
            })}
          </div>
        </aside>
      </div>

      <div className="dashboard-layout bottom-grid">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Pet health board</h2>
            <button className="ghost-button">Export</button>
          </div>
          <div className="data-table">
            <div className="data-row data-head">
              <span>Pet</span>
              <span>Breed</span>
              <span>Owner</span>
              <span>Vaccine</span>
              <span>Status</span>
            </div>
            {petProfiles.map((pet) => (
              <div className="data-row" key={pet.name}>
                <span><strong>{pet.name}</strong><small>{pet.age} / {pet.gender}</small></span>
                <span>{pet.type}</span>
                <span>{pet.owner}</span>
                <span>{pet.vaccine}</span>
                <em>{pet.status}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Role access</h2>
            <BarChart3 size={20} />
          </div>
          <div className="role-access-list">
            {roles.map((role) => (
              <article key={role.id}>
                <UserCheck size={17} />
                <div>
                  <strong>{role.label}</strong>
                  <p>{role.permissions.slice(0, 3).join(" | ")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
