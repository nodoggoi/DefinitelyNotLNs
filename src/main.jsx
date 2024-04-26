import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Pages the router will use to show the correct views
import App from './App';
import Homepage from './pages/Homepage';
import NovelSelect from './pages/NovelSelect';
import ChapterSelect from './pages/ChapterSelect';
import ReadChapter from './pages/ReadChapter';

// Create the router
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Homepage /> },
            { path: '/novelSelect', element: <NovelSelect /> },
            {
                path: '/chapterSelect',
                element: <ChapterSelect />,
            },
            {
                path: '/readChapter',
                element: <ReadChapter />,
            },
        ],
    },
]);

// Render the router
ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
);
