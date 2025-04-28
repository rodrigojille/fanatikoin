import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';
import { server } from '../../mocks/server';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock fetch
global.fetch = jest.fn();

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.ethereum
global.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  autoRefreshOnNetworkChange: false,
  chainId: '0x1',
  networkVersion: '1',
  selectedAddress: null,
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock;
