import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const WalletButton: React.FC = () => {
  const { loginWithWallet, loading, error } = useAuth();

  const handleConnect = async () => {
    try {
      await loginWithWallet();
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`py-2 px-6 rounded-lg text-white font-medium ${
          loading
            ? 'bg-orange-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};
