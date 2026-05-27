import { Copy, Download, Upload } from 'lucide-react'

type TeamTransferPanelProps = {
  exportValue: string
  importMessage: string
  onCopy: () => void
  onImport: () => void
  onImportValueChange: (value: string) => void
}

export function TeamTransferPanel({
  exportValue,
  importMessage,
  onCopy,
  onImport,
  onImportValueChange,
}: TeamTransferPanelProps) {
  return (
    <section className="transfer-panel">
      <header>
        <p className="eyebrow">Importar e exportar</p>
        <h2>Compartilhe times</h2>
      </header>
      <textarea
        aria-label="JSON do time"
        onChange={(event) => onImportValueChange(event.target.value)}
        value={exportValue}
      />
      <div className="transfer-actions">
        <button type="button" onClick={onCopy}>
          <Copy size={16} />
          Copiar
        </button>
        <button type="button" onClick={onCopy}>
          <Download size={16} />
          Exportar
        </button>
        <button type="button" onClick={onImport}>
          <Upload size={16} />
          Importar
        </button>
      </div>
      <p className="success-copy">{importMessage}</p>
    </section>
  )
}
