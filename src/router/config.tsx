
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const SearchPage = lazy(() => import('../pages/search/page'));
const AddItemPage = lazy(() => import('../pages/add-item/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const RemoveItemPage = lazy(() => import('../pages/remove-item/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SearchPage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
  {
    path: '/add-item',
    element: <AddItemPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/remove-item',
    element: <RemoveItemPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
