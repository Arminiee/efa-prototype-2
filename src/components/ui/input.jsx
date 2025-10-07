import React from 'react'
export function Input(props){ return <input {...props} className={['w-full border rounded-2xl px-3 py-2 text-sm bg-white', props.className||''].join(' ')} /> }
