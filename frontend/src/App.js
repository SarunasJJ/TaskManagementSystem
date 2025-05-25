import './App.css';
import authService from "./services/authService";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Homepage from "./components/Homepage";
import GroupsList from "./components/GroupsList";
import CreateGroup from "./components/CreateGroup";
import GroupView from "./components/GroupView";
import MuiThemeProvider from "./components/MuiThemeProvider";

const ProtectedRoute = ({children}) => {
    return authService.isLoggedIn() ? children : <Navigate to="/login" />;
}

const PublicRoute = ({children}) => {
    return !authService.isLoggedIn() ? children : <Navigate to="/homepage" />;
}

function App() {
    return (
        <MuiThemeProvider>
            <BrowserRouter>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />

                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

                        <Route path="/homepage" element={<ProtectedRoute><Homepage/></ProtectedRoute>} />

                        {/* Group Routes */}
                        <Route path="/groups" element={<ProtectedRoute><GroupsList/></ProtectedRoute>} />
                        <Route path="/groups/create" element={<ProtectedRoute><CreateGroup/></ProtectedRoute>} />
                        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupView/></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </MuiThemeProvider>
    );
}

export default App;