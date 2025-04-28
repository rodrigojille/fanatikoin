import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { useUser } from '@/context/UserContext';
import '@testing-library/jest-dom';

// Mock the UserContext hook
jest.mock('@/context/UserContext', () => ({
  useUser: jest.fn()
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
      loading: false
    });
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('displays loading state', () => {
    (useUser as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
      loading: true
    });

    render(<LoginForm />);
    
    expect(screen.getByRole('button')).toHaveTextContent(/logging in/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message', () => {
    (useUser as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: 'Invalid credentials',
      loading: false
    });

    render(<LoginForm />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
