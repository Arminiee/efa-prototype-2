import React from 'react'
export function Sheet({open, onOpenChange, children}){ return open ? <div className='fixed inset-0 z-40'>{children}</div> : null }
export function SheetContent({className='', children}){
  return (
    <div className='fixed inset-0 bg-black/30'>
      <div className={['absolute right-0 top-0 h-full w-full max-w-[700px] bg-white border-l rounded-none shadow', className].join(' ')}>
        {children}
      </div>
    </div>
  )
}
export function SheetHeader({children}){ return <div className='px-4 pt-4'>{children}</div> }
export function SheetTitle({children}){ return <div className='font-semibold text-lg'>{children}</div> }
