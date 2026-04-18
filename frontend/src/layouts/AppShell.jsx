import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BackgroundScene from '../components/BackgroundScene';
import ChatWidget from '../components/ChatWidget';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const loadNotifications = () => {
    dashboardService.getNotifications().then(setNotifications);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleApproveNotification = async (notification) => {
    await dashboardService.approveUser(notification.context.user_id);
    await dashboardService.markNotificationAsRead(notification.id);
    await loadNotifications();
  };

  const handleReadNotification = async (notification) => {
    await dashboardService.markNotificationAsRead(notification.id);
    await loadNotifications();
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 md:px-6">
      <BackgroundScene />
      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[290px_1fr]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 pb-20">
          <Navbar
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            notifications={notifications}
            onApproveNotification={handleApproveNotification}
            onReadNotification={handleReadNotification}
          />
          <Outlet context={{ user }} />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
