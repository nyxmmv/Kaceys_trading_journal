'use client';
import {createContext,useContext,useRef,useState} from 'react';
import {Dialog} from 'radix-ui';
import {Button} from '@/components/ui/button';
import {AlertTriangle} from 'lucide-react';
type Request={name:string;consequence:string;action?:string};
const Context=createContext<(request:Request)=>Promise<boolean>>(async()=>false);
export const useConfirmation=()=>useContext(Context);
export function ConfirmationProvider({children}:{children:React.ReactNode}){
 const[request,setRequest]=useState<Request|null>(null),[step,setStep]=useState(1);const resolve=useRef<((answer:boolean)=>void)|null>(null),safe=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLElement|null>(null);
 function finish(answer:boolean){setRequest(null);resolve.current?.(answer);resolve.current=null;queueMicrotask(()=>trigger.current?.isConnected&&trigger.current.focus())}
 async function ask(next:Request){if(resolve.current)return false;trigger.current=document.activeElement as HTMLElement;setRequest(next);setStep(1);return new Promise<boolean>(done=>{resolve.current=done})}
 return <Context.Provider value={ask}>{children}<Dialog.Root open={!!request} onOpenChange={open=>{if(!open)finish(false)}}><Dialog.Portal><Dialog.Overlay className="confirmation-viewport"><Dialog.Content className="confirmation-panel panel" onOpenAutoFocus={event=>{event.preventDefault();safe.current?.focus()}} onCloseAutoFocus={event=>{event.preventDefault();queueMicrotask(()=>trigger.current?.isConnected&&trigger.current.focus())}} aria-describedby="confirmation-description"><AlertTriangle aria-hidden="true"/><Dialog.Title>{step===1?'Confirm action':'Final confirmation'}: {request?.name}</Dialog.Title><Dialog.Description id="confirmation-description">{request?.consequence}</Dialog.Description><p className="hint">Step {step} of 2. {step===2?'This action cannot be undone.':''}</p><div className="confirmation-actions"><Button ref={safe} variant="outline" onClick={()=>finish(false)}>Keep it</Button>{step===1?<Button variant="outline" onClick={()=>{setStep(2);queueMicrotask(()=>safe.current?.focus())}}>Continue to final confirmation</Button>:<Button variant="destructive" onClick={()=>finish(true)}>{request?.action||'Delete permanently'}</Button>}</div></Dialog.Content></Dialog.Overlay></Dialog.Portal></Dialog.Root></Context.Provider>
}
