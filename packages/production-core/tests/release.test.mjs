import test from "node:test";
import assert from "node:assert/strict";

test("production release gate blocks failed checks", async () => {
  const source = await import("../src/index.ts");
  assert.throws(() => source.validateRelease({version:"1.0.0",commitSha:"abc",gates:[{gate:"typecheck",passed:false,message:"failed"}]}));
});

test("production readiness reports failed gates", async () => {
  const source = await import("../src/index.ts");
  const result = source.readiness([{gate:"smoke",passed:true,message:"ok"},{gate:"security",passed:false,message:"blocked"}]);
  assert.equal(result.ready,false);
  assert.equal(result.failed.length,1);
});
