// App.tsx
import React, { useState, useEffect } from 'react';
import LoginView from './components/Login';
import Sidebar from './components/Sidebar';
import KeylogsView from './components/Keylog';
import PostureView from './components/Posture';
import TlxView from './components/TlxView';
import { LoadingSpinner, ErrorState } from './components/Shared';
import { UserFromApi } from './components/Shared';

const API_BASE_URL = 'https://admin-riset-be.akbarfikri.my.id';

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek localStorage saat pertama kali render
  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn');
    if (storedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  // Application data state
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [activeView, setActiveView] = useState('keylogs');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');

  // Loading and error states
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users data after login
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);

        const dataFromApi: UserFromApi[] = await response.json();
        setUsers(dataFromApi);

        // Auto-select first user if available
        if (dataFromApi.length > 0) {
          setSelectedUserId(dataFromApi[0].user_email);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn]);

  const retryFetchUsers = () => {
    if (isLoggedIn) {
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);

      const dataFromApi: UserFromApi[] = await response.json();
      setUsers(dataFromApi);
      console.log(dataFromApi)

      if (dataFromApi.length > 0 && !selectedUserId) {
        setSelectedUserId(dataFromApi[0].user_email);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Jika belum login, tampilkan login page
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
      <div className="flex h-screen bg-slate-100">
        {/* Sidebar + Logout */}
        <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Loading State - only show for views that need user data */}
          {isLoadingUsers && (activeView === 'keylogs' || activeView === 'posture') && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <LoadingSpinner className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Dashboard</h3>
                <p className="text-slate-500 text-center max-w-md">
                  Fetching user data and initializing monitoring systems...
                </p>
              </div>
          )}

          {/* Error State - only show for views that need user data */}
          {error && !isLoadingUsers && (activeView === 'keylogs' || activeView === 'posture') && (
              <div className="flex-1 flex items-center justify-center bg-white">
                <ErrorState
                    message={`Unable to load user data: ${error}`}
                    onRetry={retryFetchUsers}
                />
              </div>
          )}

          {/* Main Content */}
          {/* NASA-TLX View doesn't need user loading states */}
          {activeView === 'tlx' && (
              <TlxView />
          )}

          {/* User-dependent views */}
          {!isLoadingUsers && !error && (
              <>
                {activeView === 'keylogs' && (
                    <KeylogsView
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
                        selectedFaculty={selectedFaculty}
                        setSelectedFaculty={setSelectedFaculty}
                        users={users}
                    />
                )}
                {activeView === 'posture' && (
                    <PostureView
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
                        selectedFaculty={selectedFaculty}
                        setSelectedFaculty={setSelectedFaculty}
                        users={users}
                    />
                )}
              </>
          )}
        </div>
      </div>
  );
}

export default App;