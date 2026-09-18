import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import LogisticsBoard from "./pages/logistics/LogisticsBoard";
import PermitsView from "./pages/permits/PermitsView";
import FinanceView from "./pages/financials/FinanceView";
import DocumentVault from "./pages/documents/DocumentVault";
import StaffDirectory from "./pages/members/StaffDirectory";
import DepartureCalendar from "./pages/calendar/DepartureCalendar";
import TripsManager from "./pages/dashboard/TripsManager";
import PackagesManager from "./pages/packages/PackagesManager";
import BookingRegistry from "./pages/bookings/BookingRegistry";
import TransportView from "./pages/transport/TransportView";
import HotelsView from "./pages/hotels/HotelsView";
import ReportsView from "./pages/reports/ReportsView";
import SettingsView from "./pages/settings/SettingsView";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="trips" element={<TripsManager />} />
                <Route path="logistics" element={<LogisticsBoard />} />
                <Route path="permits" element={<PermitsView />} />
                <Route path="financials" element={<FinanceView />} />
                <Route path="activities" element={<PackagesManager />} />
                <Route path="documents" element={<DocumentVault />} />
                <Route path="members" element={<StaffDirectory />} />
                <Route path="calendar" element={<DepartureCalendar />} />
                <Route path="bookings" element={<BookingRegistry />} />
                <Route path="transport" element={<TransportView />} />
                <Route path="hotels" element={<HotelsView />} />
                <Route path="reports" element={<ReportsView />} />
                <Route path="settings" element={<SettingsView />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}
