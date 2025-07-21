import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <RouterProvider router={router} fallbackElement={<p>Loading…</p>} />
    </>
  );
}
