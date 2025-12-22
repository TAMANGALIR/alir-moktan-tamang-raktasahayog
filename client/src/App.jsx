import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";
import UserLayout from "./components/layout/UserLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import InventoryManagement from './pages/InventoryManagement';
import AdminCampaigns from './pages/AdminCampaigns';
import Profile from "./pages/Profile";
import RequestDonation from "./pages/RequestDonation";
import MyDonations from "./pages/MyDonations";
import Appointments from "./pages/Appointments";
import UserCampaigns from "./pages/UserCampaigns";

import OrgRegistration from "./pages/OrgRegistration";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import OrgDashboard from './pages/OrgDashboard';
import OrgCampaigns from './pages/OrgCampaigns';
import OrgCampaignDetails from './pages/OrgCampaignDetails';
import OrgInventory from './pages/OrgInventory';
import OrgInventoryDetails from './pages/OrgInventoryDetails';
import OrgEmergencyRequests from './pages/OrgEmergencyRequests';
import OrgAppointmentRequests from './pages/OrgAppointmentRequests'; // Added
import OrgLayout from './components/layout/OrgLayout';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import DonateSuccess from './pages/DonateSuccess';


function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/register-partner" ||
    location.pathname.startsWith("/payment") ||
    location.pathname.startsWith("/donate");
  const isDashboardPage = location.pathname.includes("/dashboard") ||
    location.pathname === "/profile" ||
    location.pathname === "/request-donation" ||
    location.pathname === "/donations" ||
    location.pathname === "/appointments" ||
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/admin/") ||
    location.pathname.startsWith("/org-dashboard");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isDashboardPage && <Navbar />}
      <main className={!isAuthPage && !isDashboardPage ? "flex-grow pt-16" : "flex-grow"}>
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
          <Route path="/register-partner" element={
            <PublicRoute>
              <OrgRegistration />
            </PublicRoute>
          } />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-donation"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <RequestDonation />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <MyDonations />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <Appointments />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <Profile />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <ProtectedRoute requiredRole="USER">
                <UserLayout>
                  <UserCampaigns />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/organizations" /** Renaming route from super-dashboard to Organizations */
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <SuperAdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <AdminRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <InventoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <AdminCampaigns />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Payment Routes (standalone, no layout) */}
          <Route path="/payment/success" element={
            <ProtectedRoute requiredRole="ORGANIZATION">
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/payment/:campaignId" element={
            <ProtectedRoute requiredRole="ORGANIZATION">
              <PaymentPage />
            </ProtectedRoute>
          } />
          {/* Donation Success (any user) */}
          <Route path="/donate/success" element={
            <ProtectedRoute requiredRole="USER">
              <DonateSuccess />
            </ProtectedRoute>
          } />
          <Route
            path="/org-dashboard/*"
            element={
              <ProtectedRoute requiredRole="ORGANIZATION">
                <OrgLayout>
                  <Routes>
                    <Route path="/" element={<OrgDashboard />} />
                    <Route path="/campaigns" element={<OrgCampaigns />} />
                    <Route path="/campaigns/:id" element={<OrgCampaignDetails />} />
                    <Route path="/emergency" element={<OrgEmergencyRequests />} />
                    <Route path="/inventory" element={<OrgInventory />} />
                    <Route path="/inventory/:bloodGroup" element={<OrgInventoryDetails />} />
                    <Route path="/appointments" element={<OrgAppointmentRequests />} /> {/* Added */}
                  </Routes>

                </OrgLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
    </div >
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
