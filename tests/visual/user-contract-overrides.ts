export type ContractBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

const boxOverrides: Readonly<Record<string, ContractBox>> = {
  '105:5409': { x: 248.5, y: 549.5, width: 109, height: 143 },
  '105:5407': { x: 279.5, y: 549.5, width: 47, height: 26 },
  '105:5406': { x: 248.5, y: 585.5, width: 109, height: 71 },
  '110:5474': { x: 278, y: 666.5, width: 50, height: 26 },
  '110:5933': { x: 100, y: 1544, width: 1720, height: 158.1 },
  '110:6005': { x: 100, y: 1583.05, width: 80, height: 80 },
  '110:6006': { x: 1740, y: 1583.05, width: 80, height: 80 },
  '110:5935': { x: 204, y: 1544, width: 283.2, height: 158.1 },
  '111:1788': { x: 511.2, y: 1544, width: 283.2, height: 158.1 },
  '111:1790': { x: 818.4, y: 1544, width: 283.2, height: 158.1 },
  '111:1792': { x: 1125.6, y: 1544, width: 283.2, height: 158.1 },
};

export function userContractBox(nodeId: string, fallback: ContractBox): ContractBox {
  return boxOverrides[nodeId] ?? fallback;
}
