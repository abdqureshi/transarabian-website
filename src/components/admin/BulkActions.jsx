export default function BulkActions({count,children}){if(!count)return null;return <div className="bulk-actions"><b>{count} selected</b>{children}</div>}
