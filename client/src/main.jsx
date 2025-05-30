import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import Homepage from "./routes/Homepage.jsx";
import PostListPage from "./routes/PostListPage.jsx";
import Write from "./routes/Write.jsx";
import LoginPage from "./routes/LoginPage.jsx";
import RegisterPage from "./routes/RegisterPage.jsx";
import SinglePostPage from "./routes/SinglePostPage.jsx";
import UserArticlesPage from "./routes/UserArticlesPage.jsx";
import EditPost from "./routes/EditPost.jsx"; // Importar el nuevo componente
import MainLayout from './layouts/MainLayout.jsx';
import { ClerkProvider } from '@clerk/clerk-react'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ContactFormsPage from "./routes/ContactFormsPage.jsx";

const queryClient = new QueryClient()

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/posts",
        element: <PostListPage />,
      },
      {
        path: "/write",
        element: <Write />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/post/:slug",
        element: <SinglePostPage />,
      },
      {
        path: "/user-articles",
        element: <UserArticlesPage />,
      },
      {
        path: "/edit/:id",
        element: <EditPost />,
      },
      {
        path: "/edit-admin/:id",
        element: <EditPost />,
      },
      // Redirigir la ruta de formularios de contacto a user-articles
      {
        path: "/admin/contact-forms",
        element: <UserArticlesPage />,
      },
      // Agregar una ruta para manejar el error específico
      {
        path: "*",
        element: <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Página no encontrada</h1>
          <p className="mb-6">La página que estás buscando no existe.</p>
          <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition duration-300">
            Volver al inicio
          </a>
        </div>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={ queryClient }>
        <RouterProvider router={router} />
        <ToastContainer position='bottom-right'/>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);