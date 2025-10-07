import React from 'react'
export function Card({className='', children}){ return <div className={['bg-white border',className].join(' ')}>{children}</div> }
export function CardHeader({className='', children}){ return <div className={['px-4 pt-3',className].join(' ')}>{children}</div> }
export function CardTitle({className='', children}){ return <div className={['font-semibold',className].join(' ')}>{children}</div> }
export function CardContent({className='', children}){ return <div className={['px-4 pb-4',className].join(' ')}>{children}</div> }
