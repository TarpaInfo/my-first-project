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
import ModulePlaceholder from "./pages/common/ModulePlaceholder";
import TripsManager from "./pages/dashboard/TripsManager";
import PackagesManager from "./pages/packages/PackagesManager";
import BookingRegistry from "./pages/bookings/BookingRegistry";

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
                {/* Core Connected Hub */}
                <Route index element={<DashboardHome />} />
                <Route path="trips" element={<TripsManager />} />
                <Route path="logistics" element={<LogisticsBoard />} />
                <Route path="permits" element={<PermitsView />} />
                <Route path="financials" element={<FinanceView />} />
                <Route path="activities" element={<PackagesManager />} />

                {/* Newly Connected Operational Modules */}
                <Route path="documents" element={<DocumentVault />} />
                <Route path="members" element={<StaffDirectory />} />
                <Route path="calendar" element={<DepartureCalendar />} />

                {/* Remaining Subsystems */}
                <Route
                  path="activities"
                  element={
                    <ModulePlaceholder
                      title="Peak Activities"
                      description="Catalog of technical peak climbing and high-altitude circuits."
                    />
                  }
                />
                <Route
                  path="transport"
                  element={
                    <ModulePlaceholder
                      title="Aviation & Fleet"
                      description="Helicopter charters, baggage limits, and Lukla flight bookings."
                    />
                  }
                />
                <Route
                  path="hotels"
                  element={
                    <ModulePlaceholder
                      title="Lodges & Teahouses"
                      description="Tea-house allotments and lodge vouchers."
                    />
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ModulePlaceholder
                      title="Yield Analytics"
                      description="Operations financial reporting and expedition margins."
                    />
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ModulePlaceholder
                      title="Settings"
                      description="System configurations and SMTP mail setup."
                    />
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                {/* Your existing original dashboard index */}
                <Route index element={<DashboardHome />} />

                {/* Dedicated Trip Bookings Page */}
                <Route path="bookings" element={<BookingRegistry />} />

                {/* Other existing routes */}
                <Route path="logistics" element={<LogisticsBoard />} />
                {/* ... */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}
