export function getFirestoreUsageConsoleUrl(projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "rpa-licence-manager"): string {
  return `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/usage`;
}
