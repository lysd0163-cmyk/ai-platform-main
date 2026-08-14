export type PackageType="agent"|"plugin"|"template"|"theme"|"workflow"|"integration"|"model";
export interface MarketplacePackage { id:string; name:string; version:string; type:PackageType; publisherId:string; permissions:string[]; priceCents:number; }
export interface PackageRepository { publish(pkg:MarketplacePackage):Promise<void>; get(id:string,version?:string):Promise<MarketplacePackage|undefined>; }
export class InMemoryMarketplace implements PackageRepository { private readonly items=new Map<string,MarketplacePackage>(); async publish(pkg:MarketplacePackage){this.items.set(`${pkg.id}@${pkg.version}`,pkg);} async get(id:string,version?:string){return [...this.items.values()].find(x=>x.id===id && (!version||x.version===version));} }
export interface PluginManifest { id:string; name:string; version:string; entrypoint:string; permissions:string[]; }
export function validateManifest(m:PluginManifest){ if(!/^[a-z0-9._-]+$/.test(m.id)) throw new Error("Invalid plugin id"); if(!m.entrypoint) throw new Error("Plugin entrypoint required"); if(m.permissions.includes("root")) throw new Error("root permission is forbidden"); }
