import React, { useState, useEffect } from 'react';
import LoginView from './components/Login';
import Sidebar from './components/Sidebar';
import KeylogsView from './components/Keylog';
import PostureView from './components/Posture';
import { UserFromApi } from './components/Shared';

const API_BASE_URL = 'http://10.200.19.62:5000';

function App() {
  // State untuk mengelola login dan data aplikasi
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<UserFromApi[]>([]);
  const [activeView, setActiveView] = useState('keylogs'); // Default view setelah login
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // State untuk loading dan error saat mengambil daftar pengguna
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi yang dipanggil oleh LoginView saat login berhasil
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // useEffect untuk mengambil data pengguna HANYA SETELAH login berhasil
  useEffect(() => {
    // Jangan fetch data jika belum login
    if (!isLoggedIn) return;

    const fetchUsers = async () => {
      console.log("User logged in. Attempting to fetch users...");
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        const dataFromApi: UserFromApi[] = await response.json();
        console.log("Data received from API:", dataFromApi);
        setUsers(dataFromApi.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        console.error("Error fetching users:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isLoggedIn]); // <-- Dependensi: efek ini berjalan saat isLoggedIn menjadi true

  // Jika belum login, tampilkan halaman Login
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Setelah login, tampilkan layout dasbor
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1">
        {isLoadingUsers ? (
          <div className="flex h-full items-center justify-center">Loading user data...</div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-red-500">Error: {error}</div>
        ) : (
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