import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { BioPage } from './components/BioPage';
import { getPageBySlug } from './services/storage';
import { BioPage as BioPageType } from './types';

function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [routeParam, setRouteParam] = useState<string>(''); // Slug or ID
  const [publicPage, setPublicPage] = useState<BioPageType | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#/p/')) {
        // Public View
        const slug = hash.replace('#/p/', '');
        const page = getPageBySlug(slug);
        setPublicPage(page || null);
        setCurrentRoute('PUBLIC');
      } else if (hash.startsWith('#/dashboard/')) {
        // Editor View
        const id = hash.replace('#/dashboard/', '');
        setRouteParam(id);
        setCurrentRoute('DASHBOARD_EDIT');
      } else {
        // Dashboard List View
        setCurrentRoute('DASHBOARD_LIST');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  if (currentRoute === 'PUBLIC') {
    if (!publicPage) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400 mb-8">Page not found</p>
                <a href="#/dashboard" className="text-indigo-400 hover:underline">Create this page</a>
            </div>
        </div>
      );
    }
    return <BioPage page={publicPage} previewMode={false} />;
  }

  return (
    <Dashboard 
      initialPageId={currentRoute === 'DASHBOARD_EDIT' ? routeParam : undefined}
      onNavigate={navigate}
    />
  );
}

export default App;