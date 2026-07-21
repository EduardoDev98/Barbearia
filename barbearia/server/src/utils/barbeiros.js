// Barbeiros da casa (fonte única da verdade).
// Para adicionar/remover um barbeiro, basta editar esta lista.
export const BARBEIROS = [
  { id: 'rangel', nome: 'Rangel Souza' },
  { id: 'diego', nome: 'Diego Martins' }
]

export const idsBarbeiros = () => BARBEIROS.map((b) => b.id)
export const barbeiroValido = (id) => idsBarbeiros().includes(id)
export const nomeBarbeiro = (id) => BARBEIROS.find((b) => b.id === id)?.nome || id
