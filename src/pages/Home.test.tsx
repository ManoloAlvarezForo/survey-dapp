// Home.test.tsx
import { render, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Home from './Home';

describe('Home Component', () => {
  test('renders without errors', () => {
    const queryClient = new QueryClient();

    act(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      );
    });
  });
});
