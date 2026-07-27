import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';

export default function App() {
  const [search, setSearch] = useState('');

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header search={search} onSearchChange={setSearch} />
        <HomePage search={search} />
        <Footer />
      </div>
    </CartProvider>
  );
}
