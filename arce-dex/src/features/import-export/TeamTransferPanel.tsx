import { Copy, Download, Upload } from 'lucide-react'

type TeamTransferPanelProps = {
  exportValue: string
}

export function TeamTransferPanel({ exportValue }: TeamTransferPanelProps) {
  return (
    <section className="transfer-panel">
      <header>
        <p className="eyebrow">Importar e exportar</p>
        <h2>Compartilhe times</h2>
      </header>
      <textarea aria-label="JSON do time" readOnly value={exportValue} />
      <div className="transfer-actions">
        <button type="button">
          <Copy size={16} />
          Copiar
        </button>
        <button type="button">
          <Download size={16} />
          Exportar
        </button>
        <button type="button">
          <Upload size={16} />
          Importar
        </button>
      </div>
      <p className="success-copy">Formato validado no mock visual.</p>
    </section>
  )
}
