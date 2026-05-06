import { LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import type { BootstrapData, MenuItem } from "@rpa-license/domain";
import type { User } from "firebase/auth";
import type { ReactNode } from "react";

interface AppShellProps {
  data: BootstrapData | null;
  currentView: string;
  firebaseUser: User | null;
  authConfigured: boolean;
  authLoading: boolean;
  busy: boolean;
  onViewChange: (view: string) => void;
  onReload: () => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export function AppShell({
  data,
  currentView,
  firebaseUser,
  authConfigured,
  authLoading,
  busy,
  onViewChange,
  onReload,
  onSignIn,
  onSignOut,
  children
}: AppShellProps) {
  const menu = data?.menu ?? [{ key: "dashboard", label: "대시보드" }];
  const user = data?.user;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={22} aria-hidden="true" />
          <div>
            <strong>{data?.appName ?? "RPA 라이선스 관리"}</strong>
            <span>Firebase edition</span>
          </div>
        </div>

        <div className="user-box">
          <span>{firebaseUser?.email ?? user?.email ?? "로그인 필요"}</span>
          <strong>{user?.role ?? "권한없음"}</strong>
        </div>

        <nav className="menu" aria-label="주 메뉴">
          {menu.map((item: MenuItem) => (
            <button
              className={item.key === currentView ? "menu-item is-active" : "menu-item"}
              key={item.key}
              type="button"
              onClick={() => onViewChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">RPA License Operations</p>
            <h1>{getTitle(menu, currentView)}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" onClick={onReload} disabled={busy} title="새로고침">
              <RefreshCw size={18} aria-hidden="true" />
              <span>새로고침</span>
            </button>
            {authConfigured ? (
              firebaseUser ? (
                <button className="icon-button" type="button" onClick={onSignOut} disabled={busy || authLoading} title="로그아웃">
                  <LogOut size={18} aria-hidden="true" />
                  <span>로그아웃</span>
                </button>
              ) : (
                <button className="primary-button" type="button" onClick={onSignIn} disabled={busy || authLoading} title="Google 로그인">
                  <LogIn size={18} aria-hidden="true" />
                  <span>Google 로그인</span>
                </button>
              )
            ) : null}
          </div>
        </header>

        {data?.systemMessage ? <section className="notice notice-info">{data.systemMessage}</section> : null}
        {data?.user.message ? <section className="notice">{data.user.message}</section> : null}
        {busy ? <section className="loading">요청 처리 중...</section> : null}

        {children}
      </main>
    </div>
  );
}

function getTitle(menu: MenuItem[], currentView: string): string {
  return menu.find((item) => item.key === currentView)?.label ?? "대시보드";
}
