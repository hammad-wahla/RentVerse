import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Helper to fetch ETH balance for a given address
  const updateBalance = useCallback(async (userAccount, provider) => {
    try {
      const activeProvider = provider || new ethers.providers.Web3Provider(window.ethereum);
      const rawBalance = await activeProvider.getBalance(userAccount);
      setBalance(ethers.utils.formatEther(rawBalance));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance(null);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      const errorMsg = 'MetaMask is not installed. Please install the MetaMask extension.';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts && accounts.length > 0) {
        const userAccount = accounts[0];
        setAccount(userAccount);
        await updateBalance(userAccount, provider);
        setError(null);
      }
    } catch (err) {
      if (err.code === 4001) {
        // User rejected the connection request in MetaMask
        setError('Connection request rejected by user.');
      } else {
        setError(err.message || 'Failed to connect wallet.');
      }
    }
  }, [updateBalance]);

  useEffect(() => {
    if (!window.ethereum) {
      setIsInitializing(false);
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Silent check on initial mount using eth_accounts (does NOT trigger popup)
    const checkConnectedWallet = async () => {
      try {
        const accounts = await provider.send('eth_accounts', []);
        if (accounts && accounts.length > 0) {
          const activeAccount = accounts[0];
          setAccount(activeAccount);
          await updateBalance(activeAccount, provider);
        }
      } catch (err) {
        console.error('Error checking authorized accounts:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    checkConnectedWallet();

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        await updateBalance(newAccount, provider);
      }
      setIsInitializing(false);
    };

    // Event listener for network/chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, updateBalance]);

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        error,
        isInitializing,
        connectWallet,
        disconnectWallet,
        isConnected: !isInitializing && !!account,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
