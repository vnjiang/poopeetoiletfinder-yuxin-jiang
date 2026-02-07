// src/pages/Register/__tests__/Register.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Register from '../Register';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('../../../components/Auth/RegisterForm', () => {
  return function MockRegisterForm(props) {
    const { onSubmit, isSubmitting, error } = props;

    return (
      <div>
        <h1>Mock RegisterForm</h1>
        <div data-testid="submitting">{String(isSubmitting)}</div>
        {error ? <div data-testid="error">{error}</div> : null}

        <button
          onClick={() =>
            onSubmit({
              username: 'Tom',
              email: 'tom@test.com',
              password: '123456',
            })
          }
        >
          SubmitRegister
        </button>
      </div>
    );
  };
});


const mockRegisterWithEmail = jest.fn();
jest.mock('../../../services/authService', () => ({
  registerWithEmail: (...args) => mockRegisterWithEmail(...args),
}));

const mockMapAuthError = jest.fn();
jest.mock('../../../utils/authErrorMapper', () => ({
  mapAuthError: (...args) => mockMapAuthError(...args),
}));


const mockOnAuthStateChanged = jest.fn();
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock('../../../services/firebase', () => ({
  auth: {},
}));

const renderWithRouter = (ui) =>
  render(<MemoryRouter initialEntries={['/register']}>{ui}</MemoryRouter>);

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockClear();
});

test("renders RegisterForm and Login link", () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  renderWithRouter(<Register />);

  expect(screen.getByText('Mock RegisterForm')).toBeInTheDocument();
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});

test("if Firebase user is already signed in, auto-navigate to /", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb({ uid: 'u1' });
    return () => {};
  });

  renderWithRouter(<Register />);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

test("registration fails: shows mapped auth error and stops submitting", async () => {
  const user = userEvent.setup();

  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  mockRegisterWithEmail.mockResolvedValueOnce({
    ok: false,
    code: 'auth/email-already-in-use',
  });
  mockMapAuthError.mockReturnValueOnce('Email already in use');

  renderWithRouter(<Register />);

  await user.click(screen.getByRole('button', { name: 'SubmitRegister' }));

  expect(await screen.findByTestId('error')).toHaveTextContent(
    'Email already in use'
  );
  expect(screen.getByTestId('submitting')).toHaveTextContent('false');
});

test("registration succeeds: calls registerWithEmail(email, password, username)", async () => {
  const user = userEvent.setup();

  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  mockRegisterWithEmail.mockResolvedValueOnce({ ok: true });

  renderWithRouter(<Register />);

  await user.click(screen.getByRole('button', { name: 'SubmitRegister' }));

  await waitFor(() => {
    expect(mockRegisterWithEmail).toHaveBeenCalledWith(
      'tom@test.com',
      '123456',
      'Tom'
    );
  });
});
