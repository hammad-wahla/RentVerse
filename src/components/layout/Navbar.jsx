import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../context/WalletContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { account, isConnected, isInitializing, connectWallet, disconnectWallet, formatAddress } = useWallet();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="bg-white shadow-sm dark:bg-secondary-900 dark:border-b dark:border-secondary-800">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg width="30" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="20" r="10" stroke="#0682ff" />
                <circle cx="15" cy="20" r="6" stroke="#0682ff" strokeWidth="3" />
              </svg>
              <span className="text-2xl font-bold text-primary-600 mt-1.5">RentVerse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium dark:text-secondary-300 dark:hover:text-primary-400"
              >
                {item.name}
              </Link>
            ))}

            {isInitializing ? (
              <div className="h-9 w-24 bg-secondary-200 dark:bg-secondary-800 animate-pulse rounded-md"></div>
            ) : isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs px-3 py-1.5 rounded-md bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 font-mono font-medium border border-secondary-200 dark:border-secondary-700">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-xs px-2.5 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium border border-red-200 dark:border-red-800/40"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn">
                Connect
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-secondary-600 hover:text-primary-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isInitializing ? (
                <div className="h-9 w-full bg-secondary-200 dark:bg-secondary-800 animate-pulse rounded-md"></div>
              ) : isConnected ? (
                <button
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                  onClick={() => {
                    disconnectWallet();
                    setIsOpen(false);
                  }}
                >
                  Disconnect ({formatAddress(account)})
                </button>
              ) : (
                <button
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  onClick={() => {
                    connectWallet();
                    setIsOpen(false);
                  }}
                >
                  Connect Wallet
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;