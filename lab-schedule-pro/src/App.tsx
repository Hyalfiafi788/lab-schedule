import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { MonthlySchedulePage } from './pages/Schedule/MonthlySchedulePage';
import { WeeklySchedulePage } from './pages/Schedule/WeeklySchedulePage';
import { StaffPage } from './pages/Staff/StaffPage';
import { StatisticsPage } from './pages/Statistics/StatisticsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ToastProvider } from './components/ui/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="department/:departmentId">
              <Route path="monthly" element={<MonthlySchedulePage />} />
              <Route path="weekly" element={<WeeklySchedulePage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route index element={<Navigate to="monthly" replace />} />
            </Route>
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
