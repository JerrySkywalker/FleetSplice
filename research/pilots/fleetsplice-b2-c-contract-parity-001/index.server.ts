// SPDX-License-Identifier: MIT
// Only the official isolated loader uses this entry. It always constructs an in-memory mock.
import {contribution} from './src/provider';
import {MockNative} from './src/native';
export default function setup(server: Parameters<ReturnType<typeof contribution>>[0]) {
  return contribution(new MockNative())(server);
}
