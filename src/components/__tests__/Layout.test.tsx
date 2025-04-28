/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'next-i18next';
import Layout from '../Layout';
import { useWeb3 } from '@/context/Web3Context';

// Mock the Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, priority, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} {...props} />
  ),
  generateImageSrc: () => '/favicon.ico',
  getPriority: () => ({ priority: 'auto' })
}));

// Mock the modules
jest.mock('next-i18next', () => ({
  useTranslation: (namespace: string) => {
    const translations = {
      'connect.connectWallet': 'Connect Wallet',
      'connect.connectMessage': 'Please connect your wallet to access the marketplace',
      'connect.connecting': 'Connecting...',
      'connect.connected': 'Connected',
      'connect.disconnect': 'Disconnect',
      'network.connected': 'Connected to Chiliz Network',
      'network.wrong': 'Wrong Network',
      'network.wrongMessage': 'Please switch to the Chiliz Network',
      'network.switch': 'Switch Network',
      'network.switchSuccess': 'Successfully switched to {{network}}',
      'network.addSuccess': 'Successfully added {{network}}',
      'network.addError': 'Error adding {{network}}',
      'network.switchError': 'Error switching to {{network}}',
      'network.connectSuccess': 'Successfully connected to {{network}}'
    };

    return {
      t: (key: string) => translations[key] || key,
      i18n: {
        language: 'en',
        changeLanguage: jest.fn(),
        getFixedT: (ns: string) => {
          if (ns === 'common') {
            return (key: string) => translations[key] || key;
          }
          return (key: string) => translations[key] || key;
        }
      },
      ready: true
    };
  },
}));

jest.mock('@/context/Web3Context', () => ({
  useWeb3: jest.fn(),
}));

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

const mockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
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
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

describe('Layout', () => {
  beforeEach(() => {
    (useWeb3 as jest.Mock).mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      address: null,
      isConnecting: false,
      isCorrectChain: false,
    });
  });

  it('renders without crashing', () => {
    render(<Layout>Test Content</Layout>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays connect wallet button when not connected', () => {
    render(<Layout>Test Content</Layout>);
    expect(screen.getByText('Connect Wallet', { 
      selector: 'button',
      exact: false 
    })).toBeInTheDocument();
    expect(screen.getByText('Please connect your wallet to access the marketplace')).toBeInTheDocument();
  });

  it('displays address when connected', () => {
    (useWeb3 as jest.Mock).mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      address: '0x1234567890123456789012345678901234567890',
      isConnecting: false,
      isCorrectChain: true,
    });

    render(<Layout>Test Content</Layout>);
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
  });

  it('displays wrong network warning when connected but wrong network', () => {
    (useWeb3 as jest.Mock).mockReturnValue({
      connect: jest.fn(),
      disconnect: jest.fn(),
      address: '0x1234567890123456789012345678901234567890',
      isConnecting: false,
      isCorrectChain: false,
    });

    render(<Layout>Test Content</Layout>);
    expect(screen.getByText('Wrong Network')).toBeInTheDocument();
    expect(screen.getByText('Please switch to the Chiliz Network')).toBeInTheDocument();
  });
});
