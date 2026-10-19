import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('failed correction preserves both previously reviewed trace files',()=>{
 const root=new URL('../',import.meta.url).pathname;
 const result=spawnSync('python3',['-c',`
import sys,json,tempfile,pathlib
sys.path.insert(0,sys.argv[1]+'/scripts')
from reviewed_trace_output import publish_reviewed_traces
root=pathlib.Path(sys.argv[1])
with tempfile.TemporaryDirectory() as td:
 target=pathlib.Path(td)
 visual=(root/'data/el-durazno/visual-trails.json').read_bytes()
 dense=(root/'data/el-durazno/centerline-samples.json').read_bytes()
 (target/'visual-trails.json').write_bytes(visual)
 (target/'centerline-samples.json').write_bytes(dense)
 config=json.loads((root/'data/el-durazno/visual-corrections.json').read_text());config['sourceSha256']='0'*64
 (target/'visual-corrections.json').write_text(json.dumps(config))
 generated=json.loads(visual);generated['segments']=[s for s in generated['segments'] if s['id']!='la-virgen-s05'];generated.pop('visualReviews',None)
 generated_dense=json.loads(dense);generated_dense['fragments']=[s for s in generated_dense['fragments'] if s['segmentId']!='la-virgen-s05']
 try:
  publish_reviewed_traces(generated,generated_dense,target,root/'scripts/apply-visual-corrections.py')
 except Exception:pass
 else:raise AssertionError('A mismatched source must reject publication')
 assert (target/'visual-trails.json').read_bytes()==visual,'reviewed geometry was overwritten before rejection'
 assert (target/'centerline-samples.json').read_bytes()==dense,'reviewed samples were overwritten before rejection'
`,root],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});
