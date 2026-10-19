"""Publish extracted traces after applying the reviewed photo corrections."""
import json,subprocess,sys,tempfile,shutil
from pathlib import Path

def publish_reviewed_traces(data,dense,target_dir,correction_script):
 with tempfile.TemporaryDirectory(prefix='mapas-gps-reviewed-traces-') as td:
  staged=Path(td)
  (staged/'visual-trails.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
  (staged/'centerline-samples.json').write_text(json.dumps(dense,separators=(',',':'))+'\n')
  shutil.copyfile(target_dir/'visual-corrections.json',staged/'visual-corrections.json')
  subprocess.run([sys.executable,str(correction_script),'--data-dir',str(staged)],check=True,capture_output=True)
  result={name:(staged/name).read_bytes() for name in ['visual-trails.json','centerline-samples.json']}
  for name,raw in result.items():(target_dir/name).write_bytes(raw)
