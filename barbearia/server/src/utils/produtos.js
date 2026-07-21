// Catálogo de produtos à venda na barbearia (fonte única da verdade).
// As imagens ficam DENTRO do projeto, em client/public/produtos/, servidas
// pelo caminho /produtos/<arquivo>. Assim não dependem de internet e nunca
// quebram. Para trocar a foto de um produto, basta substituir o arquivo
// correspondente nessa pasta (mantendo o mesmo nome).
export const PRODUTOS = [
  { id: 'pomada-modeladora', nome: 'Pomada Modeladora', descricao: 'Fixação forte, efeito matte', preco: 45, imagem: '/produtos/pomada-modeladora.png' },
  { id: 'shampoo-cabelo', nome: 'Shampoo para Cabelo', descricao: 'Limpeza profunda, uso diário', preco: 38, imagem: '/produtos/shampoo-cabelo.png' },
  { id: 'shampoo-barba', nome: 'Shampoo para Barba', descricao: 'Amacia e hidrata os fios', preco: 42, imagem: '/produtos/shampoo-barba.png' },
  { id: 'oleo-barba', nome: 'Óleo para Barba', descricao: 'Nutre e dá brilho natural', preco: 50, imagem: '/produtos/oleo-barba.png' },
  { id: 'gel-fixador', nome: 'Gel Fixador', descricao: 'Fixação e controle o dia todo', preco: 30, imagem: '/produtos/gel-fixador.png' },
  { id: 'kit-navalha', nome: 'Kit Navalha Clássica', descricao: 'Navalha + lâminas de reposição', preco: 89, imagem: '/produtos/kit-navalha.png' }
]

export const acharProduto = (id) => PRODUTOS.find((p) => p.id === id) || null
