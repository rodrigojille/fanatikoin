import '@testing-library/jest-dom';

import { expect } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

process.env.MONGODB_URI = 'mongodb+srv://admin:140290@fanatikoin.fwoyyjo.mongodb.net/fanatikoin-test?retryWrites=true&w=majority&appName=Fanatikoin';
process.env.JWT_SECRET = '900e20635406fc0f89fbc10d1fccfee98395e7607d269fa41278397fdf8adbbc4fc6a3a043be7f369d22609921f9f981696833ddf0e1aa79ab1f15a08ea10e2ab';

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserver;
