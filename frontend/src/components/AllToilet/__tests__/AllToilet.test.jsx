// src/pages/AllToilet/__tests__/AllToilet.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllToilet from '../AllToilet';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockFetch = jest.fn();
const mockUserToToiletNavigation = jest.fn();
const mockRateAndReviewClick = jest.fn();
const mockRenderStar = jest.fn();

jest.mock('../../../utils/utils', () => ({
  fetchToiletsWithRatingAndDistance: (...args) => mockFetch(...args),
  userToToiletNavigation: (...args) => mockUserToToiletNavigation(...args),
  rateAndReviewClick: (...args) => mockRateAndReviewClick(...args),
  renderStarAverageRatingCount: (...args) => mockRenderStar(...args),
}));


const mockGetFeeLabel = jest.fn();
jest.mock('../../../utils/priceLabel', () => ({
  getFeeLabel: (...args) => mockGetFeeLabel(...args),
}));

function makeToilet(i, distanceKm, reviewCount = 0) {
  return {
    _id: `id-${i}`,
    place_id: `place-${i}`,
    toilet_name: `Toilet ${i}`,
    toiletDistance: distanceKm,
    toilet_paper_accessibility: i % 2 === 0,
    averageRating: 4.2,
    reviewCount,
    location: { coordinates: [ -6.0 - i * 0.01, 53.0 + i * 0.01 ] }, 
  };
}

describe('AllToilet', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFeeLabel.mockReturnValue('Free');
    mockRateAndReviewClick.mockImplementation((placeId) => `/rate/${placeId}`);
    mockUserToToiletNavigation.mockReturnValue('https://maps.example/nav');
    mockRenderStar.mockReturnValue(<span>★★★★☆ (10)</span>);
  });

  test('renders header', () => {
    render(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);
    expect(screen.getByText('Nearby toilets')).toBeInTheDocument();
    expect(screen.getByText(/Sorted by distance/i)).toBeInTheDocument();
  });

  test('does not fetch if userLocation is missing lat/lng', async () => {
    render(<AllToilet userLocation={{}} />);
    expect(mockFetch).not.toHaveBeenCalled();

    render(<AllToilet userLocation={null} />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('fetches toilets, sorts by distance, and shows only top 10', async () => {
    const data = [
      makeToilet(1, 3.2, 5),
      makeToilet(2, 0.4, 2),
      makeToilet(3, 1.1, 0),
      makeToilet(4, 2.0, 1),
      makeToilet(5, 0.9, 3),
      makeToilet(6, 1.5, 4),
      makeToilet(7, 2.7, 0),
      makeToilet(8, 0.2, 8),
      makeToilet(9, 4.1, 2),
      makeToilet(10, 3.9, 0),
      makeToilet(11, 0.8, 1),
      makeToilet(12, 2.2, 1),
    ];
    mockFetch.mockResolvedValueOnce(data);

    render(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Toilet 8')).toBeInTheDocument();
    const navButtons = await screen.findAllByRole('button', { name: /Navigate/i });
    expect(navButtons).toHaveLength(10);
  });

  test('Navigate button opens a new tab with navigation url', async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    mockFetch.mockResolvedValueOnce([makeToilet(1, 0.5, 1)]);

    render(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);

    const btn = await screen.findByRole('button', { name: /Navigate/i });
    await user.click(btn);

    expect(mockUserToToiletNavigation).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith('https://maps.example/nav', '_blank');

    openSpy.mockRestore();
  });

  test('Rate & Review button navigates to the correct route', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce([makeToilet(1, 0.5, 1)]);

    render(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);

    const btn = await screen.findByRole('button', { name: /Rate & Review/i });
    await user.click(btn);

    expect(mockRateAndReviewClick).toHaveBeenCalledWith('place-1');
    expect(mockNavigate).toHaveBeenCalledWith('/rate/place-1');
  });

  test('shows "No reviews yet" when reviewCount is 0, otherwise renders stars', async () => {
    mockFetch
      .mockResolvedValueOnce([makeToilet(1, 0.5, 0)])
      .mockResolvedValueOnce([makeToilet(2, 0.6, 3)]);

    const { rerender } = render(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);
    expect(await screen.findByText(/No reviews yet/i)).toBeInTheDocument();

    rerender(<AllToilet userLocation={{ lat: 53.3, lng: -6.2 }} />);
    await waitFor(() => expect(mockRenderStar).toHaveBeenCalled());
    expect(screen.getByText('★★★★☆ (10)')).toBeInTheDocument();
  });
});
