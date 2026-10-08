import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import type { Relatorio } from '../../api/types';
import logo from '../../assets/logo-rk-grande.png';
import { useSessao } from '../../auth/useSessao';
import { useApi } from '../../hooks/useApi';
import { formatBRL, formatDateBR, monthName } from '../../utils/format';
import './RelatorioPage.css';

function ultimoDia(anoMes: string) {
  const [a, m] = anoMes.split('-').map(Number);
  return new Date(a, m, 0).getDate();
}

/** Bloco com rótulo pequeno em caixa-alta e valor, como os campos de uma nota fiscal. */
function Campo({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`nf-campo ${className ?? ''}`}>
      <span className="nf-campo__label">{label}</span>
      <span className="nf-campo__valor">{children}</span>
    </div>
  );
}

/** Relatório mensal no formato de nota fiscal, pronto para imprimir ou salvar em PDF. */
export function RelatorioPage() {
  const sessao = useSessao();
  const { mes = '' } = useParams();
  const { data, error, loading } = useApi<Relatorio>(`/relatorio/${mes}`);

  if (!sessao) return <Navigate to="/login" replace />;

  const [ano, numMes] = mes.split('-');
  const emissao = new Date();
  const emissaoTexto = `${emissao.toLocaleDateString('pt-BR')} ${emissao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="nf-pagina">
      <div className="nf-acoes">
        <Link to="/faturamento" className="nf-btn nf-btn--secundario">
          Voltar
        </Link>
        <button type="button" className="nf-btn" onClick={() => window.print()} disabled={!data}>
          Imprimir / Salvar PDF
        </button>
      </div>

      {loading && !data && <p className="nf-status">Gerando relatório...</p>}
      {error && <p className="nf-status nf-status--erro">{error}</p>}

      {data && (
        <article className="nf">
          <header className="nf-cabecalho">
            <div className="nf-emitente">
              <img src={logo} alt="" className="nf-logo" />
              <div>
                <strong className="nf-empresa">RK INFORMÁTICA E GAMES</strong>
                <span>Sistema de Gerenciamento da Loja</span>
                <span>Emitido por: {sessao.usuario.nome}</span>
              </div>
            </div>
            <div className="nf-titulo">
              <strong>RELATÓRIO MENSAL</strong>
              <span>Nº {numMes}/{ano}</span>
              <span className="nf-sem-valor">Documento sem valor fiscal</span>
            </div>
          </header>

          <section className="nf-linha">
            <Campo label="Período de referência">{`${monthName(mes)} de ${ano}`}</Campo>
            <Campo label="Data inicial">{`01/${numMes}/${ano}`}</Campo>
            <Campo label="Data final">{`${ultimoDia(mes)}/${numMes}/${ano}`}</Campo>
            <Campo label="Data de emissão">{emissaoTexto}</Campo>
          </section>

          <h2 className="nf-secao">Cálculo do período</h2>
          <section className="nf-linha">
            <Campo label="Vendas de produtos">{formatBRL(data.totais.vendas)}</Campo>
            <Campo label="Serviços prestados">{formatBRL(data.totais.servicos)}</Campo>
            <Campo label="Faturamento total">{formatBRL(data.totais.faturamento)}</Campo>
            <Campo label="Despesas">{formatBRL(data.totais.despesas)}</Campo>
            <Campo label="Lucro do período" className="nf-campo--destaque">
              {formatBRL(data.totais.lucro)}
            </Campo>
          </section>

          <h2 className="nf-secao">Produtos vendidos</h2>
          <table className="nf-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Descrição do produto</th>
                <th>Pagamento</th>
                <th className="nf-num">Qtd</th>
                <th className="nf-num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.vendas.map((v) => (
                <tr key={v.id}>
                  <td>{formatDateBR(v.data)}</td>
                  <td>{v.cliente}</td>
                  <td>{v.produto}</td>
                  <td>{v.pagamento}</td>
                  <td className="nf-num">{v.qtd}</td>
                  <td className="nf-num">{formatBRL(v.valor)}</td>
                </tr>
              ))}
              {data.vendas.length === 0 && <LinhaVazia colunas={6} texto="Nenhuma venda no período." />}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total de produtos vendidos</td>
                <td className="nf-num">{data.totais.itensVendidos}</td>
                <td className="nf-num">{formatBRL(data.totais.vendas)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 className="nf-secao">Serviços prestados</h2>
          <table className="nf-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Descrição do serviço</th>
                <th className="nf-num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.servicos.map((s) => (
                <tr key={s.id}>
                  <td>{formatDateBR(s.data)}</td>
                  <td>{s.cliente}</td>
                  <td>{s.tipo}</td>
                  <td>{s.descricao || '—'}</td>
                  <td className="nf-num">{formatBRL(s.valor)}</td>
                </tr>
              ))}
              {data.servicos.length === 0 && <LinhaVazia colunas={5} texto="Nenhum serviço no período." />}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total de serviços</td>
                <td className="nf-num">{formatBRL(data.totais.servicos)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 className="nf-secao">Despesas</h2>
          <table className="nf-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th className="nf-num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.despesas.map((d) => (
                <tr key={d.id}>
                  <td>{formatDateBR(d.data)}</td>
                  <td>{d.nome}</td>
                  <td>{d.tipo}</td>
                  <td className="nf-num">- {formatBRL(d.valor)}</td>
                </tr>
              ))}
              {data.despesas.length === 0 && <LinhaVazia colunas={4} texto="Nenhuma despesa no período." />}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total de despesas</td>
                <td className="nf-num">- {formatBRL(data.totais.despesas)}</td>
              </tr>
            </tfoot>
          </table>

          <section className="nf-total">
            <span>LUCRO LÍQUIDO DO PERÍODO</span>
            <strong>{formatBRL(data.totais.lucro)}</strong>
          </section>

          <footer className="nf-rodape">
            <Campo label="Informações complementares">
              Relatório gerado automaticamente pelo sistema da RK Informática e Games com base nas vendas, serviços e
              despesas registrados no período. Documento sem valor fiscal.
            </Campo>
          </footer>
        </article>
      )}
    </div>
  );
}

function LinhaVazia({ colunas, texto }: { colunas: number; texto: string }) {
  return (
    <tr>
      <td colSpan={colunas} className="nf-vazio">
        {texto}
      </td>
    </tr>
  );
}
