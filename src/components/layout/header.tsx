import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-green-700 text-white' 
          : 'text-gray-300 hover:bg-green-600 hover:text-white'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

interface HeaderProps {
  userRole?: 'PRODUCER' | 'CONSUMER' | 'STORAGE_OWNER' | 'TRANSPORTER' | 'ADMIN' | null;
  userName?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ userRole, userName }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">AgriLogística Angola</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-2">
              <NavLink href="/">Início</NavLink>
              <NavLink href="/products">Produtos</NavLink>
              <NavLink href="/storage">Armazéns</NavLink>
              <NavLink href="/transport">Transporte</NavLink>
              {userRole === 'PRODUCER' && (
                <NavLink href="/dashboard/producer">Painel do Produtor</NavLink>
              )}
              {userRole === 'CONSUMER' && (
                <NavLink href="/dashboard/consumer">Painel do Comprador</NavLink>
              )}
              {userRole === 'STORAGE_OWNER' && (
                <NavLink href="/dashboard/storage">Painel de Armazenamento</NavLink>
              )}
              {userRole === 'TRANSPORTER' && (
                <NavLink href="/dashboard/transport">Painel de Transporte</NavLink>
              )}
              {userRole === 'ADMIN' && (
                <NavLink href="/admin">Administração</NavLink>
              )}
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            {userName ? (
              <div className="flex items-center space-x-4">
                <Link href="/messages" className="text-gray-300 hover:text-white">
                  <span className="sr-only">Mensagens</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-sm font-medium text-white focus:outline-none">
                    <span>{userName}</span>
                    <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Perfil
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Painel
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Configurações
                    </Link>
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white">
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Registrar
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-green-700 focus:outline-none"
            >
              <span className="sr-only">Abrir menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-700">
              Início
            </Link>
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
              Produtos
            </Link>
            <Link href="/storage" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
              Armazéns
            </Link>
            <Link href="/transport" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
              Transporte
            </Link>
            {userRole && (
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                Painel
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-green-700">
            {userName ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-base font-medium text-white">
                  {userName}
                </div>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                  Perfil
                </Link>
                <Link href="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                  Mensagens
                </Link>
                <Link href="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                  Configurações
                </Link>
                <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-green-600">
                  Sair
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                  Entrar
                </Link>
                <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-green-600">
                  Registrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

