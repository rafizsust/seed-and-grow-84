import { useState } from 'react';
import { ChevronDown, Menu, X, User, LogOut, Settings as SettingsIcon, BarChart3, Layers, Brain, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useNavigate, Link } from 'react-router-dom';

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  items: NavSubItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Speaking',
    items: [
      { label: 'Cambridge IELTS-A', href: '/speaking/cambridge-ielts-a' },
      { label: 'Speaking Section', href: '#' },
      { label: 'Speaking Practice', href: '#' },
    ],
  },
  {
    label: 'Writing',
    items: [
      { label: 'Cambridge IELTS-A', href: '/writing/cambridge-ielts-a' },
      { label: 'Past Exam Paper-A', href: '#' },
      { label: 'Cambridge IELTS-G', href: '#' },
    ],
  },
  {
    label: 'Listening',
    items: [
      { label: 'Cambridge IELTS-A', href: '/listening/cambridge-ielts-a' },
      { label: 'Past Exam Paper', href: '#' },
      { label: 'Intensive Listening', href: '#' },
      { label: 'Listening Corpus', href: '#' },
    ],
  },
  {
    label: 'Reading',
    items: [
      { label: 'Cambridge IELTS-A', href: '/reading/cambridge-ielts-a' },
      { label: 'Past Exam Paper-A', href: '#' },
      { label: 'Cambridge IELTS-G', href: '#' },
    ],
  },
  {
    label: 'Mock Tests',
    items: [
      { label: 'Full Mock Test', href: '/full-mock-test' },
      { label: 'Full-length Mock Exam-A', href: '#' },
      { label: 'Full-length Mock Exam-G', href: '#' },
    ],
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="glass w-full z-50 sticky top-0">
      {/* Top bar with logo */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center ai-glow-sm group-hover:ai-glow transition-all duration-300">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
            </div>
            <span className="font-heading font-bold text-xl">
              <span className="text-foreground">IELTS</span>
              <span className="gradient-text-static"> AI</span>
            </span>
          </a>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Auth and Settings */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary">
                      <Shield size={16} />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <SettingsIcon size={16} />
                    Settings
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleAuthClick} className="flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleAuthClick} className="btn-ai gap-2">
                <User size={16} />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-secondary/50 hidden lg:block border-t border-border/50">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1">
            <li>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white rounded-full px-6 py-2 text-sm font-medium"
              >
                Home
              </a>
            </li>
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  to={item.items[0].href} 
                  className="nav-link flex items-center gap-1 py-3 px-4"
                >
                  {item.label}
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                </Link>
                {activeDropdown === item.label && (
                  <div className="absolute top-full left-0 glass-dark shadow-xl rounded-xl py-2 min-w-[200px] animate-fade-in z-50">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.href}
                        className="block px-4 py-2 hover:bg-primary/10 text-sm transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            {/* Analytics & Flashcards & AI Practice */}
            <li>
              <Link
                to="/ai-practice"
                className="nav-link flex items-center gap-2 py-3 px-4"
              >
                <Sparkles size={16} className="text-primary" />
                AI Practice
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className="nav-link flex items-center gap-2 py-3 px-4"
              >
                <BarChart3 size={16} className="text-primary" />
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/flashcards"
                className="nav-link flex items-center gap-2 py-3 px-4"
              >
                <Layers size={16} className="text-accent" />
                Flashcards
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <a
              href="/"
              className="block py-2 text-primary font-semibold"
            >
              Home
            </a>
            {navItems.map((item) => (
              <div key={item.label} className="py-2">
                <button
                  className="flex items-center justify-between w-full py-2 font-medium"
                  onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown size={14} className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === item.label && (
                  <div className="pl-4 border-l-2 border-primary/30 ml-2 mt-2">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.href}
                        className="block py-2 text-sm text-muted-foreground hover:text-primary"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Link to="/ai-practice" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Sparkles size={16} />
                  AI Practice
                </Button>
              </Link>
              <Link to="/analytics" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <BarChart3 size={16} />
                  Analytics
                </Button>
              </Link>
              <Link to="/flashcards" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Layers size={16} />
                  Flashcards
                </Button>
              </Link>
            </div>
            {user && (
              <>
                {isAdmin && (
                  <Link to="/admin" className="block py-2 mt-2">
                    <Button variant="ghost" className="w-full justify-start flex items-center gap-2 text-primary">
                      <Shield size={18} />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link to="/settings" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                    <SettingsIcon size={18} />
                    Settings
                  </Button>
                </Link>
              </>
            )}
            <Button onClick={handleAuthClick} className="w-full mt-4 btn-ai">
              {user ? (
                <>
                  <LogOut size={18} className="mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <User size={18} className="mr-2" />
                  Get Started
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};