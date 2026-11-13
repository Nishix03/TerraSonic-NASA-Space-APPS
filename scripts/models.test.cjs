const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../prototipos/I11-eic");
const keys = ["silbo", "inti", "mama", "yaku", "illapa"];
const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const formats = { 5121: [1, "readUInt8", 255], 5123: [2, "readUInt16LE", 65535],
  5125: [4, "readUInt32LE", 4294967295], 5126: [4, "readFloatLE", 1] };

function readModel(key) {
  const file = fs.readFileSync(path.join(root, "modelos", key + ".glb"));
  assert.equal(file.toString("ascii", 0, 4), "glTF");
  assert.equal(file.readUInt32LE(4), 2);
  assert.equal(file.length, file.readUInt32LE(8));
  const jsonLength = file.readUInt32LE(12);
  const data = JSON.parse(file.toString("utf8", 20, 20 + jsonLength));
  const binary = file.subarray(20 + jsonLength + 8);
  function accessor(index) {
    const attribute = data.accessors[index], view = data.bufferViews[attribute.bufferView];
    const [bytes, method, divisor] = formats[attribute.componentType];
    const size = components[attribute.type], stride = view.byteStride || size * bytes;
    const start = (view.byteOffset || 0) + (attribute.byteOffset || 0);
    return Array.from({ length: attribute.count }, (_, item) =>
      Array.from({ length: size }, (_, channel) => {
        const value = binary[method](start + item * stride + channel * bytes);
        return attribute.normalized ? value / divisor : value;
      }));
  }
  return { data, accessor, file };
}

for (const key of keys) {
  test(key + " has bounded complete skinned geometry and five finite clips", () => {
    const { data, accessor, file } = readModel(key);
    assert(file.length < 1024 * 1024, "Each model should stay below 1 MiB");
    const primitives = data.meshes.flatMap(mesh => mesh.primitives);
    assert.equal(primitives.length, 1, "The palette should need one draw call per character");
    const geometry = primitives[0];
    const positions = accessor(geometry.attributes.POSITION);
    assert(positions.every(vertex => vertex.every(Number.isFinite)));
    const minimum = [0, 1, 2].map(axis => Math.min(...positions.map(vertex => vertex[axis])));
    const maximum = [0, 1, 2].map(axis => Math.max(...positions.map(vertex => vertex[axis])));
    const size = maximum.map((value, axis) => value - minimum[axis]);
    assert(size[1] > 1.5 && size[1] < 3.2, "glTF Y is the character height in meters");
    assert(size[2] / size[1] > .12, "The body and instrument should have real depth");
    assert(Math.abs(minimum[1]) < .02, "Neutral feet should be on the ground");
    assert(data.skins[0].joints.length >= 17);
    // Khronos warns about non-root skinned meshes. Their exported container
    // must stay identity; motion belongs to the skeleton rather than its parent.
    const parents=new Map();data.nodes.forEach((node,index)=>(node.children||[]).forEach(child=>parents.set(child,index)));
    for(const [index,node]of data.nodes.entries())if(node.skin!==undefined){
      for(let parent=parents.get(index);parent!==undefined;parent=parents.get(parent)){
        const ancestor=data.nodes[parent];
        for(const [field,identity]of [['translation',[0,0,0]],['rotation',[0,0,0,1]],['scale',[1,1,1]],['matrix',[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]]])if(ancestor[field])assert(ancestor[field].every((value,i)=>Math.abs(value-identity[i])<1e-7),'The skin container must not introduce unsupported parent transforms');
      }
    }
    const weights = accessor(geometry.attributes.WEIGHTS_0);
    assert(weights.every(row => Math.abs(row.reduce((a, b) => a + b) - 1) < .002));
    const joints = accessor(geometry.attributes.JOINTS_0);
    assert(joints.every(row => row.every(id => id < data.skins[0].joints.length)));
    const clips = new Set(data.animations.map(clip => clip.name));
    for (const name of ["Idle", "Play", "Walk", "Dance", "Speak"]) assert(clips.has(name));
    for (const clip of data.animations) {
      for (const sampler of clip.samplers) {
        const times = accessor(sampler.input).flat();
        assert(times.every(Number.isFinite) && times.at(-1) > 0);
        assert(times.every((time, index) => index === 0 || time > times[index - 1]));
        assert(accessor(sampler.output).flat().every(Number.isFinite));
      }
    }
    assert(data.images.every(image => image.bufferView !== undefined),
      "Textures must travel inside the GLB, with no external path dependency");
    assert(data.nodes.some(node => Number.isFinite(node.extras?.faceY)));
    for (const kind of ["pose", "face"]) {
      const image = fs.readFileSync(path.join(root, "sprites", key, kind + "-volume.webp"));
      assert.equal(image.toString("ascii", 0, 4), "RIFF");
      assert.equal(image.toString("ascii", 8, 12), "WEBP");
      assert(image.length > 1000 && image.length < 100000);
    }
  });
}
