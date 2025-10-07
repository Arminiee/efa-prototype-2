import React, {useState, useContext, createContext} from 'react'
const Ctx = createContext(null)
export function Select({value, onValueChange, children}){
  const [open, setOpen] = useState(false)
  return <Ctx.Provider value={{value, onValueChange, open, setOpen}}>{children}</Ctx.Provider>
}
export function SelectTrigger({className='', children}){
  const {setOpen} = useContext(Ctx);
  return <button type="button" onClick={()=>setOpen(o=>!o)} className={['border rounded-2xl px-3 py-2 text-sm bg-white w-full text-left',className].join(' ')}>{children}</button>
}
export function SelectValue({placeholder}){
  const {value} = useContext(Ctx);
  return <span>{value || placeholder}</span>
}
export function SelectContent({className='', children}){
  const {open,setOpen} = useContext(Ctx);
  if(!open) return null;
  return <div className={['mt-1 border rounded-2xl bg-white shadow p-1',className].join(' ')} onMouseLeave={()=>setOpen(false)}>{children}</div>
}
export function SelectItem({value, children}){
  const {onValueChange,setOpen} = useContext(Ctx);
  return <div className='px-3 py-2 text-sm rounded-xl hover:bg-neutral-100 cursor-pointer' onClick={()=>{onValueChange && onValueChange(value); setOpen(false)}}>{children}</div>
}
