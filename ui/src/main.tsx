import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './routes/App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import OpenCollectiveDiscord from './routes/OpenCollectiveDiscord.tsx';
import OpenCollectiveDiscordComplete from './routes/OpenCollectiveDiscordComplete.tsx';
import OpenCollectiveDiscordCallback from './routes/OpenCollectiveDiscordCallback.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: '/oc',
    element: <OpenCollectiveDiscord />
  },
  {
    path: '/oc/complete',
    element: <OpenCollectiveDiscordComplete />
  },
  {
    path: '/oc/discord/callback',
    element: <OpenCollectiveDiscordCallback />
  }
], { basename: '/ui' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
