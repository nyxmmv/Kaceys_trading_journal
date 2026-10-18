'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,AlertCircle,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
type Message={kind:'success'|'error';text:string};
function send(kind:Message['kind'],text:string){window.dispatchEvent(new CustomEvent<Message>('journal-message',{detail:{kind,text}}))}
export const toast={success:(text:string)=>send('success',text),error:(text:string)=>send('error',text)};
export function Feedback(){const[message,setMessage]=useState<Message|null>(null);useEffect(()=>{const receive=(event:Event)=>setMessage((event as CustomEvent<Message>).detail);window.addEventListener('journal-message',receive);return()=>window.removeEventListener('journal-message',receive)},[]);return message?<div className={'feedback '+message.kind} role={message.kind==='error'?'alert':'status'}>{message.kind==='error'?<AlertCircle aria-hidden="true"/>:<CheckCircle2 aria-hidden="true"/>}<p>{message.text}</p><Button variant="ghost" size="icon" onClick={()=>setMessage(null)} aria-label="Dismiss message"><X/></Button></div>:null}
