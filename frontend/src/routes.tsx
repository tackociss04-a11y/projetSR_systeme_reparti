
import Home from './pages/Home';
import ClientPage from './pages/Client';
import TrackingPage from './pages/Tracking';
// import AdminPage from './pages/Admin';
// import NotFoundPage from './pages/NotFound';

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/client', element: <ClientPage /> },
  { path: '/tracking', element: <TrackingPage /> },
  // { path: '/admin', element: <AdminPage /> },
  // { path: '*', element: <NotFoundPage /> },
];