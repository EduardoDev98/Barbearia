import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'
import ProdutoImagem from '../components/ProdutoImagem.jsx'
import api from '../api/api.js'

const brl = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const FORMAS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro']

const LojaPage = () => {
  const { itens, adicionar, remover, mudarQtd, limpar, total, qtdTotal } = useCart()
  const [produtos, setProdutos] = useState([])
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('Pix')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/produtos').then(({ data }) => setProdutos(data)).catch(() => setProdutos([]))
  }, [])

  const finalizar = async () => {
    setErro('')
    if (itens.length === 0) { setErro('Seu carrinho está vazio.'); return }
    if (cliente.trim().length < 2) { setErro('Informe seu nome.'); return }
    if (!/^[\d\s()+-]{8,20}$/.test(telefone.trim())) { setErro('Telefone inválido.'); return }

    setEnviando(true)
    try {
      const payload = {
        cliente, telefone, formaPagamento,
        itens: itens.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade }))
      }
      const { data } = await api.post('/pedidos', payload)
      setSucesso(data)
      limpar(); setCliente(''); setTelefone('')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao finalizar o pedido.')
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="card card-center">
        <div className="check-icon">🛍️</div>
        <h1>Pedido reservado!</h1>
        <p className="subtitle">
          Retire e <strong>pague na barbearia</strong>. Você escolheu pagar com {sucesso.formaPagamento}.
        </p>
        <div className="resumo">
          {sucesso.itens.map((i) => (
            <div key={i.produtoId}><strong>{i.quantidade}x</strong> {i.nome} — {brl(i.preco * i.quantidade)}</div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
            <strong>Total:</strong> {brl(sucesso.total)}
          </div>
        </div>
        <button className="btn btn-gold" onClick={() => setSucesso(null)}>Voltar à loja</button>
      </div>
    )
  }

  return (
    <div className="loja">
      <div className="section-head">
        <span className="eyebrow">Produtos</span>
        <h2 className="section-title">Nossa loja</h2>
      </div>

      <div className="aviso-presencial">
        🏪 Compra reservada online, <strong>retirada e pagamento presencial</strong> na barbearia.
      </div>

      <div className="loja-layout">
        <div className="produtos-grid">
          {produtos.map((p) => (
            <div key={p.id} className="produto-card">
              <div className="produto-foto">
                <ProdutoImagem src={p.imagem} alt={p.nome} nome={p.nome} />
              </div>
              <div className="produto-info">
                <h3 className="produto-nome">{p.nome}</h3>
                <p className="produto-desc">{p.descricao}</p>
                <div className="produto-rodape">
                  <span className="produto-preco">{brl(p.preco)}</span>
                  <button className="btn btn-gold btn-add" onClick={() => adicionar(p)}>Adicionar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="carrinho">
          <h3 className="carrinho-titulo">🛒 Carrinho {qtdTotal > 0 && <span className="carrinho-badge">{qtdTotal}</span>}</h3>

          {itens.length === 0 ? (
            <p className="muted">Seu carrinho está vazio. Adicione produtos ao lado.</p>
          ) : (
            <>
              <div className="carrinho-itens">
                {itens.map((i) => (
                  <div key={i.produto.id} className="carrinho-item">
                    <div className="carrinho-item-info">
                      <span className="carrinho-item-nome">{i.produto.nome}</span>
                      <span className="muted">{brl(i.produto.preco)}</span>
                    </div>
                    <div className="carrinho-qtd">
                      <button onClick={() => mudarQtd(i.produto.id, -1)}>−</button>
                      <span>{i.quantidade}</span>
                      <button onClick={() => mudarQtd(i.produto.id, 1)}>+</button>
                    </div>
                    <button className="carrinho-remover" onClick={() => remover(i.produto.id)}>✕</button>
                  </div>
                ))}
              </div>

              <div className="carrinho-total">
                <span>Total</span>
                <strong>{brl(total)}</strong>
              </div>

              <div className="field">
                <label>Seu nome</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="field">
                <label>Forma de pagamento (na retirada)</label>
                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                  {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {erro && <div className="alert alert-error">{erro}</div>}

              <button className="btn btn-gold btn-block" onClick={finalizar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Reservar pedido'}
              </button>
              <p className="muted pagamento-nota">O pagamento é feito presencialmente ao retirar.</p>
            </>
          )}

          {erro && itens.length === 0 && <div className="alert alert-error">{erro}</div>}
        </aside>
      </div>
    </div>
  )
}

export default LojaPage
