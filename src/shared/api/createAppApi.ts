import { hasFirebaseConfig, useContractMock } from "../firebase/client";
import { contractMockApi } from "./contractMockApi";
import { firestoreAppApi } from "./firestoreAppApi";
import type { AppApi } from "./appApi";

export function createAppApi(): AppApi {
  if (useContractMock || !hasFirebaseConfig()) {
    return contractMockApi;
  }
  return firestoreAppApi;
}
