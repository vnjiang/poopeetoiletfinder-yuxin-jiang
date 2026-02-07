import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RateAndReviewPage from '../RateAndReview';


jest.mock('../../../services/reviewService', () => ({
  fetchReviewsByToilet: jest.fn(),
  deleteReview: jest.fn(),
}));


jest.mock('../../../context/authContext', () => ({
  useAuth: jest.fn(),
}));


const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));



jest.mock('../../../components/RateAndReview/ReviewSummary', () => (props) => (
  <div data-testid="review-summary">
    <div>avg:{props.avgRating}</div>
    <div>total:{props.total}</div>
    <button onClick={props.onWrite}>write</button>
  </div>
));

jest.mock('../../../components/RateAndReview/ReviewList', () => (props) => (
  <div data-testid="review-list">
    {props.reviews.map((r) => (
      <div key={r._id}>
        <span>{r.comment}</span>
        <button onClick={() => props.onDelete(r._id)}>delete</button>
      </div>
    ))}
  </div>
));

import { fetchReviewsByToilet, deleteReview } from '../../../services/reviewService';
import { useAuth } from '../../../context/authContext';
import { useParams } from 'react-router-dom';

describe('RateAndReviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ toiletId: 't1' });
  });

  test('shows "Loading..." initially, then renders Summary and List after a successful fetch', async () => {
    useAuth.mockReturnValue({ user: { _id: 'u1' } });

    fetchReviewsByToilet.mockResolvedValueOnce([
      { _id: 'r1', rating: 4, comment: 'good' },
      { _id: 'r2', rating: 2, comment: 'bad' },
    ]);

    render(<RateAndReviewPage />);

    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    expect(await screen.findByTestId('review-summary')).toBeInTheDocument();
    expect(screen.getByTestId('review-list')).toBeInTheDocument();

    expect(screen.getByText('avg:3')).toBeInTheDocument();
    expect(screen.getByText('total:2')).toBeInTheDocument();

    expect(fetchReviewsByToilet).toHaveBeenCalledWith('t1');
  });

  test('shows an error message when the request fails', async () => {
    useAuth.mockReturnValue({ user: { _id: 'u1' } });
    fetchReviewsByToilet.mockRejectedValueOnce(new Error('boom'));

    render(<RateAndReviewPage />);

    expect(await screen.findByText(/Failed to load reviews/i)).toBeInTheDocument();
  });

  test('clicking "write": when logged in -> navigates to /write-review/:toiletId', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { _id: 'u1' } });
    fetchReviewsByToilet.mockResolvedValueOnce([]);

    render(<RateAndReviewPage />);
    
    await screen.findByTestId('review-summary');

    await user.click(screen.getByRole('button', { name: /write/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/write-review/t1');
  });

  test('clicking "write": when not logged in -> navigates to /login', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: null });
    fetchReviewsByToilet.mockResolvedValueOnce([]);

    render(<RateAndReviewPage />);
    await screen.findByTestId('review-summary');

    await user.click(screen.getByRole('button', { name: /write/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('deletes a review: calls deleteReview and removes it from the list', async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { _id: 'u1' } });

    fetchReviewsByToilet.mockResolvedValueOnce([
      { _id: 'r1', rating: 5, comment: 'nice' },
      { _id: 'r2', rating: 1, comment: 'awful' },
    ]);

    deleteReview.mockResolvedValueOnce({ ok: true });

    render(<RateAndReviewPage />);
    await screen.findByTestId('review-list');

    expect(screen.getByText('nice')).toBeInTheDocument();
    expect(screen.getByText('awful')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(deleteReview).toHaveBeenCalledWith('r1');

    
    await waitFor(() => {
      expect(screen.queryByText('nice')).not.toBeInTheDocument();
      expect(screen.getByText('awful')).toBeInTheDocument();
    });
  });
});
