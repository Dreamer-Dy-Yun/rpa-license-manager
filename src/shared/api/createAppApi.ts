import { hasFirebaseConfig, useContractMock } from "../firebase/client";
import { contractMockApi } from "./contractMockApi";
import { firebaseFunctionsApi } from "./firebaseFunctionsApi";
import type { AppApi } from "./appApi";

export function createAppApi(): AppApi {
  if (useContractMock || !hasFirebaseConfig()) {
    return contractMockApi;
  }
  return firebaseFunctionsApi;
}

