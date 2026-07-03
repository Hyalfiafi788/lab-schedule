import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MonthlySchedulePage = lazy(() => import('./pages/Schedule/MonthlySchedulePage').then(m => ({ default: m.MonthlySchedulePage })));
const WeeklySchedulePage = lazy(() => import('./pages/Schedule/WeeklySchedulePage').then(m => ({ default: m.WeeklySchedulePage })));
const StaffPage = lazy(() => import('./pages/Staff/StaffPage').then(m => ({ default: m.StaffPage })));
const StatisticsPage = lazy(() => import('./pages/Statistics/StatisticsPage').then(m => ({ default: m.StatisticsPage })));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const HandoverPage = lazy(() => import('./pages/Handover/HandoverPage').then(m => ({ default: m.HandoverPage })));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="department/:departmentId">
              <Route
                path="monthly"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MonthlySchedulePage />
                  </Suspense>
                }
              />
              <Route
                path="weekly"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <WeeklySchedulePage />
                  </Suspense>
                }
              />
              <Route
                path="staff"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StaffPage />
                  </Suspense>
                }
              />
              <Route
                path="statistics"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <StatisticsPage />
                  </Suspense>
                }
              />
              <Route
                path="reports"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ReportsPage />
                  </Suspense>
                }
              />
              <Route
                path="handover"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HandoverPage />
                  </Suspense>
                }
              />
              <Route index element={<Navigate to="monthly" replace />} />
            </Route>
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  );
}
