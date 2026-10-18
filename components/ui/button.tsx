import * as React from 'react';
import {cva,type VariantProps} from 'class-variance-authority';
import {Slot} from 'radix-ui';
import {cn} from '@/lib/utils';
const buttonVariants=cva('button',{variants:{variant:{default:'button-primary',destructive:'button-destructive',outline:'button-outline',secondary:'button-secondary',ghost:'button-ghost',link:'button-link'},size:{default:'',xs:'',sm:'',lg:'button-large',icon:'button-icon','icon-xs':'button-icon','icon-sm':'button-icon','icon-lg':'button-icon'}},defaultVariants:{variant:'default',size:'default'}});
function Button({className,variant='default',size='default',asChild=false,...props}:React.ComponentProps<'button'>&VariantProps<typeof buttonVariants>&{asChild?:boolean}){const Comp=asChild?Slot.Root:'button';return <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({variant,size,className}))} {...props}/>}
export{Button,buttonVariants};
