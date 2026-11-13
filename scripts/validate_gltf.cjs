// Run Khronos' official validator locally; no assets are uploaded.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const tool=process.env.TERRASONIC_GLTF_VALIDATOR;assert(tool,'Set TERRASONIC_GLTF_VALIDATOR to the pinned local gltf-validator package');
const validator=require(tool),folder=path.resolve(process.argv[2]||'prototipos/I11-eic/modelos'),output=path.resolve(process.argv[3]||'_work/models/gltf-validation');
async function main(){
 fs.mkdirSync(output,{recursive:true});const summary={tool:'Khronos glTF Validator',version:require(path.join(tool,'package.json')).version,assetDirectory:folder,models:[]};
 for(const name of fs.readdirSync(folder).filter(name=>name.endsWith('.glb')).sort()){
  const bytes=fs.readFileSync(path.join(folder,name));
  const report=await validator.validateBytes(new Uint8Array(bytes),{uri:name,maxIssues:10000,externalResourceFunction:()=>Promise.reject(Error('The distributed GLB must be self-contained'))});
  fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify(report,null,2));summary.models.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),errors:report.issues.numErrors,warnings:report.issues.numWarnings,infos:report.issues.numInfos,hints:report.issues.numHints,truncated:report.issues.truncated});
  console.log(name,JSON.stringify(summary.models.at(-1)));
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(summary,null,2));assert.equal(summary.models.length,5);assert(summary.models.every(model=>model.errors===0),'Every distributed model must have zero glTF validation errors');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
