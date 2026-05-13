import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ModuleCard({ module }) {
  const Icon = module.icon;

  return (
    <Link to={`/modules/${module.id}`} className={`module-card tone-${module.tone}`}>
      <div className="module-icon">
        <Icon size={22} />
      </div>
      <div>
        <h3>{module.title}</h3>
        <p>{module.summary}</p>
      </div>
      <span className="module-arrow" aria-hidden="true">
        <ArrowUpRight size={18} />
      </span>
    </Link>
  );
}
