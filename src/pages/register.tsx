import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { WalletButton } from '@/components/auth/WalletButton';
import MetaMaskWarning from '@/components/auth/MetaMaskWarning';
import { metamaskService } from '@/services/metamask';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto">
        <RegisterForm />
        
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="mt-6">
            {!metamaskService.isMetaMaskAvailable() && <MetaMaskWarning />}
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
