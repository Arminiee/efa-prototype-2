import React from 'react'
export function Badge({children, variant='default', className=''}){
  const cls = variant==='outline' ? 'border text-neutral-700 bg-white' : variant==='secondary' ? 'bg-neutral-100' : 'bg-neutral-900 text-white'
  return <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', cls, className].join(' ')}>{children}</span>
}
