import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../utils/auth';

export default function NotFound() {
  const { isAuthenticated, profile, loading } = useAuth();
  const homeHref = isAuthenticated && profile ? getDefaultRoute(profile) : '/login';
  const homeLabel = isAuthenticated && profile ? 'Back to my portal' : 'Go to login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-lg text-gray-600">Page not found.</p>
      <p className="mt-1 text-sm text-gray-500">You don’t have access to this area or the page doesn’t exist.</p>
      <Link
        to={homeHref}
        className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
