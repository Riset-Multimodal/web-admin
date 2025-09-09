import React, { useState, useEffect } from 'react';
import LoginView from './components/Login';
import Sidebar from './components/Sidebar';
import KeylogsView from './components/Keylog';
import PostureView from './components/Posture';
import { LoadingSpinner, ErrorState } from './components/Shared';
import { UserFromApi } from './components/Shared';

const API_BASE_URL = 'http://10.34.4.136:5000';

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Application data state
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [activeView, setActiveView] = useState('keylogs');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Loading and error states
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Fetch users data after login
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      console.log("User logged in. Fetching users...");
      setIsLoadingUsers(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/users`);

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }

        const dataFromApi: UserFromApi[] = await response.json();
        console.log("Data received from API:", dataFromApi);
        setUsers(dataFromApi);

        // Auto-select first user if available
        if (dataFromApi.length > 0) {
          setSelectedUserId(dataFromApi[0].user_email);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        console.error("Error fetching users:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn]);

  // Retry function for error state
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

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const dataFromApi: UserFromApi[] = await response.json();
      setUsers(dataFromApi);

      // Auto-select first user if available and no user is currently selected
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

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Main dashboard layout
  return (
      <div className="flex h-screen bg-slate-100">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Loading State */}
          {isLoadingUsers && (
              <div className="flex-1 flex flex-col items-center justify-center bg-white">
                <LoadingSpinner className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Dashboard</h3>
                <p className="text-slate-500 text-center max-w-md">
                  Fetching user data and initializing monitoring systems...
                </p>
              </div>
          )}

          {/* Error State */}
          {error && !isLoadingUsers && (
              <div className="flex-1 flex items-center justify-center bg-white">
                <ErrorState
                    message={`Unable to load user data: ${error}`}
                    onRetry={retryFetchUsers}
                />
              </div>
          )}

          {/* Main Content */}
          {!isLoadingUsers && !error && (
              <>
                {activeView === 'keylogs' && (
                    <KeylogsView
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
                        users={users}
                    />
                )}

                {activeView === 'posture' && (
                    <PostureView
                        selectedUserId={selectedUserId}
                        setSelectedUserId={setSelectedUserId}
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