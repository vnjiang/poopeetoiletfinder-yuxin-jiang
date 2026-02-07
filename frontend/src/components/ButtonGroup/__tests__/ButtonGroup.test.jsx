import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonGroup from '../ButtonGroup';

describe('ButtonGroup', () => {
  test("Default: renders Locate button only, does not render Share button", () => {
    const onShareClick = jest.fn();
    const onLocateClick = jest.fn();

    render(
      <ButtonGroup
        onShareClick={onShareClick}
        onLocateClick={onLocateClick}
      />
    );

    expect(screen.getByTitle('Go to my location')).toBeInTheDocument();

    expect(screen.queryByTitle('Share a toilet')).not.toBeInTheDocument();
  });

  test("When canShare=true: renders Share button", () => {
    render(
      <ButtonGroup
        onShareClick={jest.fn()}
        onLocateClick={jest.fn()}
        canShare={true}
      />
    );

    expect(screen.getByTitle('Share a toilet')).toBeInTheDocument();
    expect(screen.getByTitle('Go to my location')).toBeInTheDocument();
  });

  test("Click Locate: calls onLocateClick", async () => {
    const user = userEvent.setup();
    const onLocateClick = jest.fn();

    render(
      <ButtonGroup
        onShareClick={jest.fn()}
        onLocateClick={onLocateClick}
      />
    );

    await user.click(screen.getByTitle('Go to my location'));
    expect(onLocateClick).toHaveBeenCalledTimes(1);
  });

  test("Click Share: calls onShareClick (when canShare=true)", async () => {
    const user = userEvent.setup();
    const onShareClick = jest.fn();

    render(
      <ButtonGroup
        onShareClick={onShareClick}
        onLocateClick={jest.fn()}
        canShare={true}
      />
    );

    await user.click(screen.getByTitle('Share a toilet'));
    expect(onShareClick).toHaveBeenCalledTimes(1);
  });
});
