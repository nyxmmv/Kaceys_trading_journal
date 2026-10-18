import fs from 'node:fs';
import assert from 'node:assert/strict';
const css=fs.readFileSync('app/globals.css','utf8');
const source=['app/page.tsx','components/journal/editors.tsx','components/journal/fields.tsx','components/journal/charts.tsx','components/journal/importer.tsx','components/journal/confirmation.tsx','components/journal/feedback.tsx'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
assert(!css.includes('!important'));assert(!/margin[^;{}]*:\s*-/.test(css));assert(!/\b\d+(?:\.\d+)?vh\b/.test(css));assert(!/\bheight\s*:\s*\d+px/.test(css));assert(!source.includes('confirm('));assert(!source.includes('prompt('));assert(!source.includes('Toaster'));
for(const media of ['prefers-color-scheme','prefers-reduced-motion','prefers-contrast','prefers-reduced-transparency','forced-colors'])assert(css.includes(media));
for(const mark of ['Skip to content','Step','Delete permanently','aria-current','aria-labelledby','data-label'])assert(source.includes(mark));
assert(css.includes('corner-shape: superellipse(2)'));assert(css.includes('--squircle-mask'));assert(css.includes('--radius-s'));assert(css.includes('min-block-size: var(--touch)'));
const lightBlock=css.match(/:root\s*\{([\s\S]*?)\n\}/)[1],darkBlock=css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)[1];
const parse=block=>Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const light=parse(lightBlock),dark={...light,...parse(darkBlock)};
function resolve(tokens,key){const value=tokens[key];const alias=value.match(/^var\(--([\w-]+)\)$/);return alias?resolve(tokens,alias[1]):value}
function lum(hex){const parts=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*parts[0]+.7152*parts[1]+.0722*parts[2]}
function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
let minText=Infinity,minBoundary=Infinity;
for(const [name,tokens] of [['light',light],['dark',dark]]){
 const textPairs=[...['background','card','secondary','muted','accent','popover'].flatMap(bg=>[['foreground',bg],['muted-foreground',bg]]),['success','success-bg'],['loss','loss-bg'],['primary-foreground','primary'],['destructive-foreground','destructive']];
 for(const [fg,bg] of textPairs){const value=contrast(resolve(tokens,fg),resolve(tokens,bg));minText=Math.min(minText,value);assert(value>=4.5,`${name} ${fg}/${bg}: ${value}`)}
 for(const border of ['border','input','ring'])for(const bg of ['background','card','secondary','muted','accent']){const value=contrast(resolve(tokens,border),resolve(tokens,bg));minBoundary=Math.min(minBoundary,value);assert(value>=3,`${name} ${border}/${bg}: ${value}`)}
}
// Geometry checks for the actual fluid grid formulas. These are not browser rendering tests.
const widths=[320,375,768,1024,1440,1920];
for(const scale of [1,2,2.5])for(const width of widths){const rem=16*scale,padding=width>=48*rem?2*rem:rem,available=width-2*padding;assert(available>0);for(const desired of [14*rem,20*rem]){const minimum=Math.min(available,desired);assert(minimum<=available)}const inner=available-3*rem;assert(inner>0);const target=2.75*rem;const columns=Math.max(1,Math.floor((inner+.5*rem)/(target+.5*rem)));assert(columns*target+(columns-1)*.5*rem<=inner,`${width}/${scale} calendar geometry`)}
console.log(`Design source checks passed. Token contrast: text minimum ${minText.toFixed(2)}:1, boundaries/focus ${minBoundary.toFixed(2)}:1. Fluid-grid geometry checked at ${widths.join(', ')}px and 100%, 200%, 250% text. Browser rendering is unverified.`);
