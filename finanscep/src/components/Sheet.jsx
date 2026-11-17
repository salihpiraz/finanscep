export default function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="back absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="sheet relative w-full max-w-md mx-auto rounded-t-3xl p-5 shadow-2xl border-t"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--line)',
          paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom,0px))',
          maxHeight: '92%',
          overflowY: 'auto'
        }}
      >
        <div className="w-10 h-1.5 rounded-full mx-auto mb-3" style={{ background: 'var(--line)' }} />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="w-11 h-11 -mr-2 rounded-full text-xl muted" aria-label="Kapat">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
