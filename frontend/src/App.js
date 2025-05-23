
import './App.css';
import authService from "./services/authService";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Homepage from "./components/Homepage";

const ProtectedRoute = ({children}) => {
  return authService.isLoggedIn() ? children : <Navigate to="/login" />;
}

const PublicRoute = ({children}) => {
  return !authService.isLoggedIn() ? children : <Navigate to="/homepage" />;
}

function App() {
  return (
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

            <Route path="/homepage" element={<ProtectedRoute><Homepage/></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
