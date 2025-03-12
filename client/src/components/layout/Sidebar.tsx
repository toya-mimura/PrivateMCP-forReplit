import { Link } from "wouter";
import { 
  Home, 
  MessageSquare, 
  Box, 
  Database, 
  Key, 
  Settings, 
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

interface SidebarProps {
  activePath: string;
  onLogout: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  user: User | null;
  onNavItemClick?: () => void;
}

export default function Sidebar({ 
  activePath, 
  onLogout, 
  theme, 
  onThemeToggle,
  user,
  onNavItemClick 
}: SidebarProps) {
  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { path: "/chat", icon: <MessageSquare className="h-5 w-5" />, label: "Chat Interface" },
    { path: "/providers", icon: <Database className="h-5 w-5" />, label: "AI Providers" },
    { path: "/tools", icon: <Box className="h-5 w-5" />, label: "Tool Registry" },
    { path: "/tokens", icon: <Key className="h-5 w-5" />, label: "Access Tokens" },
    { path: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === '/' && activePath === '/') return true;
    if (path !== '/' && activePath.startsWith(path)) return true;
    return false;
  };

  const handleNavClick = () => {
    if (onNavItemClick) onNavItemClick();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full">
      {/* Logo and Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="font-semibold text-xl">MCP Server</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path} onClick={handleNavClick}>
            <div 
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "text-primary bg-blue-50 dark:bg-slate-700"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Info & Theme Toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {user ? getInitials(user.username) : 'G'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username || 'Guest'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user ? 'Logged in' : 'Not logged in'}
              </p>
            </div>
          </div>
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onThemeToggle} 
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout} 
              className="rounded-full text-red-500"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
