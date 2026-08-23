'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  KeyboardEvent,
  PointerEvent,
  WheelEvent,
} from 'react';
import { CHURCH_LOCATION } from '@/lib/site';
import {
  Attribution,
  MapCanvas,
  MapControlButton,
  MapControls,
  MapTile,
  MarkerAnchor,
  MarkerPin,
  TileLayer,
} from './InteractiveChurchMap.styled';

const TILE_SIZE = 256;
const MIN_ZOOM = 14;
const MAX_ZOOM = 18;
const INITIAL_ZOOM = 16;

type Point = {
  x: number;
  y: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function project(
  coordinates: Coordinates,
  zoom: number,
): Point {
  const scale = TILE_SIZE * 2 ** zoom;
  const sine = Math.sin((coordinates.latitude * Math.PI) / 180);
  return {
    x: ((coordinates.longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) *
      scale,
  };
}

function unproject(point: Point, zoom: number): Coordinates {
  const scale = TILE_SIZE * 2 ** zoom;
  const mercator = Math.PI - (2 * Math.PI * point.y) / scale;
  return {
    latitude: (Math.atan(Math.sinh(mercator)) * 180) / Math.PI,
    longitude: (point.x / scale) * 360 - 180,
  };
}

export function InteractiveChurchMap() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointerOrigin = useRef<Point | null>(null);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const [size, setSize] = useState<Point>({ x: 0, y: 0 });
  const [center, setCenter] = useState<Coordinates>(CHURCH_LOCATION);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const updateOffset = useCallback((next: Point) => {
    offsetRef.current = next;
    setOffset(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = {
        x: Math.round(entry.contentRect.width),
        y: Math.round(entry.contentRect.height),
      };
      setSize((current) =>
        current.x === next.x && current.y === next.y ? current : next,
      );
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const centerPoint = useMemo(() => project(center, zoom), [center, zoom]);

  const tiles = useMemo(() => {
    if (size.x === 0 || size.y === 0) return [];
    const left = centerPoint.x - size.x / 2 - offset.x;
    const top = centerPoint.y - size.y / 2 - offset.y;
    const firstX = Math.floor(left / TILE_SIZE);
    const lastX = Math.floor((left + size.x) / TILE_SIZE);
    const firstY = Math.max(0, Math.floor(top / TILE_SIZE));
    const lastY = Math.min(
      2 ** zoom - 1,
      Math.floor((top + size.y) / TILE_SIZE),
    );
    const worldTiles = 2 ** zoom;
    const next = [];

    for (let y = firstY; y <= lastY; y += 1) {
      for (let x = firstX; x <= lastX; x += 1) {
        const tileX = ((x % worldTiles) + worldTiles) % worldTiles;
        next.push({
          key: `${zoom}-${x}-${y}`,
          src: `/api/map-tiles/${zoom}/${tileX}/${y}`,
          x: x * TILE_SIZE - centerPoint.x + size.x / 2 + offset.x,
          y: y * TILE_SIZE - centerPoint.y + size.y / 2 + offset.y,
        });
      }
    }
    return next;
  }, [centerPoint, offset, size, zoom]);

  const markerPoint = useMemo(() => {
    const church = project(CHURCH_LOCATION, zoom);
    return {
      x: church.x - centerPoint.x + size.x / 2 + offset.x,
      y: church.y - centerPoint.y + size.y / 2 + offset.y,
    };
  }, [centerPoint, offset, size, zoom]);

  const commitPan = useCallback(() => {
    const current = offsetRef.current;
    if (current.x !== 0 || current.y !== 0) {
      setCenter(
        unproject(
          {
            x: centerPoint.x - current.x,
            y: centerPoint.y - current.y,
          },
          zoom,
        ),
      );
    }
    updateOffset({ x: 0, y: 0 });
  }, [centerPoint, updateOffset, zoom]);

  const changeZoom = useCallback(
    (delta: number) => {
      commitPan();
      setZoom((current) => clamp(current + delta, MIN_ZOOM, MAX_ZOOM));
    },
    [commitPan],
  );

  const panBy = useCallback(
    (x: number, y: number) => {
      commitPan();
      setCenter(unproject({ x: centerPoint.x + x, y: centerPoint.y + y }, zoom));
    },
    [centerPoint, commitPan, zoom],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const origin = pointerOrigin.current;
    if (!origin) return;
    updateOffset({
      x: event.clientX - origin.x,
      y: event.clientY - origin.y,
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerOrigin.current) return;
    pointerOrigin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    commitPan();
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 1 : -1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Partial<Record<string, () => void>> = {
      ArrowDown: () => panBy(0, 80),
      ArrowLeft: () => panBy(-80, 0),
      ArrowRight: () => panBy(80, 0),
      ArrowUp: () => panBy(0, -80),
      '+': () => changeZoom(1),
      '-': () => changeZoom(-1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <MapCanvas
      ref={canvasRef}
      data-map-canvas
      data-zoom={zoom}
      role="application"
      aria-label="수도교회 위치 지도"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onWheel={handleWheel}
    >
      <TileLayer aria-hidden="true">
        {tiles.map((tile) => (
          <MapTile
            key={tile.key}
            src={tile.src}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            draggable={false}
            unoptimized
            style={{ left: tile.x, top: tile.y }}
          />
        ))}
      </TileLayer>
      <MarkerAnchor
        data-map-marker="church"
        data-latitude={CHURCH_LOCATION.latitude}
        data-longitude={CHURCH_LOCATION.longitude}
        style={{
          transform: `translate3d(${markerPoint.x}px, ${markerPoint.y}px, 0)`,
        }}
      >
        <MarkerPin data-map-marker-pin />
      </MarkerAnchor>
      <MapControls aria-label="지도 확대 및 축소">
        <MapControlButton
          type="button"
          aria-label="지도 확대"
          disabled={zoom === MAX_ZOOM}
          onClick={() => changeZoom(1)}
        >
          +
        </MapControlButton>
        <MapControlButton
          type="button"
          aria-label="지도 축소"
          disabled={zoom === MIN_ZOOM}
          onClick={() => changeZoom(-1)}
        >
          −
        </MapControlButton>
      </MapControls>
      <Attribution
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer noopener"
      >
        © OpenStreetMap contributors
      </Attribution>
    </MapCanvas>
  );
}
