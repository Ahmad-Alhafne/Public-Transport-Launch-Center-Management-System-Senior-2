import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col content-wrapper">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="">
          <Outlet />
        </div>
      </main>
    </div>
  );
}