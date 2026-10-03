import LandingPage from "../pages/LandingPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/therapist/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/therapist/Profile";
import PublicTherapistProfile from "../pages/client/PublicTherapistProfile";
import Schedule from "../pages/therapist/Schedule";
import BookingPage from "../pages/client/BookingPage";

import Clients from "../pages/therapist/Clients";

import ClientDetails from "../pages/therapist/ClientDetails";
import Notes from "../pages/therapist/Notes";
import ClientPortal from "../pages/client/ClientPortal";
import Analytics from "../pages/therapist/Analytics";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/schedule"
  element={
    <ProtectedRoute>
      <Schedule />
    </ProtectedRoute>
  }
/>

        <Route
  path="/clients"
  element={
    <ProtectedRoute>
      <Clients />
    </ProtectedRoute>
  }
/>

<Route
  path="/clients/:id"
  element={
    <ProtectedRoute>
      <ClientDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/notes"
  element={
    <ProtectedRoute>
      <Notes />
    </ProtectedRoute>
  }
/>

        
        <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/booking/:slug"
  element={<BookingPage />}
/>

<Route
  path="/client-portal"
  element={<ClientPortal />}
/>

          <Route
  path="/:slug"
  element={<PublicTherapistProfile />}
/>

        <Route
  path="/"
  element={<LandingPage />}
/>

        <Route
  path="*"
  element={<Navigate to="/" replace />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;