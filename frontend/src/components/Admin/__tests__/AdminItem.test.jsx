import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminItem from '../AdminItem';

describe('AdminItem', () => {
  const baseToilet = {
    _id: 't1',
    toilet_name: 'Test Toilet',
    toilet_description: 'Nice and clean',
    type: 'public',
    price: 0,
    created: '2026-01-01',
  };

  test('renders fallback text when some fields missing', () => {
    const toilet = { _id: 'x1' }; 
    render(<AdminItem toilet={toilet} onApprove={jest.fn()} onReject={jest.fn()} />);

    expect(screen.getByText('(Unnamed)')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();
    expect(screen.getByText('No price')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
    expect(screen.getByText('x1')).toBeInTheDocument();
  });

  test('Approve: calls onApprove(toilet) and toggles busy UI', async () => {
    const user = userEvent.setup();
    let resolveApprove;
    const onApprove = jest.fn(
      () =>
        new Promise((res) => {
          resolveApprove = res;
        })
    );

    render(<AdminItem toilet={baseToilet} onApprove={onApprove} onReject={jest.fn()} />);

    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    expect(approveBtn).toBeEnabled();

    await user.click(approveBtn);

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(baseToilet);

    expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled();
    resolveApprove();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
    });
  });

  test('Reject: when confirm=false, does NOT call onReject', async () => {
    const user = userEvent.setup();
    const onReject = jest.fn();

    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<AdminItem toilet={baseToilet} onApprove={jest.fn()} onReject={onReject} />);

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  test('Reject: when confirm=true, calls onReject(toilet._id) and toggles busy', async () => {
    const user = userEvent.setup();

    let resolveReject;
    const onReject = jest.fn(
      () =>
        new Promise((res) => {
          resolveReject = res;
        })
    );

    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AdminItem toilet={baseToilet} onApprove={jest.fn()} onReject={onReject} />);

    const rejectBtn = screen.getByRole('button', { name: 'Reject' });
    await user.click(rejectBtn);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledWith('t1');
    expect(rejectBtn).toBeDisabled();

    resolveReject();

    await waitFor(() => {
      expect(rejectBtn).toBeEnabled();
    });

    confirmSpy.mockRestore();
  });
});
