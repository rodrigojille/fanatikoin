/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'next-i18next';
import Marketplace from '@/pages/marketplace';
import { useWeb3 } from '@/context/Web3Context';
import { useToken } from '@/context/TokenContext';

// Mock the Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, priority, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  ),
}));

// Mock the modules
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@/context/Web3Context', () => ({
  useWeb3: jest.fn(),
}));

jest.mock('@/context/TokenContext', () => ({
  useToken: () => ({
    tokens: [],
    loading: false,
    error: null,
    fetchTokens: jest.fn(),
  }),
}));

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: Array<React.ReactElement> }) => <>{children}</>,
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    basePath: '',
    pathname: '/marketplace',
    route: '/marketplace',
    asPath: '/marketplace',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}));

describe('Marketplace', () => {
  beforeEach(() => {
    (useWeb3 as jest.Mock).mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      address: null,
      isConnecting: false,
      isCorrectChain: true,
    });
  });

  it('renders without crashing', () => {
    render(<Marketplace />);
    expect(screen.getByText('marketplace.title')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<Marketplace />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays filter options', () => {
    render(<Marketplace />);
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // Category and Sort selects
  });

  it('displays connect wallet message when not connected', () => {
    render(<Marketplace />);
    expect(screen.getByText('marketplace.wallet.connect.message')).toBeInTheDocument();
  });
});
