import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('http://localhost:3005/api/auth/register', async () => {
    return HttpResponse.json({
      token: 'mock_token',
      user: {
        _id: 'mock_id',
        username: 'testuser',
        email: 'test@example.com'
      }
    }, { status: 201 });
  }),

  http.post('http://localhost:3005/api/auth/login', async () => {
    return HttpResponse.json({
      token: 'mock_token',
      user: {
        _id: 'mock_id',
        username: 'testuser',
        email: 'test@example.com'
      }
    }, { status: 200 });
  }),

  http.post('http://localhost:3005/api/auth/wallet-login', async ({ request }) => {
    const data = await request.json();
    const { address } = data as { address: string };
    return HttpResponse.json({
      token: 'mock_token',
      user: {
        _id: 'mock_id',
        username: `User_${address.slice(0, 6)}`,
        email: `${address.slice(0, 6)}@wallet.local`,
        walletAddress: address
      }
    }, { status: 200 });
  }),

  // User endpoints
  http.patch('http://localhost:3005/api/users/:id', async ({ request, params }) => {
    const data = await request.json();
    const { username } = data as { username: string };
    return HttpResponse.json({
      _id: params.id,
      username,
      email: 'test@example.com'
    }, { status: 200 });
  }),

  // Contract endpoints
  http.post('http://localhost:3005/api/tokens', async ({ request }) => {
    const data = await request.json();
    const { name, symbol } = data as { name: string; symbol: string };
    return HttpResponse.json({
      address: '0x123...',
      name,
      symbol,
      transactionHash: '0x456...'
    }, { status: 201 });
  })
];

export const server = setupServer(...handlers);
