import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from '../Header';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = jest.fn();
jest.mock('../../../context/authContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockIsAdminUser = jest.fn();
jest.mock('../../../utils/permissions', () => ({
  isAdminUser: (...args) => mockIsAdminUser(...args),
}));


describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAdminUser.mockReturnValue(false);
  });

  test('always shows Home and brand', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<Header />);

    expect(screen.getByText('PooPee')).toBeInTheDocument();
    expect(screen.getByTitle('Home')).toBeInTheDocument();
  });

  test('when user is null, shows Login & Register, not User', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<Header />);

    expect(screen.getByTitle('Login')).toBeInTheDocument();
    expect(screen.getByTitle('Register')).toBeInTheDocument();
    expect(screen.queryByTitle('User')).not.toBeInTheDocument();
  });

  test('when user exists, shows User, not Login/Register', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '1' } });

    render(<Header />);

    expect(screen.getByTitle('User')).toBeInTheDocument();
    expect(screen.queryByTitle('Login')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Register')).not.toBeInTheDocument();
  });

  test('shows Admin only when isAdminUser(user) is true', () => {
    mockUseAuth.mockReturnValue({ user: { uid: '1' } });
    mockIsAdminUser.mockReturnValue(true);

    render(<Header />);

    expect(screen.getByTitle('Admin')).toBeInTheDocument();
  });

  test('click buttons call navigate with correct routes', async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: null });

    render(<Header />);

    await user.click(screen.getByTitle('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');

    await user.click(screen.getByTitle('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    await user.click(screen.getByTitle('Register'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
