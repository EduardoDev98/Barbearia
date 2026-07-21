// Catálogo de serviços da barbearia (fonte única da verdade).
// O front consome via endpoint; o back valida contra esta lista.
export const SERVICOS = [
  { nome: 'Corte de cabelo', duracao: 60, preco: 40 },
  { nome: 'Barba', duracao: 60, preco: 30 },
  { nome: 'Corte + Barba', duracao: 60, preco: 60 },
  { nome: 'Corte + Barba + Sobrancelha', duracao: 60, preco: 75 },
  { nome: 'Pézinho / Acabamento', duracao: 60, preco: 20 },
  { nome: 'Pigmentação de barba', duracao: 60, preco: 50 }
]

export const nomesServicos = () => SERVICOS.map((s) => s.nome)
export const servicoValido = (nome) => nomesServicos().includes(nome)
