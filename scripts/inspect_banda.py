"""Inspect Blender state and optionally render each musician from three angles.

blender --background assets/avatares/terrasonic-banda.blend --threads 4
    --python scripts/inspect_banda.py -- --output _work/models/before --render
Does not save or mutate the input file on disk.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def bounds(objects, evaluated=False):
    points = []
    graph = bpy.context.evaluated_depsgraph_get()
    for obj in objects:
        if obj.type != "MESH":
            continue
        current = obj.evaluated_get(graph) if evaluated else obj
        if evaluated:
            mesh = current.to_mesh()
            points.extend(current.matrix_world @ vertex.co for vertex in mesh.vertices)
            current.to_mesh_clear()
        else:
            points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return None
    low = [min(point[axis] for point in points) for axis in range(3)]
    high = [max(point[axis] for point in points) for axis in range(3)]
    return {"min": low, "max": high, "size": [b - a for a, b in zip(low, high)]}


def select_action(rig, clip):
    data = rig.animation_data
    for track in data.nla_tracks:
        track.mute = track.name != clip
    data.action = None


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--render", action="store_true")
    parser.add_argument("--fallbacks", action="store_true")
    parser.add_argument("--motion-renders", action="store_true")
    options = parser.parse_args(args)
    if not options.output.is_absolute():
        options.output = Path(__file__).resolve().parents[1] / options.output
    options.output = options.output.resolve()
    options.output.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    rigs = [obj for obj in scene.objects if obj.type == "ARMATURE"]
    report = {
        "blender": bpy.app.version_string,
        "file": bpy.data.filepath,
        "axes": {"up": "+Z", "front": "-Y"},
        "objects": [{"name": obj.name, "type": obj.type,
                     "parent": obj.parent.name if obj.parent else None,
                     "scale": list(obj.scale)} for obj in scene.objects],
        "characters": [],
    }
    for rig in rigs:
        members = [obj for obj in rig.children_recursive if obj.type == "MESH"]
        meshes = [obj.data for obj in members]
        issues = []
        for obj in members:
            if any(sum(group.weight for group in vertex.groups) < .99
                   for vertex in obj.data.vertices):
                issues.append(obj.name + ": unweighted or partially weighted vertices")
        entry = {
            "rig": rig.name, "key": rig.get("character", rig.name.split(" · ")[0]),
            "bounds": bounds(members),
            "vertices": sum(len(mesh.vertices) for mesh in meshes),
            "triangles": sum(sum(len(face.vertices) - 2 for face in mesh.polygons) for mesh in meshes),
            "materials": sorted({slot.material.name for obj in members
                                 for slot in obj.material_slots if slot.material}),
            "bones": [{"name": bone.name, "head": list(bone.head_local),
                       "tail": list(bone.tail_local),
                       "parent": bone.parent.name if bone.parent else None}
                      for bone in rig.data.bones],
            "issues": issues, "clips": [],
        }
        for track in rig.animation_data.nla_tracks:
            select_action(rig, track.name)
            end = int(max(strip.frame_end for strip in track.strips))
            samples = []
            for frame in sorted({0, 1, end // 4, end // 2, 3 * end // 4, end}):
                scene.frame_set(frame)
                samples.append({"frame": frame, "bounds": bounds(members, True),
                                "feet": {bone.name: list(rig.matrix_world @ bone.head)
                                         for bone in rig.pose.bones if bone.name.startswith("Pie.")}})
            entry["clips"].append({"name": track.name, "end": end, "samples": samples})
        select_action(rig, "Idle")
        scene.frame_set(0)
        report["characters"].append(entry)
    (options.output / "state.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    if not (options.render or options.fallbacks or options.motion_renders):
        return
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 360
    scene.render.resolution_y = 460
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("Audit World")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.065, .075, .10, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .5
    camera = bpy.data.objects.new("Audit Camera", bpy.data.cameras.new("Audit Camera"))
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.type = "ORTHO"
    for position, power, size in [((-4, -5, 7), 850, 5), ((4, 1, 5), 1000, 4)]:
        light = bpy.data.objects.new("Audit Light", bpy.data.lights.new("Audit Light", "AREA"))
        scene.collection.objects.link(light)
        light.location = position
        light.data.energy, light.data.shape, light.data.size = power, "DISK", size
        light.rotation_euler = (Vector((0, 0, 1.4)) - light.location).to_track_quat("-Z", "Y").to_euler()
    for obj in scene.objects:
        if obj.type == "MESH":
            obj.hide_render = True
    for rig, entry in zip(rigs, report["characters"]):
        objects = [obj for obj in rig.children_recursive if obj.type == "MESH"]
        for obj in objects:
            obj.hide_render = False
        base = entry["bounds"]
        center = Vector([(a + b) / 2 for a, b in zip(base["min"], base["max"])])
        camera.data.ortho_scale = max(base["size"][2] * 1.15, base["size"][0] * 1.5)
        views = [("front", 0), ("profile", math.pi / 2), ("rear", math.pi)] if options.render else []
        for label, angle in views:
            camera.location = center + Vector((math.sin(angle) * 7, -math.cos(angle) * 7, .22))
            camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
            scene.render.filepath = str(options.output / f"{entry['key']}-{label}.png")
            bpy.ops.render.render(write_still=True)
        if options.motion_renders:
            camera.location = center + Vector((1.2, -7, .22))
            camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
            for clip, frame in [("Play", 12), ("Play", 24), ("Walk", 12), ("Walk", 36)]:
                select_action(rig, clip)
                scene.frame_set(frame)
                scene.render.filepath = str(options.output / f"{entry['key']}-{clip}-{frame}.png")
                bpy.ops.render.render(write_still=True)
            select_action(rig, "Idle")
            scene.frame_set(0)
        if options.fallbacks:
            destination = Path(__file__).resolve().parents[1] / "prototipos/I11-eic/sprites" / entry["key"]
            destination.mkdir(exist_ok=True)
            scene.render.film_transparent = True
            scene.render.image_settings.file_format = "WEBP"
            scene.render.image_settings.quality = 95
            camera.location = center + Vector((.8, -7, .22))
            camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
            scene.render.filepath = str(destination / "pose-volume.webp")
            bpy.ops.render.render(write_still=True)
            head = rig.matrix_world @ Vector((rig.get("faceX", 0), 0, rig.get("faceY", 2.16)))
            camera.data.ortho_scale = .78
            camera.location = head + Vector((.12, -6, .09))
            camera.rotation_euler = (head - camera.location).to_track_quat("-Z", "Y").to_euler()
            scene.render.resolution_x, scene.render.resolution_y = 256, 256
            scene.render.filepath = str(destination / "face-volume.webp")
            bpy.ops.render.render(write_still=True)
            scene.render.resolution_x, scene.render.resolution_y = 360, 460
            scene.render.film_transparent = False
            scene.render.image_settings.file_format = "PNG"
        for obj in objects:
            obj.hide_render = True
    print("AUDIT COMPLETE", options.output, flush=True)


if __name__ == "__main__":
    main()
