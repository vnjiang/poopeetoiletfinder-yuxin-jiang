import { useEffect, useRef, useLayoutEffect, useCallback, useState } from 'react';

export const useGoogleMap = ({
    center,
    scriptLoaded,
    toilets,
    ratingsMap,
    renderPopup,
    makePinIcon,
    makeDotIcon,
}) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const markersRef = useRef([]);
    const infoWindowRef = useRef(null);
    const markerListenersRef = useRef([]);
    const ZOOM_HIDE = 8;
    const ZOOM_DOT = 14;
    const [markersReady, setMarkersReady] = useState(false);


    const updateMarkersByZoom = useCallback(() => {

        if (!mapRef.current) return;

        const zoom = mapRef.current.getZoom();

        markersRef.current.forEach(marker => {
            if (zoom < ZOOM_HIDE) {
                marker.setVisible(false);
            } else if (zoom < ZOOM_DOT) {
                marker.setVisible(true);
                marker.setIcon(makeDotIcon());
            } else {
                marker.setVisible(true);
                marker.setIcon(makePinIcon());
            }
        });



    }, [makeDotIcon, makePinIcon]);


    useLayoutEffect(() => {
        if (
            !scriptLoaded ||
            !center ||
            mapRef.current ||
            !containerRef.current
        ) return;

        mapRef.current = new window.google.maps.Map(containerRef.current, {
            center,
            zoom: 14.5,
        });

        infoWindowRef.current = new window.google.maps.InfoWindow();

        new window.google.maps.Marker({
            map: mapRef.current,
            position: center,
        });
    }, [scriptLoaded, center]);

    useEffect(() => {
        if (mapRef.current && center) {
            mapRef.current.setCenter(center);
        }
    }, [center]);


    useEffect(() => {
        if (!mapRef.current || !center || toilets.length === 0) return;

        markerListenersRef.current.forEach(l => l.remove());
        markerListenersRef.current = [];

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];


        toilets.forEach(toilet => {
            if (!toilet?.location?.coordinates) return;

            const lat = toilet.location.coordinates[1];
            const lng = toilet.location.coordinates[0];

            const marker = new window.google.maps.Marker({
                map: mapRef.current,
                position: { lat, lng },
                icon: makePinIcon('#7967ff', '#5445d6'),
            });

            const listener = marker.addListener('click', () => {
                const rating =
                    ratingsMap?.[toilet.place_id] || {
                        averageRating: 0,
                        reviewCount: 0,
                    };

                const content = renderPopup(toilet, center, rating);
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open(mapRef.current, marker);
            });

            markersRef.current.push(marker);
            markerListenersRef.current.push(listener);
        });


        setMarkersReady(true);
        updateMarkersByZoom();
        const zoomListener = mapRef.current.addListener('zoom_changed', () => {
            updateMarkersByZoom();
        });

        return () => {
            zoomListener?.remove?.();

            markerListenersRef.current.forEach(l => l.remove());
            markersRef.current.forEach(m => m.setMap(null));

            markerListenersRef.current = [];
            markersRef.current = [];
        };



    }, [toilets, center, ratingsMap, renderPopup, makePinIcon, updateMarkersByZoom]);


    return { containerRef, markersReady };
};
