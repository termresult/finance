import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({
  title,
  children,
  onClose,
  footer,
  wide = false,
  compact = false,
}) {
  const sizeClass = compact ? 'compact' : wide ? 'wide' : ''

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`modal ${sizeClass}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close" type="button">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
