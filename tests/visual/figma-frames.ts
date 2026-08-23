export interface FigmaFrameCase {
  readonly nodeId: string;
  readonly slug: string;
  readonly route: string;
  readonly width: number;
  readonly height: number;
}

export const FIGMA_FRAMES = [
  { nodeId: '63:6', slug: 'home', route: '/', width: 1920, height: 5885 },
  {
    nodeId: '102:147',
    slug: 'setlist-three',
    route: '/jteen/setlists/44444444-4444-4444-8444-444444444441',
    width: 1920,
    height: 1080,
  },
  { nodeId: '105:3808', slug: 'sermons', route: '/sermons', width: 1920, height: 2160 },
  { nodeId: '105:5251', slug: 'events', route: '/events', width: 1920, height: 2160 },
  {
    nodeId: '105:5093',
    slug: 'sermon-detail',
    route: '/sermons/11111111-1111-4111-8111-111111111111',
    width: 1920,
    height: 2600,
  },
  {
    nodeId: '110:5901',
    slug: 'gallery-detail',
    route: '/share/gallery/33333333-3333-4333-8333-333333333361',
    width: 1920,
    height: 2600,
  },
  { nodeId: '153:31', slug: 'about', route: '/about', width: 1920, height: 3290 },
  {
    nodeId: '105:4378',
    slug: 'gallery',
    route: '/share/gallery',
    width: 1920,
    height: 2160,
  },
  {
    nodeId: '102:503',
    slug: 'setlist-four',
    route: '/jteen/setlists/44444444-4444-4444-8444-444444444442',
    width: 1920,
    height: 1080,
  },
] as const satisfies readonly FigmaFrameCase[];
