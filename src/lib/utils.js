export function resolveImage(p){
  try{
    if(typeof p.image === 'string' && p.image.startsWith('/assets/')){
      return { ...p, image: new URL('/jwellery/src' + p.image, import.meta.url).href }
    }
  }catch(e){}
  return p
}