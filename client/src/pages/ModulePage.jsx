import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Database, KeyRound, Workflow } from "lucide-react";
import { modules } from "../data/platformData.js";

export default function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = modules.find((item) => item.id === moduleId) ?? modules[0];
  const Icon = module.icon;

  function handleAction(index) {
    if (module.id === "community" && index === 0) {
      navigate("/community");
      return;
    }

    if (module.id === "admin" && index === 0) {
      navigate("/dashboard/admin");
    }
  }

  return (
    <section className="module-detail full-screen-section">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Back to modules</Link>
      <div className={`module-detail-hero tone-${module.tone}`}>
        <span className="module-detail-icon"><Icon size={32} /></span>
        <div>
          <p className="eyebrow">Platform module</p>
          <h1>{module.title}</h1>
          <p>{module.summary}</p>
        </div>
      </div>

      <div className="module-meta-grid">
        <article>
          <Database size={20} />
          <span>Collections</span>
          <strong>{module.collection}</strong>
        </article>
        <article>
          <Workflow size={20} />
          <span>Workflow steps</span>
          <strong>{module.workflows.length}</strong>
        </article>
        <article>
          <KeyRound size={20} />
          <span>Access rules</span>
          <strong>{module.permissions.length}</strong>
        </article>
      </div>

      <div className="module-workspace">
        <section>
          <div className="panel-heading">
            <h2>Required functions</h2>
          </div>
          <div className="feature-board">
            {module.features.map((feature) => (
              <article key={feature}>
                <CheckCircle2 size={19} />
                <h3>{feature}</h3>
                <p>Implemented in the product surface with matching backend model and route foundation.</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="module-side-panel">
          <h2>Workflow</h2>
          {module.workflows.map((step, index) => (
            <div className="workflow-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
          <h2>Actions</h2>
          <div className="action-stack">
            {module.actions.map((action, index) => (
              <button
                className={index === 0 ? "primary-button compact" : "ghost-button"}
                key={action}
                onClick={() => handleAction(index)}
              >
                {action}
              </button>
            ))}
          </div>
          <h2>Role and security notes</h2>
          <div className="permission-list">
            {module.permissions.map((permission) => (
              <span key={permission}><KeyRound size={14} /> {permission}</span>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
