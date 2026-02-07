import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';


import WriteReviewPage from '../WriteReview';

jest.mock('../../../context/authContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../../context/authContext';


const mockSubmitReview = jest.fn();
jest.mock('../../../services/reviewService', () => ({
  submitReview: (...args) => mockSubmitReview(...args),
}));


jest.mock('../../../components/ReviewForm/ReviewForm', () => {
  return function MockReviewForm(props) {
    const { onSubmit, isSubmitting, submitError } = props;

    return (
      <div>
        <div data-testid="submitting">{String(isSubmitting)}</div>
        {submitError ? <div role="alert">{submitError}</div> : null}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onSubmit({ rating: 5, comment: 'Nice place' })}
        >
          SubmitMock
        </button>
      </div>
    );
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function renderWithRoutes(initialEntries, initialIndex = 0) {
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="/prev" element={<div>PrevPage</div>} />
        <Route path="/login" element={<div>LoginPage</div>} />
        <Route path="/write-review/:toiletId" element={<WriteReviewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

test("Not logged in: should be redirected to /login", async () => {
  useAuth.mockReturnValue({ user: null });

  renderWithRoutes(['/write-review/abc']);

  expect(await screen.findByText('LoginPage')).toBeInTheDocument();
});

test("Logged in: renders page title and description", async () => {
  useAuth.mockReturnValue({
    user: { uid: 'u1', displayName: 'Jiang' },
  });

  renderWithRoutes(['/write-review/abc']);

  expect(await screen.findByText(/Write a review/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Share your experience/i)
  ).toBeInTheDocument();
});

test("Submit success: submitReview receives correct payload, and navigate(-1) goes back to previous page", async () => {
  const user = userEvent.setup();

  useAuth.mockReturnValue({
    user: { uid: 'u1', displayName: 'Jiang' },
  });

  mockSubmitReview.mockResolvedValueOnce({ ok: true });


  renderWithRoutes(['/prev', '/write-review/abc'], 1);

  expect(screen.getByTestId('submitting')).toHaveTextContent('false');

  await user.click(screen.getByRole('button', { name: 'SubmitMock' }));

  await waitFor(() => {
    expect(mockSubmitReview).toHaveBeenCalledTimes(1);
  });

  expect(mockSubmitReview).toHaveBeenCalledWith({
    place_id: 'abc',
    user_id: 'u1',
    user_name: 'Jiang',
    rating: 5,
    comment: 'Nice place',
  });

  expect(await screen.findByText('PrevPage')).toBeInTheDocument();
});

test("Submit failure: shows error message and eventually sets isSubmitting=false", async () => {
  const user = userEvent.setup();

  useAuth.mockReturnValue({
    user: { uid: 'u1', displayName: '' },
  });

  mockSubmitReview.mockRejectedValueOnce(new Error('boom'));

  renderWithRoutes(['/write-review/abc']);

  await user.click(screen.getByRole('button', { name: 'SubmitMock' }));

  expect(
    await screen.findByRole('alert')
  ).toHaveTextContent('Failed to submit your review. Please try again.');

  await waitFor(() => {
    expect(screen.getByTestId('submitting')).toHaveTextContent('false');
  });
});
