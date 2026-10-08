import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Usuario } from '../../api/types';
import { saveSessao } from '../../auth/session';
import { useSessao } from '../../auth/useSessao';
import './LoginPage.css';

/**
 * Tela de login do Figma. A arte (padrão amarelo, cartão preto, "LOGIN", botão "entrar" e logo)
 * é a própria exportação do Figma; por cima dela ficam os campos e botões reais, nas mesmas posições.
 */
export function LoginPage() {
  const sessao = useSessao();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (sessao) return <Navigate to="/faturamento" replace />;

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !senha) {
      setMensagem('Informe o usuário e a senha.');
      return;
    }
    setEnviando(true);
    setMensagem(null);
    try {
      const res = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { usuario, senha });
      saveSessao(res, lembrar);
    } catch (err) {
      setMensagem(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
      setEnviando(false);
    }
  }

  return (
    <div className="rk-login">
      <form className="rk-login__frame" onSubmit={entrar} noValidate>
        <h1 className="sr-only">Login - RK Informática e Games</h1>
        <input
          className="rk-login__input rk-login__input--usuario"
          aria-label="Usuário"
          placeholder="Usuario"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          className="rk-login__input rk-login__input--senha"
          aria-label="Senha"
          placeholder="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit" className="rk-login__hit rk-login__entrar" disabled={enviando} aria-label="Entrar" />
        <button
          type="button"
          className="rk-login__hit rk-login__esqueci"
          aria-label="Esqueci a senha"
          onClick={() => setMensagem('Procure o administrador do sistema para redefinir sua senha.')}
        />
        <label className="rk-login__lembrar">
          <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
          <span className="sr-only">Lembrar de mim</span>
        </label>
        {mensagem && (
          <p className="rk-login__mensagem" role="alert">
            {mensagem}
          </p>
        )}
      </form>
    </div>
  );
}
