"""Build the five articulated TerraSonic characters with complete 3D volumes.

Run with Blender 5.2+:
  blender --background --factory-startup --threads 4 --python scripts/modelar_banda.py
The pre-existing illustrations remain in sprites/ as the team's source references.
All geometry and the small material atlas are constructed here, without downloads.
"""
import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "prototipos" / "I11-eic"
PALETTE = {
    "skin": ("B57C56", .72, 0), "skinLight": ("D2996F", .73, 0),
    "skinDeep": ("81553F", .76, 0), "shadow": ("372F35", .86, 0),
    "eye": ("FBEEE0", .45, 0), "iris": ("46382F", .48, 0),
    "gold": ("E8B954", .38, .65), "clay": ("A94F2F", .84, 0),
    "ochre": ("B87536", .85, 0), "cream": ("E8D8B1", .88, 0),
    "straw": ("CAB376", .93, 0), "dark": ("202C3D", .85, 0),
    "silver": ("C7D8DE", .45, .4), "white": ("E7E3D9", .8, 0),
    "orange": ("D75636", .8, 0), "red": ("8B3730", .83, 0),
    "blue": ("295F87", .82, 0), "cyan": ("58B8C3", .66, .08),
    "navy": ("203C5C", .88, 0), "sea": ("2E727F", .77, 0),
    "foam": ("B8DAD1", .78, 0), "green": ("5C9561", .84, 0),
    "leaf": ("94B16B", .9, 0), "water": ("76C4CF", .35, .05),
    "violet": ("3E3456", .87, 0), "magenta": ("B55383", .75, 0),
    "wood": ("6C432C", .9, 0), "woodLight": ("A77945", .86, 0),
    "drum": ("CBBB96", .9, 0), "rope": ("D4B98C", .9, 0),
    "glass": ("A6DAD1", .28, .12), "black": ("17212C", .7, 0),
}
CAST = {
    "silbo": {"name": "Silbo", "scale": 1.0, "coat": "ochre", "accent": "gold",
              "hair": "silver", "skin": "skin", "instrument": "quena y botella silbadora"},
    "inti": {"name": "Inti", "scale": .94, "coat": "orange", "accent": "gold",
             "hair": "shadow", "skin": "skinDeep", "instrument": "marimba y dos mazos"},
    "mama": {"name": "Mamacocha", "scale": 1.03, "coat": "sea", "accent": "cyan",
             "hair": "navy", "skin": "skin", "instrument": "arpa de fibras (ficción artística)"},
    "yaku": {"name": "Yaku", "scale": .79, "coat": "green", "accent": "leaf",
             "hair": "shadow", "skin": "skinLight", "instrument": "tres botellas afinadas"},
    "illapa": {"name": "Illapa", "scale": 1.08, "coat": "violet", "accent": "magenta",
               "hair": "shadow", "skin": "skinDeep", "instrument": "bombo y baqueta"},
}
CLIPS = {"Idle": 72, "Play": 48, "Walk": 48, "Dance": 72, "Speak": 60}


def linear(value):
    return value / 12.92 if value < .04045 else ((value + .055) / 1.055) ** 2.4


def make_atlas():
    """One padded palette texture and one packed metallic/roughness image per cast."""
    colors = bpy.data.images.new("TerraSonic palette sRGB", width=64, height=32, alpha=True)
    surface = bpy.data.images.new("TerraSonic metallic roughness", width=64, height=32, alpha=False)
    surface.colorspace_settings.name = "Non-Color"
    pixels, properties = [], []
    entries = list(PALETTE.values())
    for y in range(32):
        for x in range(64):
            color, roughness, metal = entries[(y // 8) * 8 + x // 8]
            rgb = [int(color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
            pixels.extend([linear(value) for value in rgb] + [1])
            properties.extend([1, roughness, metal, 1])
    colors.pixels.foreach_set(pixels)
    surface.pixels.foreach_set(properties)
    for image in (colors, surface):
        image.pack()
    material = bpy.data.materials.new("TerraSonic · palette PBR")
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    for image, name in ((colors, "Base Color"), (surface, "surface")):
        texture = material.node_tree.nodes.new("ShaderNodeTexImage")
        texture.image, texture.interpolation = image, "Closest"
        if name == "Base Color":
            material.node_tree.links.new(texture.outputs["Color"], shader.inputs[name])
        else:
            separate = material.node_tree.nodes.new("ShaderNodeSeparateColor")
            material.node_tree.links.new(texture.outputs["Color"], separate.inputs[0])
            material.node_tree.links.new(separate.outputs["Green"], shader.inputs["Roughness"])
            material.node_tree.links.new(separate.outputs["Blue"], shader.inputs["Metallic"])
    return material


class Character:
    def __init__(self, key, spec, atlas):
        self.key, self.spec, self.atlas = key, spec, atlas
        self.parts = []
        self.collection = bpy.data.collections.new(spec["name"])
        bpy.context.scene.collection.children.link(self.collection)
        self.bones = {
            "Raíz": ((0, 0, 0), (0, 0, .2), None),
            "Cadera": ((0, 0, 1.08), (0, 0, 1.38), "Raíz"),
            "Torso": ((0, 0, 1.38), (0, 0, 1.91), "Cadera"),
            "Cabeza": ((0, 0, 1.91), (0, 0, 2.44), "Torso"),
            "Instrumento": ((0, -.48, 1.15), (0, -.48, 1.55), "Torso"),
        }
        arms = {
            "silbo": ((.025, -.30, 1.84), (.10, -.38, 1.62)),
            "inti": ((-.28, -.47, 1.42), (.28, -.47, 1.42)),
            "mama": ((.12, -.44, 1.52), (.36, -.33, 1.78)),
            "yaku": ((-.30, -.45, 1.47), (.31, -.45, 1.48)),
            "illapa": ((-.40, -.41, 1.62), (.34, -.37, 1.28)),
        }
        for index, (side, sign) in enumerate((("L", -1), ("R", 1))):
            shoulder = (.30 * sign, 0, 1.80)
            elbow = (.43 * sign, -.17, 1.54)
            wrist = arms[key][index]
            hand = tuple(Vector(wrist) + Vector((0, -.06, -.055)))
            self.bones.update({
                "Brazo." + side: (shoulder, elbow, "Torso"),
                "Antebrazo." + side: (elbow, wrist, "Brazo." + side),
                "Mano." + side: (wrist, hand, "Antebrazo." + side),
                "Muslo." + side: ((.15 * sign, 0, 1.10), (.18 * sign, -.035, .61), "Cadera"),
                "Pierna." + side: ((.18 * sign, -.035, .61), (.19 * sign, 0, .18), "Muslo." + side),
                "Pie." + side: ((.19 * sign, 0, .18), (.19 * sign, -.19, .10), "Pierna." + side),
            })
        self.body()
        self.face()
        getattr(self, key)()
        self.rig()
        self.actions()

    def part(self, obj, name, color, bone):
        obj.name = self.spec["name"] + " · " + name
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for collection in list(obj.users_collection):
            collection.objects.unlink(obj)
        self.collection.objects.link(obj)
        if obj.type == "CURVE":
            obj.data.resolution_u = 1
            bpy.ops.object.convert(target="MESH")
            obj = bpy.context.object
        mesh = obj.data
        uv = mesh.uv_layers.active or mesh.uv_layers.new(name="Palette")
        uv.name = "Palette"
        index = list(PALETTE).index(color)
        coordinate = ((index % 8 + .5) / 8, (index // 8 + .5) / 4)
        for loop in uv.data:
            loop.uv = coordinate
        mesh.materials.clear()
        mesh.materials.append(self.atlas)
        for polygon in mesh.polygons:
            polygon.use_smooth = len(polygon.vertices) <= 4
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(mesh.vertices))), 1, "REPLACE")
        self.parts.append(obj)
        return obj

    def ellipsoid(self, name, position, scale, color, bone="Torso", segments=16, rings=10):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=position)
        obj = bpy.context.object
        obj.scale = scale
        return self.part(obj, name, color, bone)

    def box(self, name, position, size, color, bone="Torso", bevel=.025):
        bpy.ops.mesh.primitive_cube_add(size=1, location=position)
        obj = bpy.context.object
        obj.scale = size
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if bevel:
            mod = obj.modifiers.new("Soft edges", "BEVEL")
            mod.width, mod.segments = bevel, 2
            bpy.ops.object.modifier_apply(modifier=mod.name)
        return self.part(obj, name, color, bone)

    def tube(self, name, points, radius, color, bone="Torso", resolution=8):
        curve = bpy.data.curves.new(name, "CURVE")
        curve.dimensions = "3D"
        curve.resolution_u = 1
        curve.bevel_depth, curve.bevel_resolution = radius, 1
        spline = curve.splines.new("POLY")
        spline.points.add(len(points) - 1)
        for point, coordinates in zip(spline.points, points):
            point.co = (*coordinates, 1)
        obj = bpy.data.objects.new(name, curve)
        self.collection.objects.link(obj)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        return self.part(obj, name, color, bone)

    def rod(self, name, a, b, radius, color, bone="Torso", top=None):
        direction = Vector(b) - Vector(a)
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=radius,
                                       radius2=radius if top is None else top,
                                       depth=direction.length, location=(Vector(a) + Vector(b)) / 2)
        obj = bpy.context.object
        obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
        return self.part(obj, name, color, bone)

    def body(self):
        coat, accent, skin = (self.spec[key] for key in ("coat", "accent", "skin"))
        self.ellipsoid("Torso with shoulders", (0, .01, 1.61), (.30, .20, .36), coat)
        self.ellipsoid("Hips", (0, .015, 1.12), (.26, .18, .20), "dark", "Cadera")
        self.rod("Neck", (0, 0, 1.85), (0, 0, 2.02), .095, skin, "Cabeza")
        self.rod("Collar", (0, 0, 1.85), (0, 0, 1.91), .135, accent)
        for side in ("L", "R"):
            shoulder, elbow, _ = self.bones["Brazo." + side]
            _, wrist, _ = self.bones["Antebrazo." + side]
            _, hand, _ = self.bones["Mano." + side]
            self.ellipsoid("Shoulder " + side, shoulder, (.13, .14, .14), coat, "Brazo." + side)
            self.rod("Sleeve " + side, shoulder, elbow, .12, coat, "Brazo." + side, top=.095)
            self.ellipsoid("Elbow " + side, elbow, (.09, .09, .09), coat, "Antebrazo." + side)
            self.rod("Forearm " + side, elbow, wrist, .095, coat, "Antebrazo." + side, top=.065)
            self.ellipsoid("Cuff " + side, wrist, (.08, .08, .06), accent, "Mano." + side)
            self.ellipsoid("Palm " + side, hand, (.07, .048, .075), skin, "Mano." + side)
            for finger in range(3):
                a = Vector(hand) + Vector(((finger - 1) * .031, -.025, -.025))
                self.rod("Finger " + side, a, a + Vector((0, -.025, -.07)),
                         .017, skin, "Mano." + side)
            sign = -1 if side == "L" else 1
            self.ellipsoid("Thumb " + side, Vector(hand) + Vector((-.065 * sign, -.02, .005)),
                           (.025, .04, .04), skin, "Mano." + side, 12, 8)
            hip, knee, _ = self.bones["Muslo." + side]
            _, ankle, _ = self.bones["Pierna." + side]
            self.rod("Trousers " + side, knee, hip, .093, "navy", "Muslo." + side, top=.14)
            self.ellipsoid("Knee " + side, knee, (.095, .10, .10), "navy", "Pierna." + side)
            self.rod("Shin " + side, ankle, knee, .075, "navy", "Pierna." + side, top=.09)
            self.box("Foot sole " + side, (.19 * sign, -.055, .06), (.19, .34, .12),
                     "dark", "Pie." + side, .035)
            self.ellipsoid("Foot " + side, (.19 * sign, -.04, .15), (.092, .16, .12),
                           coat, "Pie." + side)
            self.tube("Shoe trim " + side, [(.19 * sign - .07, -.16, .16),
                      (.19 * sign, -.19, .17), (.19 * sign + .07, -.16, .16)], .013,
                      accent, "Pie." + side)

    def face(self):
        skin, hair = self.spec["skin"], self.spec["hair"]
        self.ellipsoid("Cranium", (0, 0, 2.15), (.225, .205, .285), skin, "Cabeza", 24, 16)
        self.ellipsoid("Jaw and cheeks", (0, -.07, 2.06), (.18, .17, .14), skin, "Cabeza")
        self.ellipsoid("Hair back", (0, .10, 2.20), (.238, .16, .26), hair, "Cabeza")
        self.ellipsoid("Hair crown", (0, .035, 2.39), (.225, .175, .09), hair, "Cabeza")
        for sign in (-1, 1):
            self.ellipsoid("Ear", (.223 * sign, .005, 2.14), (.048, .044, .075), skin, "Cabeza")
            self.ellipsoid("Ear hollow", (.245 * sign, -.024, 2.14), (.022, .016, .043), "clay", "Cabeza")
            eye_height = .033 if self.key in {"mama", "silbo"} else .044 if self.key == "yaku" else .04
            self.ellipsoid("Eye white", (.083 * sign, -.188, 2.18), (.063, .027, eye_height),
                           "eye", "Cabeza", 16, 8)
            self.ellipsoid("Iris", (.083 * sign, -.211, 2.18), (.030, .012, .031),
                           "iris", "Cabeza", 12, 8)
            self.ellipsoid("Pupil", (.083 * sign, -.221, 2.18), (.015, .006, .022),
                           "black", "Cabeza", 12, 8)
            self.ellipsoid("Eye glint", (.075 * sign, -.227, 2.192), (.007, .004, .008),
                           "white", "Cabeza", 8, 6)
            inner_brow = 2.23 if self.key == "illapa" else 2.245
            self.tube("Brow", [(.035 * sign, -.201, inner_brow), (.083 * sign, -.208, 2.256),
                              (.14 * sign, -.185, 2.245)], .018, hair, "Cabeza")
        self.ellipsoid("Nose bridge", (0, -.199, 2.13), (.035, .035, .065), skin, "Cabeza")
        self.ellipsoid("Nose tip", (0, -.236, 2.106), (.043, .035, .028), "skinLight", "Cabeza")
        self.tube("Mouth", [(-.055, -.207, 2.025), (0, -.222, 2.012), (.055, -.207, 2.025)],
                  .009, "shadow", "Cabeza")
        for sign in (-1, 1):
            self.ellipsoid("Swept hair", (.15 * sign, -.015, 2.37), (.10, .115, .06), hair, "Cabeza")

    def tunic(self, hem, color):
        # Closed, volumetric garment. Upper body moves with torso, hem follows hips.
        self.rod("Tunic skirt", (0, .015, hem), (0, .015, 1.43),
                 .35, color, "Cadera", top=.245)
        self.rod("Woven belt", (0, .015, 1.32), (0, .015, 1.39),
                 .273, self.spec["accent"], "Cadera", top=.269)
        for i in range(12):
            a = 2 * math.pi * i / 12
            x, y = math.sin(a) * .35, math.cos(a) * .35
            self.ellipsoid("Hem bead", (x, y + .015, hem + .025), (.022, .022, .027),
                           self.spec["accent"], "Cadera", 8, 6)

    def hat(self, crown_color, brim_color, brim=.43, height=.22):
        self.ellipsoid("Hat brim", (0, .01, 2.425), (brim, brim * .74, .045), brim_color, "Cabeza", 24, 8)
        self.rod("Hat crown", (0, .01, 2.43), (0, .01, 2.43 + height), .215,
                 crown_color, "Cabeza", top=.16)
        self.rod("Hat band", (0, .01, 2.46), (0, .01, 2.50), .212,
                 self.spec["accent"], "Cabeza", top=.20)
        for i in range(16):
            a = 2 * math.pi * i / 16
            self.tube("Brim weave", [(math.sin(a) * .235, math.cos(a) * .18 + .01, 2.445),
                      (math.sin(a) * brim * .94, math.cos(a) * brim * .70 + .01, 2.443)],
                      .006, "cream", "Cabeza")

    def silbo(self):
        self.tunic(.80, "ochre")
        self.box("Woven vest L", (-.17, -.17, 1.64), (.15, .055, .36), "dark")
        self.box("Woven vest R", (.17, -.17, 1.64), (.15, .055, .36), "dark")
        for sign in (-1, 1):
            self.ellipsoid("Gold ear spool", (.25 * sign, -.01, 2.105), (.057, .052, .075), "gold", "Cabeza")
            self.ellipsoid("Elder cheek", (.13 * sign, -.147, 2.08), (.065, .065, .06), "skin", "Cabeza")
            self.tube("Silver moustache", [(0, -.231, 2.06), (.06 * sign, -.232, 2.055),
                      (.087 * sign, -.21, 2.035)], .018, "silver", "Cabeza")
        self.ellipsoid("Short silver beard", (0, -.16, 1.99), (.09, .075, .08), "silver", "Cabeza")
        # Crescent contour is a new decorative interpretation, not a museum replica.
        vertices, faces = [], []
        for i in range(25):
            angle = math.pi + i * math.pi / 24
            for y in (-.02, .03):
                vertices.extend([(math.cos(angle) * .44, y, 2.68 + math.sin(angle) * .28),
                                 (math.cos(angle) * .38, y, 2.70 + math.sin(angle) * .15)])
        for i in range(24):
            a, b = 4 * i, 4 * (i + 1)
            faces.extend([(a, b, b + 1, a + 1), (a + 2, a + 3, b + 3, b + 2),
                          (a, a + 2, b + 2, b), (a + 1, b + 1, b + 3, a + 3)])
        faces.extend([(0, 1, 3, 2), (96, 98, 99, 97)])
        mesh = bpy.data.meshes.new("Crescent plate")
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new("Crescent plate", mesh)
        self.collection.objects.link(obj)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        self.part(obj, "Crescent plate", "gold", "Cabeza")
        for i in range(3):
            self.box("Stepped headdress center", (0, 0, 2.45 + i * .075),
                     (.22 - i * .055, .07, .085), "gold", "Cabeza", .008)
        for i in range(9):
            self.ellipsoid("Necklace bead", ((i - 4) * .045, -.225, 1.77 - .04 * math.cos((i - 4) / 4)),
                           (.023, .023, .023), "gold")
        self.rod("Quena", (0, -.25, 2.02), (.18, -.46, 1.35), .028, "woodLight", "Instrumento")
        for i in range(6):
            t = .22 + .10 * i
            self.ellipsoid("Quena finger hole", (.18 * t, -.275 - .21 * t, 2.02 - .67 * t),
                           (.012, .008, .015), "black", "Instrumento", 8, 6)
        self.ellipsoid("Whistling bottle vessel", (.31, -.17, 1.03), (.10, .09, .12),
                       "clay", "Cadera")
        self.tube("Bottle stirrup", [(.25, -.17, 1.11), (.25, -.17, 1.26),
                  (.35, -.17, 1.26), (.35, -.17, 1.11)], .016, "clay", "Cadera")
        self.rod("Bottle spout", (.30, -.17, 1.25), (.30, -.17, 1.32), .019, "clay", "Cadera")
        for i in range(5):
            self.box("Stepped tunic trim", ((i - 2) * .12, -.30, .93 + (.035 if i % 2 else 0)),
                     (.085, .035, .045), "cream", "Cadera", .005)

    def inti(self):
        self.hat("straw", "straw")
        self.box("Cotton shirt", (0, -.198, 1.65), (.25, .035, .35), "cream")
        for sign in (-1, 1):
            self.tube("Jacket opening", [(.14 * sign, -.211, 1.86), (.16 * sign, -.22, 1.40)],
                      .025, "gold")
            self.box("Cargo pocket", (.20 * sign, -.105, .96), (.14, .10, .17), "ochre", "Muslo." + ("L" if sign < 0 else "R"))
        # A small decorative sun medallion, separate from the toquilla reference.
        self.ellipsoid("Sun medallion", (0, -.18, 2.59), (.075, .025, .075), "gold", "Cabeza")
        for i in range(8):
            a = 2 * math.pi * i / 8
            self.rod("Sun ray", (.09 * math.sin(a), -.18, 2.59 + .09 * math.cos(a)),
                     (.13 * math.sin(a), -.18, 2.59 + .13 * math.cos(a)), .012, "gold", "Cabeza")
        self.box("Marimba frame", (0, -.58, 1.21), (.87, .32, .10), "wood", "Instrumento")
        for i in range(8):
            x = (i - 3.5) * .098
            self.box("Marimba key", (x, -.59, 1.28), (.084, .34 - i * .018, .045),
                     "woodLight" if i % 2 else "wood", "Instrumento", .008)
            self.rod("Bamboo resonator", (x, -.59, .90 + i * .015), (x, -.59, 1.17),
                     .032, "ochre", "Instrumento")
        for side in ("L", "R"):
            wrist = Vector(self.bones["Mano." + side][1])
            tip = wrist + Vector((0, -.07, -.12))
            self.rod("Marimba mallet " + side, wrist, tip, .013, "woodLight", "Mano." + side)
            self.ellipsoid("Mallet head " + side, tip, (.036, .036, .028), "cream", "Mano." + side, 12, 8)
        self.tube("Marimba strap", [(-.25, -.1, 1.85), (-.39, -.4, 1.31)], .018, "dark")
        self.tube("Marimba strap", [(.25, -.1, 1.85), (.39, -.4, 1.31)], .018, "dark")

    def mama(self):
        self.tunic(.55, "sea")
        for i in range(9):
            x = (i - 4) * .057
            self.ellipsoid("Hair wave", (x, .16 + .03 * math.cos(i), 1.93 - .13 * abs(i - 4) / 4),
                           (.10, .14, .50 + .03 * math.sin(i)), "navy" if i % 2 else "cyan", "Cabeza")
        for sign in (-1, 1):
            for i in range(5):
                self.ellipsoid("Braided strand", (.25 * sign, .02, 2.11 - i * .12),
                               (.045, .06, .08), "cyan" if i % 2 else "foam", "Cabeza", 12, 8)
            self.tube("Coat piping", [(.12 * sign, -.23, 1.85), (.21 * sign, -.25, 1.41)], .012, "foam")
        for row in range(3):
            points = [(x, -.29, .65 + row * .105 + .024 * math.sin(x * 26))
                      for x in [i * .025 for i in range(-11, 12)]]
            self.tube("Abstract wave border", points, .012, "cyan", "Cadera")
        a, b, c = (-.16, -.52, 1.02), (.40, -.44, 2.00), (.52, -.46, 1.08)
        self.tube("Harp frame", [a, b, c, a], .033, "straw", "Instrumento")
        for i in range(1, 9):
            t = i / 10
            start = Vector(a).lerp(Vector(b), t)
            stop = Vector(a).lerp(Vector(c), t)
            self.rod("Harp string", start, stop, .004, "cream", "Instrumento")
        self.ellipsoid("Harp soundbox", (.29, -.47, 1.07), (.26, .08, .075), "woodLight", "Instrumento")
        self.ellipsoid("Woven iraca reference medallion", (0, -.225, 1.72),
                       (.075, .025, .075), "straw")
        for i in range(5):
            self.tube("Medallion weave", [(-.055, -.249, 1.68 + i * .02),
                      (.055, -.249, 1.68 + i * .02)], .006, "cream")

    def yaku(self):
        self.tunic(.89, "green")
        self.ellipsoid("Rain hood", (0, .08, 2.23), (.29, .24, .31), "green", "Cabeza", 20, 12)
        self.tube("Hood opening", [(math.sin(a) * .247, -.16, 2.20 + math.cos(a) * .27)
                  for a in [i * 2 * math.pi / 32 for i in range(33)]], .025, "leaf", "Cabeza")
        for i in range(3):
            self.rod("Stylized hood crest", (0, .08 + i * .10, 2.48 - .04 * i),
                     (0, .08 + i * .10, 2.66 - .08 * i), .065, "leaf", "Cabeza", top=0)
        for sign in (-1, 1):
            self.ellipsoid("Goggle rim", (.102 * sign, -.191, 2.36), (.085, .035, .064), "blue", "Cabeza")
            self.ellipsoid("Goggle lens", (.102 * sign, -.221, 2.36), (.064, .012, .046), "glass", "Cabeza")
            self.rod("Blue rubber boot", (.19 * sign, -.0, .17), (.19 * sign, -.01, .39),
                     .10, "blue", "Pie." + ("L" if sign < 0 else "R"))
        self.box("Backpack", (0, .25, 1.53), (.43, .19, .46), "ochre", bevel=.07)
        self.box("Bottle tray", (0, -.50, 1.23), (.69, .24, .06), "woodLight", "Instrumento")
        for i in range(3):
            x = (i - 1) * .21
            self.ellipsoid("Bottle body", (x, -.51, 1.37), (.078, .075, .13), "glass", "Instrumento")
            self.ellipsoid("Bottle water level", (x, -.55, 1.32 + i * .022),
                           (.06, .044, .04 + i * .022), "water", "Instrumento")
            self.rod("Bottle neck", (x, -.51, 1.47), (x, -.51, 1.55), .029, "glass", "Instrumento")
            self.rod("Bottle lip", (x, -.51, 1.54), (x, -.51, 1.56), .037, "cream", "Instrumento")
        # Decorative weave proposal inspired by Mórrope fibers, no copied sacred motif.
        for row in range(3):
            for col in range(5):
                self.box("Woven cotton patch", ((col - 2) * .06, -.256, 1.03 + row * .035),
                         (.047, .018, .022), "cream" if (row + col) % 2 else "straw", "Cadera", .003)

    def illapa(self):
        self.hat("violet", "violet", .34, .17)
        # A closed two-sided poncho with an asymmetric hem and an independently weighted lower panel.
        verts = [(-.46, -.12, 1.81), (.42, -.12, 1.81), (.39, -.20, .87),
                 (-.50, -.20, .64), (-.46, .22, 1.81), (.42, .22, 1.81),
                 (.39, .20, .87), (-.50, .20, .64)]
        mesh = bpy.data.meshes.new("Poncho")
        mesh.from_pydata(verts, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                                    (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
        mesh.update()
        obj = bpy.data.objects.new("Poncho", mesh)
        self.collection.objects.link(obj)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        self.part(obj, "Asymmetric poncho", "violet", "Torso")
        self.tube("Poncho seam", [(-.45, -.225, .71), (-.20, -.235, .81),
                  (.1, -.235, .86), (.38, -.225, .94)], .018, "magenta")
        for i in range(7):
            x = -.41 + i * .11
            self.tube("Abstract woven border", [(x, -.24, .83 + i * .028),
                      (x + .04, -.24, .90 + i * .028),
                      (x + .08, -.24, .85 + i * .028)], .010, "cream")
        for sign in (-1, 1):
            self.tube("Protective goggle rim", [(.09 * sign + .077 * math.cos(angle),
                      -.225, 2.18 + .05 * math.sin(angle))
                      for angle in [j * 2 * math.pi / 20 for j in range(21)]],
                      .009, "magenta", "Cabeza")
        self.rod("Bombo shell", (.08, -.63, 1.20), (.08, -.32, 1.20), .28, "wood", "Instrumento")
        self.rod("Bombo front skin", (.08, -.65, 1.20), (.08, -.63, 1.20), .282, "drum", "Instrumento")
        for y in (-.65, -.32):
            self.tube("Drum rim", [(.08 + math.sin(a) * .283, y, 1.20 + math.cos(a) * .283)
                      for a in [i * 2 * math.pi / 24 for i in range(25)]], .017, "straw", "Instrumento")
        for i in range(10):
            a, b = 2 * math.pi * i / 10, 2 * math.pi * (i + 1) / 10
            self.tube("Drum tension rope", [(.08 + math.sin(a) * .282, -.64, 1.20 + math.cos(a) * .282),
                      (.08 + math.sin(b) * .282, -.33, 1.20 + math.cos(b) * .282)],
                      .008, "rope", "Instrumento")
        hand = Vector(self.bones["Mano.L"][1])
        tip = hand + Vector((.15, -.05, -.20))
        self.rod("Drum beater", hand, tip, .019, "woodLight", "Mano.L")
        self.ellipsoid("Padded beater head", tip, (.055, .045, .055), "cream", "Mano.L")
        self.tube("Drum strap", [(-.22, -.12, 1.84), (.08, -.32, 1.47)], .022, "straw")
        for i in range(3):
            self.tube("Coiled sling", [(.43 + math.sin(a) * .08, -.04 + math.cos(a) * .08,
                      1.65 - i * .04) for a in [j * 2 * math.pi / 16 for j in range(17)]],
                      .009, "rope", "Brazo.R")

    def rig(self):
        bpy.ops.object.select_all(action="DESELECT")
        armature = bpy.data.armatures.new(self.spec["name"] + " · skeleton")
        self.armature = bpy.data.objects.new(self.spec["name"] + " · rig", armature)
        self.collection.objects.link(self.armature)
        self.armature.select_set(True)
        self.armature.show_in_front = True
        bpy.context.view_layer.objects.active = self.armature
        bpy.ops.object.mode_set(mode="EDIT")
        for name, (head, tail, parent) in self.bones.items():
            bone = armature.edit_bones.new(name)
            bone.head, bone.tail = head, tail
            if parent:
                bone.parent = armature.edit_bones[parent]
        bpy.ops.object.mode_set(mode="OBJECT")
        for obj in self.parts:
            obj.select_set(True)
        self.armature.select_set(False)
        bpy.context.view_layer.objects.active = self.parts[0]
        bpy.ops.object.join()
        self.mesh = bpy.context.object
        self.mesh.name = self.spec["name"] + " · articulated volume"
        # Scale geometry and rest skeleton together to retain distinct cast heights.
        factor = self.spec["scale"]
        for vertex in self.mesh.data.vertices:
            vertex.co *= factor
        self.mesh.location *= factor
        for bone in armature.bones:
            bone.use_deform = True
        self.armature.select_set(True)
        self.mesh.select_set(False)
        bpy.context.view_layer.objects.active = self.armature
        bpy.ops.object.mode_set(mode="EDIT")
        for bone in armature.edit_bones:
            bone.head *= factor
            bone.tail *= factor
        bpy.ops.object.mode_set(mode="OBJECT")
        # Joined object local coordinates must be baked before the armature modifier.
        self.mesh.select_set(True)
        self.armature.select_set(False)
        bpy.context.view_layer.objects.active = self.mesh
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        self.mesh.parent = self.armature
        deform = self.mesh.modifiers.new("Articulated rig", "ARMATURE")
        deform.object = self.armature
        self.armature["character"] = self.key
        self.armature["faceX"] = 0.0
        self.armature["faceY"] = 2.16 * factor
        self.armature["front"] = "-Y"
        self.armature["designStatus"] = "Propuesta artística; revisión cultural del equipo pendiente"
        self.armature["instrument"] = self.spec["instrument"]
        for bone in self.armature.pose.bones:
            bone.rotation_mode = "XYZ"

    def actions(self):
        ad = self.armature.animation_data_create()
        for name, end in CLIPS.items():
            action = bpy.data.actions.new(name + " · " + self.spec["name"])
            ad.action = action
            for frame in range(0, end + 1, 3):
                t = frame / end
                wave = math.sin(t * 2 * math.pi)
                beat = math.sin(t * 4 * math.pi)
                angles = {"Torso": (0, 0, .7 * wave), "Cabeza": (.6 * wave, 0, 0)}
                if name == "Play":
                    strength = {"silbo": 2.5, "inti": 8, "mama": 3, "yaku": 5, "illapa": 10}[self.key]
                    angles["Antebrazo.L"] = (strength * beat, 0, strength * .4 * wave)
                    angles["Antebrazo.R"] = (-strength * beat, 0, -strength * .4 * wave)
                    angles["Mano.L"], angles["Mano.R"] = (3 * beat, 0, 0), (-3 * beat, 0, 0)
                    angles["Cabeza"] = (1.3 * wave, 0, .9 * wave)
                elif name == "Speak":
                    angles["Cabeza"] = (2 * wave, 0, 2 * beat)
                    angles["Mano.R"] = (0, 0, 7 * wave)
                elif name == "Dance":
                    angles["Torso"] = (0, 2 * wave, 3 * wave)
                    angles["Cabeza"] = (1.5 * wave, -2 * wave, -1.5 * wave)
                    angles["Brazo.L"], angles["Brazo.R"] = (2 * beat, 0, 3 * wave), (-2 * beat, 0, -3 * wave)
                elif name == "Walk":
                    # The web clip is an in-place step. Knee flexion lifts each foot
                    # while the opposite leg remains planted. No root translation.
                    for side, sign in (("L", 1), ("R", -1)):
                        lift = max(0, wave * sign)
                        angles["Muslo." + side] = (-14 * lift, 0, 0)
                        angles["Pierna." + side] = (28 * lift, 0, 0)
                        angles["Pie." + side] = (-14 * lift, 0, 0)
                    angles["Torso"] = (0, 0, wave)
                for bone in self.armature.pose.bones:
                    bone.rotation_euler = tuple(math.radians(value) for value in angles.get(bone.name, (0, 0, 0)))
                    bone.keyframe_insert("rotation_euler", frame=frame, group=bone.name)
            ad.action = None
            track = ad.nla_tracks.new()
            track.name = name
            track.strips.new(name, 0, action)
            track.mute = True
        for bone in self.armature.pose.bones:
            bone.rotation_euler = (0, 0, 0)
        for track in ad.nla_tracks:
            track.mute = False

    def export(self, index):
        bpy.ops.object.select_all(action="DESELECT")
        self.armature.select_set(True)
        self.mesh.select_set(True)
        bpy.context.view_layer.objects.active = self.armature
        bpy.context.scene.frame_set(0)
        bpy.ops.export_scene.gltf(
            filepath=str(PROTOTYPE / "modelos" / (self.key + ".glb")), export_format="GLB",
            use_selection=True, export_extras=True, export_animation_mode="NLA_TRACKS",
            export_frame_range=False, export_def_bones=False,
        )
        for track in self.armature.animation_data.nla_tracks:
            track.mute = track.name != "Idle"
        self.armature.location.x = (index - 2) * 1.8


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = 30
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = 0, 72
    (PROTOTYPE / "modelos").mkdir(exist_ok=True)
    atlas = make_atlas()
    for index, (key, spec) in enumerate(CAST.items()):
        character = Character(key, spec, atlas)
        character.export(index)
        print("EXPORTED", key, len(character.mesh.data.vertices), flush=True)
    bpy.context.scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "assets/avatares/terrasonic-banda.blend"), compress=True)
    print("BUILD COMPLETE", flush=True)


if __name__ == "__main__":
    main()
