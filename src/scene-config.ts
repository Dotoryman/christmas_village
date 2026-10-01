import { outside } from './scenes/outside';
import { inside } from './scenes/inside';
import { party } from './scenes/party';
export type { Target } from './scenes/types';
// One registry is shared by navigation, input and artwork loading.
export const scenes = { outside, inside, party };
export const images = { outside: outside.image, inside: inside.image, party: party.image };
export const offImages = {
  outside: outside.offImage,
  inside: inside.offImage,
  party: party.offImage,
};
export const targets = { outside: outside.targets, inside: inside.targets, party: party.targets };
