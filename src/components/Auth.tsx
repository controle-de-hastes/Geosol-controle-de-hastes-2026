import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Conta de administrador criada com sucesso! Faça o login agora.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 mb-4 bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-700/50 p-4">
            <img src={logoImg} alt="GEOSOL" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GEOSOL</h1>
          <p className="text-slate-400 mt-2 font-medium">Controle de Hastes</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? 'Entrar na sua conta' : 'Criar Conta Administrador'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isLogin ? (
              <p className="text-sm text-slate-400">
                O acesso é restrito. <br/>
                <button 
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                  }} 
                  className="text-blue-400 hover:text-blue-300 mt-2 underline"
                >
                  Criar minha conta de Administrador
                </button>
              </p>
            ) : (
              <button 
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }} 
                className="text-sm text-slate-400 hover:text-white"
              >
                Voltar para o Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
