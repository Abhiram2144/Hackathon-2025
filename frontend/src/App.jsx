import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "../src/styles/index.css";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Loader from "./components/Loader";

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const { preloading } = useAuth();

  if (preloading) return <Loader />;

  return (
    <div className="flex min-h-screen flex-col bg-[#F2EFE8] text-gray-900">
      <main className="flex-grow">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
