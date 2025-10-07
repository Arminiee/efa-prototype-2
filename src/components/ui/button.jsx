import React from 'react'
export function Button({variant='default', size='md', className='', children, ...props}){
  const base = 'inline-flex items-center justify-center rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
  const sizes = { sm:'px-3 py-1.5 text-sm', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5' };
  const variants = {
    default:'bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-400',
    outline:'border bg-white hover:bg-neutral-50',
    ghost:'hover:bg-neutral-100',
    secondary:'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
  };
  return <button className={[base,sizes[size],variants[variant]||variants.default,className].join(' ')} {...props}>{children}</button>
}
