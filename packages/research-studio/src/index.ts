export interface Source { id:string; title:string; url:string; publishedAt?:string; content:string; }
export interface ResearchRequest { query:string; maxSources:number; requireCitations:boolean; }
export interface ResearchReport { query:string; summary:string; sources:Source[]; claims:Array<{claim:string;sourceIds:string[]}>; uncertainties:string[]; }
export interface SearchProvider { search(query:string, limit:number):Promise<Source[]>; }
export type MediaKind="image"|"audio"|"video"|"music"|"3d"|"document";
export interface MediaJob { id:string; kind:MediaKind; prompt:string; status:"queued"|"running"|"completed"|"failed"; outputUrl?:string; }
export interface MediaProvider { generate(job:MediaJob):Promise<MediaJob>; }

export async function runResearch(req:ResearchRequest, provider:SearchProvider):Promise<ResearchReport>{
  const sources=await provider.search(req.query, Math.min(Math.max(req.maxSources,1),100));
  const claims=sources.slice(0,20).map(source=>({claim:source.title,sourceIds:[source.id]}));
  return {query:req.query,summary:sources.length?`Collected ${sources.length} sources for analysis.`:"No sources found.",sources,claims,uncertainties:sources.length?[]:["No source evidence was returned."]};
}
