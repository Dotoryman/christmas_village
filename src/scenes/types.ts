export type Scene = 'outside' | 'inside' | 'party';
export type Target = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  light?: boolean;
  mask?: string;
};

export interface SceneDefinition {
  image: string;
  offImage: string;
  label: string;
  focus: string;
  escape?: Scene;
  treeBounds?: [number, number];
  origin: [number, number];
  destinationOrigins?: Partial<Record<Scene, [number, number]>>;
  plates?: { id: string; mask: string; off: boolean }[];
  decorations?: string[];
  targets: Target[];
}
