import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminList from '../AdminList';

jest.mock('../AdminItem', () => {
  return function MockAdminItem(props) {
    return (
      <div data-testid="admin-item">
        <div>id:{props.toilet?._id}</div>
        <button onClick={() => props.onApprove(props.toilet)}>mock-approve</button>
        <button onClick={() => props.onReject(props.toilet?._id)}>mock-reject</button>
      </div>
    );
  };
});

describe('AdminList', () => {
  test('shows empty state when items is empty', () => {
    render(<AdminList items={[]} onApprove={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText(/Nothing to review right now/i)).toBeInTheDocument();
  });

  test('renders a list of AdminItem when items has data', () => {
    const items = [{ _id: 'a1' }, { _id: 'a2' }];

    render(<AdminList items={items} onApprove={jest.fn()} onReject={jest.fn()} />);

    const nodes = screen.getAllByTestId('admin-item');
    expect(nodes).toHaveLength(2);

    expect(screen.getByText('id:a1')).toBeInTheDocument();
    expect(screen.getByText('id:a2')).toBeInTheDocument();
  });

  test('passes onApprove/onReject handlers down to AdminItem', () => {
    const items = [{ _id: 'a1' }];
    const onApprove = jest.fn();
    const onReject = jest.fn();

    render(<AdminList items={items} onApprove={onApprove} onReject={onReject} />);

    screen.getByText('mock-approve').click();
    expect(onApprove).toHaveBeenCalledWith({ _id: 'a1' });

    screen.getByText('mock-reject').click();
    expect(onReject).toHaveBeenCalledWith('a1');
  });
});
