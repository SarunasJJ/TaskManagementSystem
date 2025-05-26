import './App.css';
import authService from "./services/authService";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Homepage from "./components/Homepage";
import CreateGroup from "./components/CreateGroup";
import GroupView from "./components/GroupView";
import CreateTaskPage from "./components/CreateTaskPage";
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
                        <Route path="/" element={<Navigate to="/homepage" />} />

                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

                        {/* Homepage now shows groups list directly */}
                        <Route path="/homepage" element={<ProtectedRoute><Homepage/></ProtectedRoute>} />

                        {/* Group Routes */}
                        <Route path="/groups" element={<Navigate to="/homepage" />} />
                        <Route path="/groups/create" element={<ProtectedRoute><CreateGroup/></ProtectedRoute>} />
                        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupView/></ProtectedRoute>} />

                        {/* Task Routes */}
                        <Route path="/groups/:groupId/tasks/create" element={<ProtectedRoute><CreateTaskPage/></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/homepage" />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </MuiThemeProvider>
    );
}

export default App;