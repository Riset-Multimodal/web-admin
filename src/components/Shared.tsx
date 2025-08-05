import React from 'react';

// Tipe untuk User yang datang dari API /users
export interface UserFromApi {
    user_email: string;
    created_at: string;
}

// Tipe untuk Log yang datang dari API /keylog
export interface ApiLog {
  id: number;
  user_email: string;
  created_at: string;
  keystroke_count: number | null;
  left_click_count: number | null;
  right_click_count: number | null;
  scroll_up: number | null;
  scroll_down: number | null;
  space_count: number | null;
  error_rate: number | null;
  mean_dwell_time_ms: number | null;
  std_dev_dwell_time_ms: number | null;
  mean_flight_time_ms: number | null;
  std_dev_flight_time_ms: number | null;
  mean_digraph_time_ms: number | null;
  std_dev_digraph_time_ms: number | null;
  pause_count: number | null;
  mean_pause_duration_ms: number | null;
  mean_burst_length: number | null;
  type: string | null;
}

// Komponen Ikon (Isi dengan SVG Anda)
export const PostureIcon = ({ className = '' }) => ( <svg className={className} /> );
export const KeylogIcon = ({ className = '' }) => ( <svg className={className} /> );
export const PlaceholderIcon = ({ className = '' }) => ( <svg className={className} /> );

// Komponen UserSelector yang dinamis
export const UserSelector = ({ selectedUserId, setSelectedUserId, users = [] }: { selectedUserId: string | null; setSelectedUserId: (id: string | null) => void; users: UserFromApi[] }) => (
  <div className="relative">
    <select
      value={selectedUserId || ''}
      onChange={(e) => setSelectedUserId(e.target.value)}
      className="appearance-none w-48 bg-white border border-slate-300 rounded-lg py-2 pl-4 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="" disabled>Select a User...</option>
      {Array.isArray(users) && users.map(user => {
        const name = user.user_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
          <option key={user.user_email} value={user.user_email}>{name}</option>
        );
      })}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);