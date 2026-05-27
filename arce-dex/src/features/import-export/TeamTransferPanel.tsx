import { Copy, Download, Upload } from 'lucide-react'

type TeamTransferPanelProps = {
  exportValue: string
  importMessage: string
  mode: 'export' | 'import'
  onCopy: () => void
  onClose: () => void
  onImport: () => void
  onImportValueChange: (value: string) => void
}

export function TeamTransferPanel({
  exportValue,
  importMessage,
  mode,
  onCopy,
  onClose,
  onImport,
  onImportValueChange,
}: TeamTransferPanelProps) {
  const isExportMode = mode === 'export'

  return (
    <section className="transfer-panel transfer-panel--compact">
      <header>
        <div>
          <p className="eyebrow">{isExportMode ? 'Exportar time' : 'Importar time'}</p>
          <h2>{isExportMode ? 'Copie o codigo do time' : 'Cole um codigo de time'}</h2>
        </div>
        <button className="icon-action" type="button" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className="sr-only">Fechar</span>
        </button>
      </header>
      <textarea
        aria-label="JSON do time"
        readOnly={isExportMode}
        onChange={(event) => onImportValueChange(event.target.value)}
        value={exportValue}
      />
      <div className="transfer-actions">
        {isExportMode ? (
          <>
            <button type="button" onClick={onCopy}>
              <Copy size={16} />
              Copiar
            </button>
            <button type="button" onClick={onCopy}>
              <Download size={16} />
              Exportar
            </button>
          </>
        ) : (
          <button type="button" onClick={onImport}>
            <Upload size={16} />
            Importar
          </button>
        )}
      </div>
      {importMessage && <p className="success-copy">{importMessage}</p>}
    </section>
  )
}
