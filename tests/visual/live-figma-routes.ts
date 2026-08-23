export const LIVE_FIGMA_ROUTES: Readonly<Record<string, string>> = {
  '63:6': '/',
  '102:147': '/jteen/setlists/44444444-4444-4444-8444-444444444441',
  '102:503': '/jteen/setlists/44444444-4444-4444-8444-444444444442',
  '105:3808': '/sermons',
  '105:4378': '/share/gallery',
  '105:5093': '/sermons/11111111-1111-4111-8111-111111111111',
  '105:5251': '/events',
  '110:5901': '/share/gallery/33333333-3333-4333-8333-333333333361',
  '153:31': '/about',
};

export function liveFigmaRoute(frameId: string): string {
  const route = LIVE_FIGMA_ROUTES[frameId];
  if (!route) throw new Error(`No live Figma route is registered for ${frameId}`);
  return route;
}
