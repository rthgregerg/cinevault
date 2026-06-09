import type { GlobeCameraState } from "@/lib/types";

let snapshot: GlobeCameraState | null = null;

export const globeCamera = {
  save(state: GlobeCameraState) {
    snapshot = state;
  },
  restore(): GlobeCameraState | null {
    return snapshot;
  },
  clear() {
    snapshot = null;
  },
};
