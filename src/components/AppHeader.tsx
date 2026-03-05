import { Link, useLocation } from 'react-router-dom';
import { Sparkles, History } from 'lucide-react';

const AppHeader = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Universal Digitizer', icon: Sparkles },
    { to: '/dashboard', label: 'History Logs', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="gradient-primary rounded-lg p-2">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display leading-none">Smart Form Digitizer</h1>
            <p className="text-xs text-muted-foreground">AI OCR to Excel</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === to
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
