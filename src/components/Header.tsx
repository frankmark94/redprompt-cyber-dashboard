
import { Terminal, Shield, Zap, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-red-500/30 bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-red-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-500 tracking-wider">
                RED<span className="text-green-400">PROMPT</span>
              </h1>
              <p className="text-xs text-gray-400 tracking-wide">
                AI SECURITY TESTING SUITE
              </p>
            </div>
            <nav className="ml-8 space-x-4 hidden md:block">
              <Link to="/" className="text-sm text-gray-300 hover:text-red-400">
                Dashboard
              </Link>
              <Link to="/history" className="text-sm text-gray-300 hover:text-red-400">
                History
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-red-400"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <div className="flex items-center space-x-2 text-green-400">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">ONLINE</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="text-sm">v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
