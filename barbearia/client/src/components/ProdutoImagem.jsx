import { useState } from 'react'

// Placeholder desenhado (SVG) na paleta dourada — usado quando a foto externa falha.
// Não depende de nenhuma URL: é gerado no próprio navegador.
const Placeholder = ({ label }) => (
  <div className="produto-placeholder">
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="3">
      <rect x="34" y="20" width="52" height="80" rx="8" />
      <rect x="44" y="8" width="32" height="16" rx="4" />
      <line x1="46" y1="44" x2="74" y2="44" />
      <line x1="46" y1="56" x2="74" y2="56" />
      <line x1="46" y1="68" x2="66" y2="68" />
    </svg>
    <span>{label}</span>
  </div>
)

const ProdutoImagem = ({ src, alt, nome }) => {
  const [falhou, setFalhou] = useState(false)
  if (falhou || !src) return <Placeholder label={nome} />
  return (
    <img
      src={src} alt={alt} className="produto-foto-img" loading="lazy"
      onError={() => setFalhou(true)}
    />
  )
}

export default ProdutoImagem
