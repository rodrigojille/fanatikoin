import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../Settings';

// Mock both contexts
jest.mock('@/context/Web3Context', () => ({
  useWeb3: () => ({
    isConnecting: false,
    isCorrectChain: true,
  }),
}));

jest.mock('../../../context/UserContext', () => ({
  useUser: () => ({
    address: '0x1234567890abcdef',
    profile: null,
    isAuthenticated: true,
  }),
}));

describe('Settings Component', () => {
  it('renders settings page when user is connected', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Display')).toBeInTheDocument();
  });

  it('shows connect wallet message when not connected', () => {
    jest.spyOn(require('../../../context/UserContext'), 'useUser')
      .mockImplementation(() => ({
        address: null,
        profile: null,
        isAuthenticated: false,
      }));

    render(<Settings />);
    expect(screen.getByText('Please connect your wallet to access settings')).toBeInTheDocument();
  });
});
