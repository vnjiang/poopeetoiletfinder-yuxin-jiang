import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./services/firebase", () => ({
    auth: {},
  }));

const mockUseAuth = jest.fn();
jest.mock("./context/authContext", () => ({
  useAuth: () => mockUseAuth(),
}));


const mockGetUserLocation = jest.fn();
jest.mock("./utils/utils", () => ({
  getUserLocation: (...args) => mockGetUserLocation(...args),
}));


jest.mock("./components/Header/Header", () => () => <div>Header</div>);

jest.mock("./components/Map/Map", () => (props) => (
  <div data-testid="map">Map center: {props.center ? "yes" : "no"}</div>
));

jest.mock("./components/AllToilet/AllToilet", () => (props) => (
  <div data-testid="alltoilet">
    AllToilet center: {props.userLocation ? "yes" : "no"}
  </div>
));


jest.mock("./components/ButtonGroup/ButtonGroup", () => (props) => (
  <div>
    <div data-testid="canShare">{String(props.canShare)}</div>
    <button onClick={props.onShareClick}>share</button>
    <button onClick={props.onLocateClick}>locate</button>
  </div>
));

jest.mock("./pages/Login/Login", () => () => <div>LoginPage</div>);
jest.mock("./pages/User/User", () => () => <div>UserPage</div>);
jest.mock("./pages/SharedToiletPage/SharedToiletPage", () => () => <div>SharedToiletPage</div>);
jest.mock("./pages/Register/Register", () => () => <div>RegisterPage</div>);
jest.mock("./pages/RateAndReview/RateAndReview", () => () => <div>RateAndReviewPage</div>);
jest.mock("./pages/WriteReview/WriteReview", () => () => <div>WriteReviewPage</div>);
jest.mock("./pages/Admin/Admin", () => () => <div>AdminPage</div>);


function renderWithRoute(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("when loading=true: returns null (does not render the page)", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: true });

    const { container } = renderWithRoute("/");
    expect(container.firstChild).toBeNull();
  });

test("on mount: calls getUserLocation and passes center to Map/AllToilet", async () => {

    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    mockGetUserLocation.mockImplementation((setCenter) => {
      setCenter({ lat: 1, lng: 2 });
    });

    renderWithRoute("/");

    expect(mockGetUserLocation).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("map")).toHaveTextContent("Map center: yes");
    expect(screen.getByTestId("alltoilet")).toHaveTextContent("AllToilet center: yes");
  });

  test('Share button: not logged in -> navigates to /login (renders LoginPage)', async () => {

    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/");

    await user.click(screen.getByRole("button", { name: "share" }));

    expect(await screen.findByText("LoginPage")).toBeInTheDocument();
  });

  test("Share button: logged in but not commercial_owner -> navigates to /user", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { uid: "1" },
      role: "normal_user",
      loading: false,
    });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/");

    await user.click(screen.getByRole("button", { name: "share" }));
    expect(await screen.findByText("UserPage")).toBeInTheDocument();
  });

  test("Share button: commercial_owner -> navigates to /shared-your-toilet", async () => {

    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { uid: "1" },
      role: "commercial_owner",
      loading: false,
    });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/");

    expect(screen.getByTestId("canShare")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "share" }));
    expect(await screen.findByText("SharedToiletPage")).toBeInTheDocument();
  });

  test("/shared-your-toilet: not logged in -> navigates to /login", async () => {

    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/shared-your-toilet");
    expect(await screen.findByText("LoginPage")).toBeInTheDocument();
  });

  test("/shared-your-toilet: logged in but not commercial_owner -> navigates to /user", async () => {

    mockUseAuth.mockReturnValue({ user: { uid: "1" }, role: "normal_user", loading: false });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/shared-your-toilet");
    expect(await screen.findByText("UserPage")).toBeInTheDocument();
  });

  test("/shared-your-toilet: commercial_owner -> renders SharedToiletPage", async () => {

    mockUseAuth.mockReturnValue({
      user: { uid: "1" },
      role: "commercial_owner",
      loading: false,
    });
    mockGetUserLocation.mockImplementation(() => {});

    renderWithRoute("/shared-your-toilet");
    expect(await screen.findByText("SharedToiletPage")).toBeInTheDocument();
  });

});
