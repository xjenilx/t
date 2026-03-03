import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Community } from './components/Community';
import { Pricing } from './components/Pricing';
import { Templates } from './components/Templates';
import { Create } from './components/Create';
import { Dashboard } from './components/Dashboard';
import { BrandKit } from './components/BrandKit';
import { SignIn } from './components/SignIn';
import { Profile } from './components/Profile';
import { auth, onAuthStateChanged, User } from './lib/firebase';

export type Page = 'home' | 'create' | 'community' | 'plans' | 'templates' | 'dashboard' | 'brand-kit' | 'signin' | 'profile';

export interface Generation {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  likes?: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplatePrompt, setSelectedTemplatePrompt] = useState<string | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        if (currentPage === 'signin') {
          setCurrentPage('dashboard');
        }

        // Fetch existing generations from backend
        try {
          const response = await fetch(`/api/generations/${currentUser.uid}`);
          const data = await response.json();
          setRecentGenerations(data);
        } catch (error) {
          console.error("Failed to fetch generations", error);
        }
      }
    });
    return () => unsubscribe();
  }, [currentPage]);

  const handleUseTemplate = (prompt: string) => {
    setSelectedTemplatePrompt(prompt);
    setCurrentPage('create');
  };

  const handleNewGeneration = (gen: Generation) => {
    setRecentGenerations(prev => [gen, ...prev]);
  };

  const renderPage = () => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );

    switch (currentPage) {
      case 'home':
        return <Hero onStart={() => setCurrentPage('create')} />;
      case 'create':
        return (
          <Create
            user={user}
            initialPrompt={selectedTemplatePrompt}
            onGenerated={handleNewGeneration}
            onClearTemplate={() => setSelectedTemplatePrompt(null)}
          />
        );
      case 'community':
        return <Community onRemix={handleUseTemplate} />;
      case 'plans':
        return <Pricing />;
      case 'templates':
        return <Templates onUseStyle={handleUseTemplate} />;
      case 'dashboard':
        return <Dashboard user={user} generations={recentGenerations} onNavigate={setCurrentPage} />;
      case 'brand-kit':
        return <BrandKit user={user} />;
      case 'signin':
        return <SignIn />;
      case 'profile':
        return <Profile user={user} onNavigate={setCurrentPage} />;
      default:
        return <Hero onStart={() => setCurrentPage('create')} />;
    }
  };

  return (
    <div className="min-h-screen purple-gradient flex flex-col transition-colors duration-300">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-grow">
        {renderPage()}
      </main>

      <footer className="py-12 px-6 text-center opacity-40 text-sm border-t border-white/5 mt-20">
        <p className="mb-2">© 2024 MAKE UGCAD. All rights reserved.</p>
        <p className="font-mono text-[10px] opacity-50">Deployed at: <a href="http://localhost:3001" className="hover:text-indigo-400 transition-colors">http://localhost:3001</a></p>
      </footer>
    </div>
  );
}
