import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, type BootstrapData } from "@rpa-license/domain";
import { SolutionsView, PermissionsView, SettingsView } from "../features/admin/AdminViews";
import { useAuthState } from "../features/auth/useAuthState";
import { ContactsView } from "../features/contacts/ContactsView";
import { DashboardView } from "../features/dashboard/DashboardView";
import { HistoryView } from "../features/history/HistoryView";
import { LicenseView } from "../features/licenses/LicenseView";
import { createAppApi } from "../shared/api/createAppApi";
import type { AppApi } from "../shared/api/appApi";
import { AppShell } from "./AppShell";

export function App() {
  const api = useMemo(() => createAppApi(), []);
  const auth = useAuthState();
  const [data, setData] = useState<BootstrapData | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedSolution, setSelectedSolution] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await api.bootstrapApp());
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "초기 데이터를 불러오지 못했습니다.");
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

  const role = data?.user.role ?? ROLES.NONE;
  const isAdmin = role === ROLES.ADMIN;
  const canEditLicense = role === ROLES.ADMIN || role === ROLES.OPERATOR;

  async function mutate(action: (apiClient: AppApi) => Promise<BootstrapData>) {
    setBusy(true);
    try {
      setData(await action(api));
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
      {error ? <section className="notice notice-danger">{error}</section> : null}
      {!data ? <section className="empty-state">초기 데이터를 불러오는 중입니다.</section> : renderView()}
    </AppShell>
  );

  function renderView() {
    if (!data) {
      return null;
    }

    if (currentView === "dashboard") {
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
          referenceData={data.appData.referenceData}
          onSave={(payload) => mutate((client) => client.saveUserPermission(payload))}
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

    return <section className="empty-state">알 수 없는 화면입니다.</section>;
  }
}

