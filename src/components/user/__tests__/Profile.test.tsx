import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../Profile';
import { UserProvider } from '../../../context/UserContext';
import Web3Provider from "@/context/Web3Context";

// Mock the contexts
jest.mock('@/context/Web3Context', () => ({
  useWeb3: () => ({
    address: '0x1234567890abcdef',
    isConnecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
  Web3Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../../context/UserContext', () => ({
  useUser: () => ({
    address: '0x1234567890abcdef',
    balance: '1000000000000000000',
    profile: null,
    updateProfile: jest.fn(),
    isAuthenticated: true,
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProfile = () => {
    return render(
      <Web3Provider>
        <UserProvider>
          <Profile />
        </UserProvider>
      </Web3Provider>
    );
  };

  it('renders wallet address and balance', () => {
    renderProfile();
    expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
    expect(screen.getByText('1 CHZ')).toBeInTheDocument();
  });

  it('shows edit form when clicking edit button', () => {
    renderProfile();
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Avatar URL')).toBeInTheDocument();
  });

  it('shows connect wallet message when not connected', () => {
    jest.spyOn(require('../../../context/UserContext'), 'useUser').mockImplementation(() => ({
      address: null,
      balance: '0',
      profile: null,
      updateProfile: jest.fn(),
      isAuthenticated: false,
    }));

    renderProfile();
    expect(screen.getByText('Please connect your wallet to view your profile')).toBeInTheDocument();
  });

  it('can update profile information', async () => {
    const mockUpdateProfile = jest.fn();
    jest.spyOn(require('../../../context/UserContext'), 'useUser').mockImplementation(() => ({
      address: '0x1234567890abcdef',
      balance: '1000000000000000000',
      profile: null,
      updateProfile: mockUpdateProfile,
      isAuthenticated: true,
    }));

    renderProfile();
    
    // Open edit form
    fireEvent.click(screen.getByText('Edit Profile'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify updateProfile was called with correct data
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      avatar: '',
      createdAt: expect.any(Number),
    });
  });
});
