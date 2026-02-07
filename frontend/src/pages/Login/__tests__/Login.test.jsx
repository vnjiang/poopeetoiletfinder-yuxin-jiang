import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';


import LoginPage from '../Login';


const mockNavigate = jest.fn();
const renderWithRouter = (ui, { route = '/' } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);


const user = userEvent.setup();


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('../../../components/Auth/LoginForm', () => {
  return function MockLoginForm(props) {
    const { onLogin, onResetPassword, isSubmitting, error, info } = props;

    return (
      <div>
        <h1>Mock LoginForm</h1>

        <div data-testid="submitting">{String(isSubmitting)}</div>
        {error ? <div data-testid="error">{error}</div> : null}
        {info ? <div data-testid="info">{info}</div> : null}

        <button onClick={() => onLogin({ email: 'a@a.com', password: '123456' })}>
          Login
        </button>

        <button onClick={() => onResetPassword('a@a.com')}>
          ResetWithEmail
        </button>

        <button onClick={() => onResetPassword('')}>
          ResetWithoutEmail
        </button>
      </div>
    );
  };
});



const mockLoginWithEmail = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('../../../services/authService', () => ({
  loginWithEmail: (...args) => mockLoginWithEmail(...args),
  resetPassword: (...args) => mockResetPassword(...args),
}));



const mockOnAuthStateChanged = jest.fn();

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

jest.mock('../../../services/firebase', () => ({
  auth: {}, 
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockClear();
});

test("renders LoginForm and the Register link", () => {

  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  renderWithRouter(<LoginPage />);

  expect(screen.getByText('Mock LoginForm')).toBeInTheDocument();
  expect(screen.getByText(/Register/i)).toBeInTheDocument();
});

test("if Firebase already has a signed-in user, it redirects to / automatically", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb({ uid: 'u1' }); 
    return () => {};
  });

  renderWithRouter(<LoginPage />);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

test("clicking Login: shows error message when loginWithEmail fails", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  mockLoginWithEmail.mockResolvedValueOnce({
    ok: false,
    message: 'Wrong password',
  });

  renderWithRouter(<LoginPage />);

  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByTestId('error')).toHaveTextContent('Wrong password');
});


test("clicking ResetWithoutEmail: shows 'Please enter your email first.'", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  renderWithRouter(<LoginPage />);

  await user.click(screen.getByRole('button', { name: 'ResetWithoutEmail' }));

  expect(await screen.findByTestId('error')).toHaveTextContent(
    'Please enter your email first.'
  );
});

test("clicking ResetWithEmail: shows info when resetPassword succeeds", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  mockResetPassword.mockResolvedValueOnce({ ok: true });
  renderWithRouter(<LoginPage />);

  await user.click(screen.getByRole('button', { name: 'ResetWithEmail' }));

  expect(mockResetPassword).toHaveBeenCalled();
  expect(await screen.findByTestId('info')).toHaveTextContent(
    'Password reset email sent.'
  );
});

test("clicking ResetWithEmail: shows error when resetPassword fails", async () => {
  mockOnAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });

  mockResetPassword.mockResolvedValueOnce({ ok: false, message: 'No such user' });

  renderWithRouter(<LoginPage />);

  await user.click(screen.getByRole('button', { name: 'ResetWithEmail' }));

  expect(await screen.findByTestId('error')).toHaveTextContent('No such user');
});
