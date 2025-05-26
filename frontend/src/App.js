import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from 'react';
import authService from "./services/authService";
import MuiThemeProvider from "./components/MuiThemeProvider";
import LoadingState from "./components/common/LoadingState";

const Login = lazy(() => import("./components/auth/Login"));
const SignUp = lazy(() => import("./components/auth/SignUp"));
const Homepage = lazy(() => import("./components/Homepage"));
const CreateGroup = lazy(() => import("./components/CreateGroup"));
const GroupView = lazy(() => import("./components/GroupView"));
const CreateTaskPage = lazy(() => import("./components/CreateTaskPage"));

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.isLoggedIn();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Suspense fallback={<LoadingState message="Loading..." />}>
            {children}
        </Suspense>
    );
};

const PublicRoute = ({ children }) => {
    const isAuthenticated = authService.isLoggedIn();

    if (isAuthenticated) {
        return <Navigate to="/homepage" replace />;
    }

    return (
        <Suspense fallback={<LoadingState message="Loading..." />}>
            {children}
        </Suspense>
    );
};

function App() {
    return (
        <MuiThemeProvider>
            <BrowserRouter>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Navigate to="/homepage" replace />} />

                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <PublicRoute>
                                    <SignUp />
                                </PublicRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/homepage"
                            element={
                                <ProtectedRoute>
                                    <Homepage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Group Routes */}
                        <Route path="/groups" element={<Navigate to="/homepage" replace />} />
                        <Route
                            path="/groups/create"
                            element={
                                <ProtectedRoute>
                                    <CreateGroup />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/groups/:groupId"
                            element={
                                <ProtectedRoute>
                                    <GroupView />
                                </ProtectedRoute>
                            }
                        />

                        {/* Task Routes */}
                        <Route
                            path="/groups/:groupId/tasks/create"
                            element={
                                <ProtectedRoute>
                                    <CreateTaskPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/homepage" replace />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </MuiThemeProvider>
    );
}

export default App;