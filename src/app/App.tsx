import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, type BootstrapData } from "@rpa-license/domain";
import { SolutionsView, PermissionsView, SettingsView } from "../features/admin/AdminViews";
import { useAuthState } from "../features/auth/useAuthState";
import { PermissionRequestView } from "../features/access/PermissionRequestView";
import { ContactsView } from "../features/contacts/ContactsView";
import { DashboardView } from "../features/dashboard/DashboardView";
import { HistoryView } from "../features/history/HistoryView";
import { LicenseView } from "../features/licenses/LicenseView";
import { createAppApi } from "../shared/api/createAppApi";
import type { AppApi } from "../shared/api/appApi";
import { EmptyState, Notice } from "../shared/ui/Surface";
import { AppShell } from "./AppShell";

type LoadSection = "dashboard" | "licenses" | "history" | "contacts" | "solutions" | "permissions" | "settings";
type LoadedSections = Record<LoadSection, boolean>;

function emptyLoadedSections(): LoadedSections {
  return {
    dashboard: false,
    licenses: false,
    history: false,
    contacts: false,
    solutions: false,
    permissions: false,
    settings: false
  };
}

export function App() {
  const api = useMemo(() => createAppApi(), []);
  const auth = useAuthState();
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loadedSections, setLoadedSections] = useState<LoadedSections>(() => emptyLoadedSections());
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedSolution, setSelectedSolution] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await api.bootstrapApp());
      setLoadedSections(emptyLoadedSections());
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "초기 데이터를 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }, [api]);

  const loadSection = useCallback(async (section: LoadSection) => {
    setBusy(true);
    try {
      if (section === "dashboard") {
        const next = await api.loadDashboardData();
        setData((current) =>
          current
            ? {
                ...current,
                dashboardCards: next.dashboardCards,
                appData: {
                  ...current.appData,
                  referenceData: next.referenceData
                }
              }
            : current
        );
      }

      if (section === "licenses") {
        const next = await api.loadLicenseData();
        setData((current) =>
          current
            ? {
                ...current,
                appData: {
                  ...current.appData,
                  licenses: next.licenses,
                  referenceData: next.referenceData
                }
              }
            : current
        );
      }

      if (section === "history") {
        const next = await api.loadHistoryData();
        setData((current) =>
          current
            ? {
                ...current,
                appData: {
                  ...current.appData,
                  history: next.history,
                  referenceData: next.referenceData
                }
              }
            : current
        );
      }

      if (section === "contacts") {
        const next = await api.loadContactData();
        setData((current) =>
          current
            ? {
                ...current,
                appData: {
                  ...current.appData,
                  contacts: next.contacts,
                  referenceData: next.referenceData
                }
              }
            : current
        );
      }

      if (section === "solutions") {
        const next = await api.loadSolutionsAdminData();
        setData((current) =>
          current
            ? {
                ...current,
                adminData: {
                  ...current.adminData,
                  solutions: next.solutions
                }
              }
            : current
        );
      }

      if (section === "permissions") {
        const next = await api.loadPermissionsAdminData();
        setData((current) =>
          current
            ? {
                ...current,
                adminData: {
                  ...current.adminData,
                  permissions: next.permissions,
                  permissionRequests: next.permissionRequests
                }
              }
            : current
        );
      }

      if (section === "settings") {
        const next = await api.loadSettingsAdminData();
        setData((current) =>
          current
            ? {
                ...current,
                adminData: {
                  ...current.adminData,
                  settings: next.settings
                }
              }
            : current
        );
      }

      setLoadedSections((current) => ({ ...current, [section]: true }));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "화면 데이터를 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }, [api]);

  useEffect(() => {
    if (auth.loading) {
      return;
    }
    void load();
  }, [auth.loading, auth.user, load]);

  useEffect(() => {
    if (!data) {
      return;
    }
    if (!data.menu.some((item) => item.key === currentView)) {
      setCurrentView("dashboard");
    }
  }, [currentView, data]);

  useEffect(() => {
    const section = viewToSection(currentView);
    if (!data?.user.canAccessApp || !section || loadedSections[section]) {
      return;
    }

    void loadSection(section);
  }, [currentView, data?.user.canAccessApp, loadedSections, loadSection]);

  const role = data?.user.role ?? ROLES.NONE;
  const isAdmin = role === ROLES.ADMIN;
  const canEditLicense = role === ROLES.ADMIN || role === ROLES.OPERATOR;

  async function mutate(action: (apiClient: AppApi) => Promise<BootstrapData>) {
    setBusy(true);
    try {
      setData(await action(api));
      setLoadedSections(emptyLoadedSections());
      setError("");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "요청 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      data={data}
      currentView={currentView}
      firebaseUser={auth.user}
      authConfigured={auth.configured}
      authLoading={auth.loading}
      busy={busy}
      onViewChange={setCurrentView}
      onReload={load}
      onSignIn={async () => {
        try {
          await auth.signIn();
        } catch (signInError) {
          setError(signInError instanceof Error ? signInError.message : "로그인에 실패했습니다.");
        }
      }}
      onSignOut={async () => {
        await auth.signOut();
        setCurrentView("dashboard");
      }}
    >
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {!data ? <EmptyState>초기 데이터를 불러오는 중입니다.</EmptyState> : renderView()}
    </AppShell>
  );

  function renderView() {
    if (!data) {
      return null;
    }

    if (currentView === "dashboard") {
      if (!data.user.canAccessApp) {
        return data.user.email ? (
          <PermissionRequestView
            email={data.user.email}
            request={data.permissionRequest}
            onSave={(payload) => mutate((client) => client.savePermissionRequest(payload))}
          />
        ) : (
          <EmptyState>Google 로그인 후 권한을 요청할 수 있습니다.</EmptyState>
        );
      }

      return (
        <DashboardView
          cards={data.dashboardCards}
          onSelectSolution={(solutionName) => {
            setSelectedSolution(solutionName);
            setCurrentView("licenses");
          }}
        />
      );
    }

    if (currentView === "licenses") {
      return (
        <LicenseView
          key={selectedSolution || "all-licenses"}
          licenses={data.appData.licenses}
          referenceData={data.appData.referenceData}
          canEdit={canEditLicense}
          canDelete={isAdmin}
          initialSolution={selectedSolution}
          onSave={(payload) => mutate((client) => client.saveLicense(payload))}
          onIssue={(payload) => mutate((client) => client.issueLicense(payload))}
          onReturn={(payload) => mutate((client) => client.returnLicense(payload))}
          onDelete={(payload) => mutate((client) => client.deleteLicense(payload))}
        />
      );
    }

    if (currentView === "history") {
      return <HistoryView history={data.appData.history} referenceData={data.appData.referenceData} />;
    }

    if (currentView === "contacts") {
      return (
        <ContactsView
          contacts={data.appData.contacts}
          referenceData={data.appData.referenceData}
          canManage={isAdmin}
          onSave={(payload) => mutate((client) => client.saveContact(payload))}
          onDelete={(payload) => mutate((client) => client.deleteContact(payload))}
        />
      );
    }

    if (currentView === "solutions") {
      return (
        <SolutionsView
          solutions={data.adminData.solutions}
          onSave={(payload) => mutate((client) => client.saveSolution(payload))}
          onDelete={(payload) => mutate((client) => client.deleteSolution(payload))}
        />
      );
    }

    if (currentView === "permissions") {
      return (
        <PermissionsView
          permissions={data.adminData.permissions}
          permissionRequests={data.adminData.permissionRequests}
          referenceData={data.appData.referenceData}
          onSave={(payload) => mutate((client) => client.saveUserPermission(payload))}
          onResolve={(payload) => mutate((client) => client.resolvePermissionRequest(payload))}
        />
      );
    }

    if (currentView === "settings") {
      return (
        <SettingsView
          settings={data.adminData.settings}
          onSave={(payload) => mutate((client) => client.updateSystemSetting(payload))}
        />
      );
    }

    return <EmptyState>알 수 없는 화면입니다.</EmptyState>;
  }
}

function viewToSection(view: string): LoadSection | null {
  if (
    view === "dashboard" ||
    view === "licenses" ||
    view === "history" ||
    view === "contacts" ||
    view === "solutions" ||
    view === "permissions" ||
    view === "settings"
  ) {
    return view;
  }

  return null;
}
