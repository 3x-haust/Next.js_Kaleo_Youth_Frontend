import { NextResponse } from 'next/server';

const MIN_ZOOM = 14;
const MAX_ZOOM = 18;
const CACHE_SECONDS = 604_800;

type RouteContext = {
  params: Promise<{
    zoom: string;
    x: string;
    y: string;
  }>;
};

function parseTileCoordinate(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const coordinate = Number(value);
  return Number.isSafeInteger(coordinate) ? coordinate : null;
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const params = await context.params;
  const zoom = parseTileCoordinate(params.zoom);
  const x = parseTileCoordinate(params.x);
  const y = parseTileCoordinate(params.y);

  if (
    zoom === null ||
    x === null ||
    y === null ||
    zoom < MIN_ZOOM ||
    zoom > MAX_ZOOM ||
    x >= 2 ** zoom ||
    y >= 2 ** zoom
  ) {
    return NextResponse.json({ error: 'Invalid map tile.' }, { status: 400 });
  }

  const tile = await fetch(
    `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
    {
      headers: {
        'User-Agent': 'KALEO-YOUTH/1.0 (https://kaleoyouth.kr)',
      },
      next: {
        revalidate: CACHE_SECONDS,
      },
    },
  );

  if (!tile.ok || !tile.body) {
    return NextResponse.json(
      { error: 'Map tile is unavailable.' },
      { status: 502 },
    );
  }

  return new Response(tile.body, {
    headers: {
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      'Content-Type': 'image/png',
    },
  });
}
