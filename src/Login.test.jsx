import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByText('Login');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  test('validates input fields', () => {
    render(<Login />);
    const loginButton = screen.getByText('Login');

    fireEvent.click(loginButton);
    const errorMessage = screen.getByText('Email is required');
    expect(errorMessage).toBeInTheDocument();
  });
});