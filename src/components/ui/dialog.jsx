import React from 'react'
export function Dialog({open, onOpenChange, children}){ return open ? <div className='fixed inset-0 z-50'>{children}</div> : null }
export function DialogContent({className='', children}){
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center p-4'>
      <div className={['bg-white rounded-2xl max-w-3xl w-full border', className].join(' ')}>{children}</div>
    </div>
  )
}
export function DialogHeader({children}){ return <div className='px-4 pt-3'>{children}</div> }
export function DialogTitle({children, className=''}){ return <div className={['font-semibold text-lg', className].join(' ')}>{children}</div> }
export function DialogDescription({children, className=''}){ return <div className={['text-xs text-neutral-500', className].join(' ')}>{children}</div> }
