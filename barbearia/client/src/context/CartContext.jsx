import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [itens, setItens] = useState([]) // [{ produto, quantidade }]

  const adicionar = (produto) => {
    setItens((atual) => {
      const existe = atual.find((i) => i.produto.id === produto.id)
      if (existe) {
        return atual.map((i) =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...atual, { produto, quantidade: 1 }]
    })
  }

  const remover = (produtoId) => {
    setItens((atual) => atual.filter((i) => i.produto.id !== produtoId))
  }

  const mudarQtd = (produtoId, delta) => {
    setItens((atual) =>
      atual
        .map((i) => (i.produto.id === produtoId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0)
    )
  }

  const limpar = () => setItens([])

  const total = useMemo(
    () => itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0),
    [itens]
  )
  const qtdTotal = useMemo(
    () => itens.reduce((s, i) => s + i.quantidade, 0),
    [itens]
  )

  return (
    <CartContext.Provider value={{ itens, adicionar, remover, mudarQtd, limpar, total, qtdTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
