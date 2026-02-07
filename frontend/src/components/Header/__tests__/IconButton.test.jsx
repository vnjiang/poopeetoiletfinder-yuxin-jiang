import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from '../IconButton';

describe('IconButton', () => {
  test('renders button with title and children', () => {
    render(
      <IconButton title="Home" onClick={() => {}}>
        <span>ICON</span>
      </IconButton>
    );

    expect(screen.getByTitle('Home')).toBeInTheDocument();
    expect(screen.getByText('ICON')).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <IconButton title="Login" onClick={onClick}>
        <span>ICON</span>
      </IconButton>
    );

    await user.click(screen.getByTitle('Login'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
