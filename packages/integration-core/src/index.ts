export interface IntegrationContext { projectId:string; userId:string; credentialsRef?:string; }
export interface Integration { id:string; name:string; kind:"rest"|"webhook"|"oauth"|"custom"; permissions:string[]; execute(input:unknown,ctx:IntegrationContext):Promise<unknown>; }
export class IntegrationRegistry { private readonly items=new Map<string,Integration>(); register(i:Integration){if(this.items.has(i.id)) throw new Error(`Integration already registered: ${i.id}`);this.items.set(i.id,i);} get(id:string){return this.items.get(id);} list(){return [...this.items.values()];} }
export interface WebhookEvent { id:string; integrationId:string; timestamp:string; payload:unknown; signature?:string; }
