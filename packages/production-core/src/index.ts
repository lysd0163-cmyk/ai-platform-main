export type Gate="typecheck"|"unit"|"security"|"config"|"migration"|"smoke";
export interface GateResult { gate:Gate; passed:boolean; message:string; }
export interface ReleaseCandidate { version:string; commitSha:string; gates:GateResult[]; }
export function validateRelease(rc:ReleaseCandidate):void { if(!rc.version||!rc.commitSha) throw new Error("Release candidate requires version and commitSha"); const failed=rc.gates.filter(g=>!g.passed); if(failed.length) throw new Error(`Release blocked by ${failed.length} gate(s)`); }
export function readiness(gates:GateResult[]):{ready:boolean;failed:GateResult[]}{const failed=gates.filter(g=>!g.passed);return {ready:failed.length===0,failed};}
