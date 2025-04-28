import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletButton } from '../WalletButton';
import { useUser } from '@/context/UserContext';
import '@testing-library/jest-dom';

jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn()
}));

describe('WalletButton', () => {
  const mockLoginWithWallet = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      loginWithWallet: mockLoginWithWallet,
      error: null,
      loading: false
    });
  });

  it('renders connect wallet button correctly', () => {
    render(<WalletButton />);
    expect(screen.getByRole('button')).toHaveTextContent(/connect wallet/i);
  });

  it('handles wallet connection click', async () => {
    render(<WalletButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLoginWithWallet).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    (useUser as jest.Mock).mockReturnValue({
      loginWithWallet: mockLoginWithWallet,
      error: null,
      loading: true
    });

    render(<WalletButton />);
    
    expect(screen.getByRole('button')).toHaveTextContent(/connecting/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message', () => {
    (useUser as jest.Mock).mockReturnValue({
      loginWithWallet: mockLoginWithWallet,
      error: 'MetaMask not installed',
      loading: false
    });

    render(<WalletButton />);
    
    expect(screen.getByText('MetaMask not installed')).toBeInTheDocument();
  });
});
