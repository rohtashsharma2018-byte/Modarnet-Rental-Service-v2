import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/sonner';

// Lazy loading to prevent circular dependencies in this single file build
const UserDashboard = React.lazy(() => import('./pages/user/UserDashboard'));
const RentalRequestForm = React.lazy(() => import('./pages/user/RentalRequestForm'));
const PurchaseRequestForm = React.lazy(() => import('./pages/user/PurchaseRequestForm'));
const RentalHistory = React.lazy(() => import('./pages/user/RentalHistory'));
const ViewInventory = React.lazy(() => import('./pages/user/ViewInventory'));
const ContactUs = React.lazy(() => import('./pages/user/ContactUs'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const Inventory = React.lazy(() => import('./pages/admin/Inventory'));
const ManageRequests = React.lazy(() => import('./pages/admin/ManageRequests'));
const ManagePurchases = React.lazy(() => import('./pages/admin/ManagePurchases'));
const ActiveRentals = React.lazy(() => import('./pages/admin/ActiveRentals'));

export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <React.Suspense fallback={<div className="p-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {role === 'user' ? (
              <>
                <Route index element={<UserDashboard />} />
                <Route path="inventory" element={<ViewInventory />} />
                <Route path="request" element={<RentalRequestForm />} />
                <Route path="purchase" element={<PurchaseRequestForm />} />
                <Route path="history" element={<RentalHistory />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : role === 'admin' ? (
              <>
                <Route index element={<Navigate to="/admin" replace />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/inventory" element={<Inventory />} />
                <Route path="admin/requests" element={<ManageRequests />} />
                <Route path="admin/purchases" element={<ManagePurchases />} />
                <Route path="admin/active" element={<ActiveRentals />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : null}
          </Route>
        </Routes>
      </React.Suspense>
      <Toaster />
    </>
  );
}
