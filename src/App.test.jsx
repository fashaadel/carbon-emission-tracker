import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';

const queryClient = new QueryClient();

const MockApp = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

describe('App Component', () => {
  test('renders Carbon Emission Tracker headline', () => {
    render(<MockApp />);
    const headingElement = screen.getByText(/Carbon Emission Tracker/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('toggles theme', () => {
    render(<MockApp />);
    const toggleButton = screen.getByText(/Toggle Theme/i);
    fireEvent.click(toggleButton);
    expect(document.body.className).toBe('dark');
    fireEvent.click(toggleButton);
    expect(document.body.className).toBe('light');
  });

  test('shows loading when data is being fetched', () => {
    const { queryResult } = require('react-query');
    queryResult.mockReturnValue({ isLoading: true });

    render(<MockApp />);
    const loadingElement = screen.getByText(/Loading data/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('shows error message when there is an error', () => {
    const { queryResult } = require('react-query');
    queryResult.mockReturnValue({ error: { message: 'Error fetching data' } });

    render(<MockApp />);
    const errorElement = screen.getByText(/Error loading data/i);
    expect(errorElement).toBeInTheDocument();
  });
});