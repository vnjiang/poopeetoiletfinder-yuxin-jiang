import React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { useGoogleMap } from "../useGoogleMap";



describe("useGoogleMap", () => {
  let createdMarkers = [];
  let zoomChangedCb;
  let triggerMock;
  let mapInstance;
  let infoWindowInstance;

  const makePinIconMock = jest.fn(() => ({ url: "pin" }));
const makeDotIconMock = jest.fn(() => ({ url: "dot" }));

  beforeEach(() => {
    createdMarkers = [];
    zoomChangedCb = undefined;

    triggerMock = jest.fn();

    class InfoWindowMock {
        constructor() {
          infoWindowInstance = this;
          this.setContent = jest.fn();
          this.open = jest.fn();
          this.close = jest.fn();
        }
      }

    class MarkerMock {
      constructor(opts) {
        this.opts = opts;
        this.setMap = jest.fn();
        this.setIcon = jest.fn();
        this.setVisible = jest.fn();
        this.addListener = jest.fn((event, cb) => {
          if (event === "click") this._clickCb = cb;
          const remove = jest.fn();
          return { remove };
        });
        createdMarkers.push(this);
      }
    }

    class MapMock {
      constructor(el, opts) {
        this.el = el;
        this.opts = opts;
        this._zoom = opts.zoom ?? 14.5;

        this.getZoom = jest.fn(() => this._zoom);
        this.setZoom = jest.fn((z) => (this._zoom = z));
        this.setCenter = jest.fn();

        this.addListener = jest.fn((event, cb) => {
          if (event === "zoom_changed") zoomChangedCb = cb;
          return { remove: jest.fn() };
        });

        mapInstance = this;
      }
    }

    // mock window.google maps
    window.google = {
      maps: {
        Map: jest.fn((el, opts) => new MapMock(el, opts)),
        Marker: jest.fn((opts) => new MarkerMock(opts)),
        InfoWindow: jest.fn(() => new InfoWindowMock()), 
        Size: function Size(w, h) {
          this.width = w;
          this.height = h;
        },
        Point: function Point(x, y) {
          this.x = x;
          this.y = y;
        },
        event: {
          trigger: triggerMock,
        },
      },
    };
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    delete window.google;
  });

  function Harness(props) {
    const { containerRef } = useGoogleMap(props);
    return <div data-testid="map" ref={containerRef} />;
  }

  test("initializes the map and creates markers for toilets; cleans up toilet markers on unmount", () => {
    const toilets = [
      { place_id: "p1", location: { coordinates: [-8.1, 51.1] } },
      { place_id: "p2", location: { coordinates: [-8.2, 51.2] } },
    ];

    const { unmount } = render(
      <Harness
        center={{ lat: 51.0, lng: -8.0 }}
        toilets={toilets}
        ratingsMap={{}}
        renderPopup={() => "<div>popup</div>"}
        scriptLoaded={true}
        onMarkerClick={jest.fn()}
        makePinIcon={makePinIconMock}  
        makeDotIcon={makeDotIconMock}  
      />
    );


    expect(window.google.maps.Map).toHaveBeenCalledTimes(1);

    expect(createdMarkers.length).toBe(3);

    const userMarker = createdMarkers[0]; 
    const toiletMarker1 = createdMarkers[1];
    const toiletMarker2 = createdMarkers[2];

    unmount();

    expect(toiletMarker1.setMap).toHaveBeenCalledWith(null);
    expect(toiletMarker2.setMap).toHaveBeenCalledWith(null);

    expect(userMarker.setMap).not.toHaveBeenCalledWith(null);
  });

  test("zoom_changed: refreshes marker icon/visibility based on zoom level", () => {
    const toilets = [{ place_id: "p1", location: { coordinates: [-8.1, 51.1] } }];

    render(
      <Harness
        center={{ lat: 51.0, lng: -8.0 }}
        toilets={toilets}
        ratingsMap={{}}
        renderPopup={() => "<div>popup</div>"}
        scriptLoaded={true}
        onMarkerClick={jest.fn()}
        makePinIcon={makePinIconMock}  
        makeDotIcon={makeDotIconMock}   
      />
    );

    expect(typeof zoomChangedCb).toBe("function");
    
    mapInstance.getZoom.mockReturnValue(7);

    act(() => {
      zoomChangedCb();
    });


    const toiletMarker = createdMarkers[1];
    expect(toiletMarker.setVisible).toHaveBeenCalledWith(false);
    expect(toiletMarker.setIcon).toHaveBeenCalled(); 
  });

  test("marker click: calls onMarkerClick(toilet, marker)", () => {
    const onMarkerClick = jest.fn();
    const toilets = [{ place_id: "p1", location: { coordinates: [-8.1, 51.1] } }];

    const renderPopup = jest.fn(() => "<div>popup</div>");

    render(
      <Harness
        center={{ lat: 51.0, lng: -8.0 }}
        toilets={toilets}
        ratingsMap={{}}
        renderPopup={renderPopup}
        scriptLoaded={true}
        onMarkerClick={onMarkerClick}
        makePinIcon={makePinIconMock}  
        makeDotIcon={makeDotIconMock}  
      />
    );

    const toiletMarker = createdMarkers[1];
    expect(typeof toiletMarker._clickCb).toBe("function");


    act(() => {
      toiletMarker._clickCb();
    });


  expect(renderPopup).toHaveBeenCalledTimes(1);
  expect(infoWindowInstance.setContent).toHaveBeenCalledWith("<div>popup</div>");
  expect(infoWindowInstance.open).toHaveBeenCalledWith(mapInstance, toiletMarker);
  });
});
