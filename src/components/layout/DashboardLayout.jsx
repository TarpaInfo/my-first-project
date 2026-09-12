import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ModalProvider } from '../../context/ModalContext';
import NewTripModal from '../modals/NewTripModal';

export default function DashboardLayout() {
  return (
    <ModalProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <NewTripModal />
      </div>
    </ModalProvider>
  );
}