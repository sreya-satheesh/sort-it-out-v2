import {useState} from 'react';
import {AlgorithmId} from './types/sorting';
import {Navbar} from './components/Navbar';
import {HomePage} from './components/HomePage';
import {Playground} from './components/Playground';
import {Footer} from './components/Footer';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | AlgorithmId>('home');

  const handleSelectView = (view: 'home' | AlgorithmId) => {
    setActiveView(view);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div
      className="min-h-screen flex flex-col text-stone-900 relative selection:bg-amber-900 selection:text-amber-50"
      style={{
        backgroundColor: '#F9F4E8',
        backgroundImage:
          'radial-gradient(58% 45% at 18% 4%, rgba(217, 154, 28, 0.10) 0%, rgba(217, 154, 28, 0) 70%), radial-gradient(50% 42% at 86% 10%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%), radial-gradient(60% 48% at 50% 92%, rgba(217, 154, 28, 0.08) 0%, rgba(217, 154, 28, 0) 72%)',
      }}
    >
      <Navbar activeView={activeView} onSelectView={handleSelectView} />

      <div className="flex-1">
        {activeView === 'home' ? (
          <HomePage onSelectAlgorithm={handleSelectView} />
        ) : (
          <Playground algorithm={activeView} />
        )}
      </div>

      <Footer />
    </div>
  );
}
