import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Admin from '../Admin';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../hooks/useAdminAccess', () => ({
  useAdminAccess: jest.fn(),
}));
import { useAdminAccess } from '../../../hooks/useAdminAccess';

jest.mock('../../../services/adminService', () => ({
  fetchPendingToilets: jest.fn(),
  approveToilet: jest.fn(),
  rejectToilet: jest.fn(),
}));
import {
  fetchPendingToilets,
  approveToilet,
  rejectToilet,
} from '../../../services/adminService';


jest.mock('../../../components/Admin/AdminList', () => {
  return function MockAdminList({ items, onApprove, onReject }) {
    return (
      <div>
        {items.map((it) => (
          <div key={it._id}>
            <span>{it.toilet_name}</span>
            <button onClick={() => onApprove(it)}>Approve</button>
            <button onClick={() => onReject(it._id)}>Reject</button>
          </div>
        ))}
      </div>
    );
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});




test('shows Loading... while auth loading or data loading', async () => {
  useAdminAccess.mockReturnValue({ isAdmin: false, loading: true });
  fetchPendingToilets.mockImplementationOnce(() => new Promise(() => {}));

  render(<Admin />);
  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});

test('redirects to / when not admin', async () => {
  useAdminAccess.mockReturnValue({ isAdmin: false, loading: false });
  fetchPendingToilets.mockImplementationOnce(() => new Promise(() => {}));

  render(<Admin />);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

test('renders items after fetchPendingToilets resolves', async () => {
  useAdminAccess.mockReturnValue({ isAdmin: true, loading: false });
  fetchPendingToilets.mockResolvedValueOnce([
    { _id: '1', toilet_name: 'Costa' },
    { _id: '2', toilet_name: 'WGB' },
  ]);

  render(<Admin />);

  expect(await screen.findByText('Admin Review Panel')).toBeInTheDocument();
  expect(await screen.findByText('Costa')).toBeInTheDocument();
  expect(screen.getByText('WGB')).toBeInTheDocument();
});

test('shows error text when fetchPendingToilets fails', async () => {
  useAdminAccess.mockReturnValue({ isAdmin: true, loading: false });
  fetchPendingToilets.mockRejectedValueOnce(new Error('boom'));

  render(<Admin />);

  expect(await screen.findByText(/Failed to load data/i)).toBeInTheDocument();
});

test('approve removes item from list', async () => {
  const user = userEvent.setup();
  useAdminAccess.mockReturnValue({ isAdmin: true, loading: false });
  fetchPendingToilets.mockResolvedValueOnce([
    { _id: '1', toilet_name: 'Costa' },
    { _id: '2', toilet_name: 'WGB' },
  ]);
  approveToilet.mockResolvedValueOnce({ ok: true });

  render(<Admin />);

  expect(await screen.findByText('Costa')).toBeInTheDocument();

  const approveButtons = screen.getAllByRole('button', { name: /approve/i });
  await user.click(approveButtons[0]);

  await waitFor(() => {
    expect(approveToilet).toHaveBeenCalled();
  });

  expect(screen.queryByText('Costa')).not.toBeInTheDocument();
  expect(screen.getByText('WGB')).toBeInTheDocument();
});

test('reject removes item from list', async () => {
  const user = userEvent.setup();
  useAdminAccess.mockReturnValue({ isAdmin: true, loading: false });
  fetchPendingToilets.mockResolvedValueOnce([
    { _id: '1', toilet_name: 'Costa' },
    { _id: '2', toilet_name: 'WGB' },
  ]);
  rejectToilet.mockResolvedValueOnce({ ok: true });

  render(<Admin />);

  expect(await screen.findByText('Costa')).toBeInTheDocument();

  const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
  await user.click(rejectButtons[0]);

  await waitFor(() => {
    expect(rejectToilet).toHaveBeenCalledWith('1');
  });

  expect(screen.queryByText('Costa')).not.toBeInTheDocument();
  expect(screen.getByText('WGB')).toBeInTheDocument();
});
