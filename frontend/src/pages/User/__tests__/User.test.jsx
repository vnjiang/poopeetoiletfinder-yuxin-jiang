// src/pages/User/__tests__/User.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import User from '../User';

jest.mock('../../../context/authContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../../context/authContext';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));


const mockSignOut = jest.fn();
jest.mock('firebase/auth', () => ({
  signOut: (...args) => mockSignOut(...args),
}));
jest.mock('../../../services/firebase', () => ({
  auth: { mock: true },
}));


const mockFetchUserReviews = jest.fn();
const mockDeleteUserReview = jest.fn();
jest.mock('../../../services/userService', () => ({
  fetchUserReviews: (...args) => mockFetchUserReviews(...args),
  deleteUserReview: (...args) => mockDeleteUserReview(...args),
}));


jest.mock('../../../components/User/UserProfileCard', () => {
  return function UserProfileCardMock({ user, onLogout }) {
    return (
      <div>
        <div data-testid="profile-email">{user?.email}</div>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  };
});

jest.mock('../../../components/User/UserReviewList', () => {
  return function UserReviewListMock({ reviews, onDelete }) {
    return (
      <div>
        <div data-testid="review-count">{reviews?.length ?? 0}</div>
        <ul>
          {(reviews || []).map((r) => (
            <li key={r._id}>
              <span>{r.title}</span>
              <button onClick={() => onDelete(r._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
});

describe('User page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows Loading initially, then renders reviews after data loads", async () => {
    useAuth.mockReturnValue({
      user: { uid: 'u1', email: 'test@example.com' },
    });

    mockFetchUserReviews.mockResolvedValueOnce([
      { _id: 'r1', title: 'Review 1' },
      { _id: 'r2', title: 'Review 2' },
    ]);

    render(<User />);

    expect(
      screen.getByText(/Loading user data\.\.\./i)
    ).toBeInTheDocument();


    expect(
      await screen.findByText(/Your reviews/i)
    ).toBeInTheDocument();

    expect(mockFetchUserReviews).toHaveBeenCalledWith('u1');

    expect(screen.getByTestId('review-count')).toHaveTextContent('2');
    expect(screen.getByText('Review 1')).toBeInTheDocument();
    expect(screen.getByText('Review 2')).toBeInTheDocument();
  });

  test("clicking Logout calls signOut and navigates to /login", async () => {
    useAuth.mockReturnValue({
      user: { uid: 'u1', email: 'test@example.com' },
    });

    mockFetchUserReviews.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<User />);

    await screen.findByText(/Your reviews/i);

    mockSignOut.mockResolvedValueOnce();

    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test("deleting a review removes it from UI optimistically and calls deleteUserReview", async () => {
    useAuth.mockReturnValue({
      user: { uid: 'u1', email: 'test@example.com' },
    });

    mockFetchUserReviews.mockResolvedValueOnce([
      { _id: 'r1', title: 'Review 1' },
      { _id: 'r2', title: 'Review 2' },
    ]);

    mockDeleteUserReview.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(<User />);

    await screen.findByText(/Your reviews/i);
    expect(screen.getByTestId('review-count')).toHaveTextContent('2');

 
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    expect(screen.getByTestId('review-count')).toHaveTextContent('1');
    expect(screen.queryByText('Review 1')).not.toBeInTheDocument();

    expect(mockDeleteUserReview).toHaveBeenCalledWith('r1');
  });

  test("when user is missing, it does not call fetchUserReviews (current behavior: stays loading)", async () => {
    useAuth.mockReturnValue({ user: null });

    render(<User />);

    expect(mockFetchUserReviews).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Loading user data\.\.\./i)
    ).toBeInTheDocument();
  });
});
