import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { GeneralContextProvider } from "./components/GeneralContext";
import { SseProvider } from "./context/SseContext";

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <SseProvider>
                <GeneralContextProvider>
                  <Dashboard />
                </GeneralContextProvider>
              </SseProvider>
            </ProtectedRoute>
          }
        />

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    </BrowserRouter>
  );
};

export default App;