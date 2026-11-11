"""Modelos de TerraSonic construidos en Blender sobre la silueta dibujada.
blender --background --factory-startup --python scripts/modelar_banda.py
"""
from collections import deque
from math import pi, sin, cos, radians
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
import numpy as np
from mathutils import Quaternion, Vector

ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "prototipos" / "I11-eic"
GRID_W, GRID_H = 120, 180

# Anclas de la pose original. Cada coordenada se mide sobre el dibujo, desde arriba.
# Centro de cadera, pecho, cara, brazos (hombro, codo, muñeca, extremo),
# piernas (cadera, rodilla, tobillo, punta). L/R corresponden al lado de la imagen.
CAST = {
    "silbo": ("Silbo", "FFD447", (.47,.58), (.49,.35), (.51,.255),
              ((.34,.37),(.22,.34),(.22,.25),(.105,.063)),
              ((.57,.39),(.72,.44),(.84,.365),(.949,.329)),
              ((.40,.65),(.336,.78),(.291,.875),(.255,.947)),
              ((.567,.65),(.609,.76),(.603,.827),(.721,.878))),
    "inti": ("Inti", "FF5A36", (.485,.57), (.46,.37), (.49,.299),
             ((.346,.364),(.212,.307),(.226,.201),(.366,.047)),
             ((.56,.376),(.734,.454),(.698,.528),(.551,.568)),
             ((.402,.633),(.282,.744),(.183,.875),(.101,.938)),
             ((.56,.631),(.655,.746),(.76,.855),(.875,.94))),
    "mama": ("Mamacocha", "38C6E8", (.493,.553), (.477,.31), (.532,.155),
             ((.417,.281),(.434,.366),(.593,.355),(.683,.336)),
             ((.568,.29),(.783,.394),(.822,.261),(.884,.103)),
             ((.429,.685),(.326,.783),(.25,.842),(.285,.87)),
             ((.559,.693),(.523,.782),(.525,.851),(.62,.908))),
    "yaku": ("Yaku", "7BE38A", (.502,.566), (.522,.409), (.536,.30),
             ((.363,.391),(.235,.356),(.15,.284),(.087,.189)),
             ((.666,.401),(.767,.365),(.859,.293),(.904,.219)),
             ((.433,.608),(.315,.632),(.234,.676),(.147,.745)),
             ((.547,.612),(.56,.721),(.614,.818),(.766,.895))),
    "illapa": ("Illapa", "E0459B", (.556,.589), (.543,.346), (.576,.246),
               ((.435,.327),(.324,.27),(.303,.176),(.457,.078)),
               ((.657,.35),(.791,.427),(.754,.487),(.66,.49)),
               ((.486,.621),(.309,.671),(.184,.764),(.075,.828)),
               ((.623,.626),(.737,.742),(.827,.858),(.919,.919))),
}
ANIMATIONS = {"Idle":72, "Play":40, "Walk":36, "Dance":60, "Speak":54}
# Profundidad adicional de los objetos que sobresalen en cada dibujo.
VOLUMES = {
    "silbo": ((.681,.674,.085,.085,.105),),
    "inti": ((.475,.543,.205,.069,.145),),
    "mama": ((.716,.326,.127,.174,.215),),
    "yaku": ((.368,.534,.039,.075,.110),(.51,.589,.044,.080,.15),(.664,.562,.042,.076,.117)),
    "illapa": ((.655,.557,.205,.139,.245),),
}


def neighbors(mask, diagonal=False):
    p = np.pad(mask, 1)
    offsets = [(-1,0),(1,0),(0,-1),(0,1)]
    if diagonal:
        offsets += [(-1,-1),(-1,1),(1,-1),(1,1)]
    return [p[1+y:1+y+GRID_H,1+x:1+x+GRID_W] for y,x in offsets]


def components(mask):
    remaining = mask.copy()
    for row, col in np.argwhere(mask):
        if not remaining[row,col]:
            continue
        remaining[row,col] = False
        queue = deque([(row,col)])
        cells = []
        while queue:
            y,x = queue.popleft()
            cells.append((y,x))
            for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                if 0 <= yy < GRID_H and 0 <= xx < GRID_W and remaining[yy,xx]:
                    remaining[yy,xx] = False
                    queue.append((yy,xx))
        yield tuple(zip(*cells))


def mask_and_depth(rgba):
    # La malla sigue la tinta visible. Se quitan islas de resplandor de un píxel.
    alpha = rgba[:,:,3].reshape(GRID_H,3,GRID_W,3).mean(axis=(1,3))
    ink = alpha > .255
    expanded = ink | np.logical_or.reduce(neighbors(ink, True))
    closed = expanded & np.logical_and.reduce(neighbors(expanded, True))
    for area in components(closed):
        if len(area[0]) < 34:
            closed[area] = False
    for area in components(~closed):
        y,x = area
        if min(x)>0 and min(y)>0 and max(x)<GRID_W-1 and max(y)<GRID_H-1 and len(y)<850:
            closed[area] = True
    field = np.zeros(closed.shape, dtype=np.float32)
    layers = closed.copy()
    for _ in range(24):
        field += layers
        layers &= np.logical_and.reduce(neighbors(layers, True))
    return closed, field


def rgb(hex_color):
    return np.array([int(hex_color[i:i+2],16)/255 for i in (0,2,4)])


def make_material(name, rgba, tint, face, directory, rear=False):
    data = rgba.copy()
    alpha = data[:,:,3:4]
    peak = np.max(data[:,:,:3], axis=-1, keepdims=True)
    # El patrón de puntos y grabado viene de la ilustración de la banda.
    ink = np.clip(peak * alpha * 1.2, 0, 1)
    pattern = data[:,:,:3] * (.72 * alpha) + tint * ink * .30
    backing = tint * np.array([.105,.108,.125]) + .020
    if rear:
        xx,yy = np.meshgrid(np.linspace(0,1,360), np.linspace(1,0,540))
        x,y = face
        radial = np.sqrt(((xx-x)/.16)**2+((yy-y)/.118)**2)
        cover = np.clip((1.08-radial)*5,0,1)
        hairlines = (np.cos((radial+.037*np.sin(12*xx))*52)>.94) * .24
        pattern *= 1-cover[:,:,None]
        pattern += cover[:,:,None]*hairlines[:,:,None]*tint
        pattern *= .56
    data[:,:,:3] = np.clip(backing + pattern,0,1)
    data[:,:,3] = 1
    suffix = "espalda" if rear else "frente"
    texture = bpy.data.images.new(f"{name} · {suffix}",360,540,alpha=False)
    texture.pixels.foreach_set(data.ravel())
    texture.filepath_raw = str(Path(directory)/(name+"-"+suffix+".png"))
    texture.file_format = "PNG"
    texture.save()
    texture.pack()
    texture.filepath = f"//{name}-{suffix}.png"
    mat = bpy.data.materials.new(f"{name} · {suffix}")
    mat.use_nodes = True
    mat.diffuse_color = (*tuple(tint*.48),1)
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Roughness"].default_value = .68
    shader.inputs["Emission Strength"].default_value = .68 if not rear else .38
    image = mat.node_tree.nodes.new("ShaderNodeTexImage")
    image.image = texture
    mat.node_tree.links.new(image.outputs["Color"],shader.inputs["Base Color"])
    mat.node_tree.links.new(image.outputs["Color"],shader.inputs["Emission Color"])
    return mat


def segment_distance(coords, a, b):
    a,b = np.array(a),np.array(b)
    direction = b-a
    t = np.clip(((coords-a)@direction)/(direction@direction),0,1)
    return np.linalg.norm(coords-(a+t[:,None]*direction),axis=1)


class Avatar:
    def __init__(self,key,spec,rgba,directory):
        self.key = key
        self.name,hex_color,self.hip,self.chest,self.face,*self.limbs = spec
        self.collection = bpy.data.collections.new(self.name)
        bpy.context.scene.collection.children.link(self.collection)
        self.tint = rgb(hex_color)
        self.bones = self.rig_layout()
        mask, depth = mask_and_depth(rgba)
        ys,xs = np.nonzero(mask)
        self.bottom = float(min(ys))
        self.top = float(max(ys)+1)
        self.center = (min(xs)+max(xs)+1)*.5
        self.scale = 2.9/(self.top-self.bottom)
        self.mesh,self.bindings = self.build_mesh(mask, depth)
        for rear in (False, True):
            self.mesh.materials.append(make_material(self.name,rgba,self.tint,self.face,directory,rear))
        self.make_rig()
        self.make_reference()
        self.make_actions()

    def rig_layout(self):
        x,y=self.face
        spine_tip = self.chest
        result = [
            ("Cadera",self.hip,spine_tip,None,.165,.36,.31,.025),
            ("Torso",spine_tip,(x,y+.084),"Cadera",.145,.38,.31,-.012),
            ("Cabeza",(x,y+.084),(x,y-.094),"Torso",.129,.35,.28,-.065),
        ]
        for side,points in zip(("L","R"),self.limbs[:2]):
            a,b,c,d=points
            result += [
                ("Brazo."+side,a,b,"Torso",.078,.17,.16,-.034),
                ("Antebrazo."+side,b,c,"Brazo."+side,.066,.14,.135,-.165),
                ("Mano."+side,c,d,"Antebrazo."+side,.052,.115,.105,-.205),
            ]
        for side,points in zip(("L","R"),self.limbs[2:]):
            a,b,c,d=points
            result += [
                ("Muslo."+side,a,b,"Cadera",.083,.19,.17,.035),
                ("Pierna."+side,b,c,"Muslo."+side,.064,.14,.135,.0),
                ("Pie."+side,c,d,"Pierna."+side,.071,.13,.155,-.056),
            ]
        return result

    def world(self,u,t,y):
        return ((u*GRID_W-self.center)*self.scale,y,((1-t)*GRID_H-self.bottom)*self.scale)

    def build_mesh(self,mask,field):
        corners,quads,edges = {},[],{}
        for y,x in np.argwhere(mask):
            q = [(x,y),(x+1,y),(x+1,y+1),(x,y+1)]
            quads.append(q)
            for point in q:
                corners.setdefault(point,[]).append(field[y,x])
            for a,b in zip(q,q[1:]+q[:1]):
                if (b,a) in edges:
                    del edges[b,a]
                else:
                    edges[a,b] = None
        outline = {}
        for a,b in edges:
            outline.setdefault(a,[]).append(b)
            outline.setdefault(b,[]).append(a)
        points = list(corners)
        smooth = []
        for x,y in points:
            links = outline.get((x,y))
            if links:
                x = x*.56 + np.mean([n[0] for n in links])*.44
                y = y*.56 + np.mean([n[1] for n in links])*.44
            smooth.append((x/GRID_W,1-y/GRID_H))
        coords = np.array(smooth)
        distance = np.stack([segment_distance(coords,b[1],b[2])/b[4] for b in self.bones],axis=1)
        # Mezcla continua entre el volumen de hombros, cara, mangas, tela e instrumentos.
        blend = np.exp(-3*np.square(np.minimum(distance,10)))
        blend /= np.maximum(blend.sum(axis=1,keepdims=True),1e-10)
        edge_distance = np.array([sum(corners[p])/4 for p in points])
        shape = np.sqrt(np.clip((edge_distance-.35)/15,0,1))
        shape[[i for i,p in enumerate(points) if p in outline]] = 0
        front = blend @ np.array([b[5] for b in self.bones])
        back = blend @ np.array([b[6] for b in self.bones])
        center = blend @ np.array([b[7] for b in self.bones])
        u,v = coords.T
        x,y = self.face
        # Redondear cráneo y pómulos sin cambiar el trazo del rostro.
        front += .076 * np.exp(-((u-x)/.031)**2 - ((v-y)/.045)**2)
        back += .054 * np.exp(-((u-x)/.11)**2 - ((v-y)/.10)**2)
        for x,y,rx,ry,amount in VOLUMES[self.key]:
            front += amount*np.exp(-((u-x)/rx)**2 - ((v-y)/ry)**2)
        skin = np.exp(-7*np.square(np.minimum(distance,10)))
        # Las partes anchas de la túnica y el cabello siguen su cadera o su cabeza.
        for i,(u,v) in enumerate(coords):
            if self.key == "mama" and v<.31 and u<.42:
                skin[i,2] += .65
            if self.key in {"silbo","mama","illapa"} and self.hip[1]-.06<v<self.hip[1]+.16:
                skin[i,0] += .37
        vertices, uv, faces, materials = [],[],[],[]
        indices = {p:i*2 for i,p in enumerate(points)}
        for i,(u,v) in enumerate(coords):
            thickness = .018 + shape[i]
            vertices.extend([self.world(u,v,center[i]-front[i]*thickness),
                             self.world(u,v,center[i]+back[i]*thickness)])
            uv.extend([(u,1-v)]*2)
        for q in quads:
            faces.append([indices[p] for p in q]); materials.append(0)
            faces.append([indices[p]+1 for p in reversed(q)]); materials.append(1)
        for a,b in edges:
            ai,bi=indices[a],indices[b]
            faces.append([bi,ai,ai+1,bi+1]); materials.append(1)
        mesh = bpy.data.meshes.new(self.name+" · volumen original")
        mesh.from_pydata(vertices,[],faces)
        mesh.update()
        uvmap = mesh.uv_layers.new(name="Proyección de la ilustración")
        for loop in mesh.loops:
            uvmap.data[loop.index].uv = uv[loop.vertex_index]
        self.material_indices = materials
        weights = []
        for row in skin:
            ids = np.argsort(row)[-3:]
            if row[ids].sum() < 1e-9:
                ids = np.array([np.argmax(row)])
            total = row[ids].sum()
            weights.append([(int(i),float(row[i]/total)) for i in ids if row[i]>0])
        return mesh, weights

    def make_rig(self):
        armature = bpy.data.armatures.new(self.name+" · esqueleto")
        self.rig = bpy.data.objects.new(self.name+" · rig",armature)
        self.collection.objects.link(self.rig)
        self.rig.show_in_front = True
        self.rig["faceX"] = self.world(*self.face,0)[0]
        self.rig["faceY"] = self.world(*self.face,0)[2]
        self.rig["source"] = f"sprites/{self.key}/pose-banda.webp"
        bpy.context.view_layer.objects.active = self.rig
        bpy.ops.object.mode_set(mode="EDIT")
        root = armature.edit_bones.new("Raíz")
        root.head,root.tail = (0,0,0),(0,0,.20)
        root.use_deform = False
        for name,a,b,parent,_,_,_,depth in self.bones:
            bone = armature.edit_bones.new(name)
            bone.head,bone.tail = self.world(*a,depth),self.world(*b,depth)
            bone.parent = armature.edit_bones[parent or "Raíz"]
        bpy.ops.object.mode_set(mode="OBJECT")
        self.obj = bpy.data.objects.new(self.name,self.mesh)
        self.collection.objects.link(self.obj)
        self.obj.parent = self.rig
        for poly, mat in zip(self.mesh.polygons,self.material_indices):
            poly.material_index = mat
            poly.use_smooth = True
        modifier = self.obj.modifiers.new("Esqueleto de la pose original","ARMATURE")
        modifier.object = self.rig
        groups = [self.obj.vertex_groups.new(name=b[0]) for b in self.bones]
        for index,binding in enumerate(self.bindings):
            for bone,weight in binding:
                groups[bone].add([2*index,2*index+1],weight,"REPLACE")
        for bone in self.rig.pose.bones:
            bone.rotation_mode = "XYZ"

    def make_reference(self):
        src = bpy.data.images.load(str(PROTOTYPE / "sprites" / self.key / "pose-banda.webp"))
        src.pack()
        src.filepath = f"//referencia-{self.key}.webp"
        ref = bpy.data.objects.new(self.name+" · referencia original",None)
        self.collection.objects.link(ref)
        ref.empty_display_type = "IMAGE"
        ref.data = src
        ref.empty_display_size = GRID_H*self.scale
        ref.rotation_euler.x = pi/2
        ref.location = (0,.6,(GRID_H/2-self.bottom)*self.scale)
        ref.hide_set(True)
        ref.hide_render = True
        self.reference = ref

    def make_actions(self):
        ad = self.rig.animation_data_create()
        for clip,end in ANIMATIONS.items():
            action = bpy.data.actions.new(clip+" · "+self.name)
            ad.action = action
            for frame in range(0,end+1,2):
                t = frame/end
                w = sin(t*2*pi)
                pulse = sin(t*pi)
                beat = sin(t*4*pi)*pulse
                angles = {}
                lift = 0
                if clip == "Idle":
                    angles = {"Torso": (1.3*w,0,w), "Cabeza": (-w,0,1.7*w)}
                elif clip == "Play":
                    if self.key == "silbo":
                        angles = {"Antebrazo.L":(-11*pulse,0,-14*pulse),"Mano.L":(-7*pulse,4*beat,0),
                                  "Antebrazo.R":(0,5*pulse,-17*pulse),"Cabeza":(4*pulse,0,2*pulse)}
                    elif self.key == "mama":
                        angles = {"Antebrazo.L":(5*beat,0,-11*beat),"Mano.L":(9*beat,6*beat,9*beat),
                                  "Cabeza":(2*pulse,3*beat,0)}
                    else:
                        angles = {"Brazo.L":(-9*pulse,0,9*beat),"Antebrazo.L":(12*beat,0,-24*pulse),
                                  "Antebrazo.R":(8*pulse,0,17*beat),"Mano.R":(7*beat,0,4*beat),
                                  "Cabeza":(4*pulse,0,2*beat)}
                        if self.key == "illapa":
                            angles["Antebrazo.L"] = (14*beat,0,42*pulse)
                        if self.key == "yaku":
                            lift = .095*pulse
                elif clip == "Speak":
                    angles = {"Cabeza":(5*w,2*beat,4*w),"Torso":(1*w,0,2*w),
                              "Antebrazo.R":(0,7*pulse,17*pulse)}
                else:
                    amplitude = 1 if clip == "Walk" else 1.38
                    angles = {"Torso":(2*w,7*w,4*w),"Cabeza":(-2*w,-3*w,1*w)}
                    lift = (.048 if clip=="Walk" else .105)*abs(w)
                    for side, sign in (("L",1),("R",-1)):
                        angles["Muslo."+side] = (22*w*sign*amplitude,0,4*w*sign)
                        angles["Pierna."+side] = (19*max(0,-w*sign)*amplitude,0,0)
                        angles["Brazo."+side] = (-8*w*sign,0,12*w*sign*amplitude)
                        angles["Antebrazo."+side] = (8*w*sign,0,7*w*sign*amplitude)
                for bone in self.rig.pose.bones:
                    bone.rotation_euler = tuple(radians(value) for value in angles.get(bone.name,(0,0,0)))
                    bone.keyframe_insert("rotation_euler",frame=frame,group=bone.name)
                self.rig.pose.bones["Raíz"].location.y = lift
                self.rig.pose.bones["Raíz"].keyframe_insert("location",frame=frame,group="Raíz")
            ad.action = None
            track = ad.nla_tracks.new()
            track.name = clip
            track.strips.new(clip,0,action)
            track.mute = True
        for bone in self.rig.pose.bones:
            bone.rotation_euler = (0,0,0)
            bone.location = (0,0,0)
        for track in ad.nla_tracks:
            track.mute = False

    def export(self,folder,index):
        bpy.ops.object.select_all(action="DESELECT")
        self.rig.select_set(True)
        self.obj.select_set(True)
        bpy.context.view_layer.objects.active = self.rig
        bpy.context.scene.frame_set(0)
        bpy.ops.export_scene.gltf(filepath=str(folder/(self.key+".glb")),export_format="GLB",
            use_selection=True,export_extras=True,export_animation_mode="NLA_TRACKS",
            export_frame_range=False,export_def_bones=False)
        for track in self.rig.animation_data.nla_tracks:
            track.mute = track.name != "Idle"
        self.rig.location = ((index-2)*2.22,0,0)
        self.reference.location.x = self.rig.location.x
        depth = [v.co.y for v in self.mesh.vertices]
        print(f"{self.name}: {len(self.mesh.vertices)} vértices; profundidad {max(depth)-min(depth):.2f}; {len(self.bones)} huesos")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps,scene.frame_start,scene.frame_end = 30,0,72
    output = PROTOTYPE/"modelos"
    output.mkdir(exist_ok=True)
    avatars = []
    with TemporaryDirectory(prefix="terrasonic-texturas-") as directory:
        for index,(key,spec) in enumerate(CAST.items()):
            src = bpy.data.images.load(str(PROTOTYPE/"sprites"/key/"pose-banda.webp"))
            pixels = np.empty(360*540*4,dtype=np.float32)
            src.pixels.foreach_get(pixels)
            bpy.data.images.remove(src)
            avatar = Avatar(key,spec,pixels.reshape(540,360,4),directory)
            avatar.export(output,index)
            avatars.append(avatar)
    bpy.ops.object.select_all(action="DESELECT")
    avatars[0].obj.select_set(True)
    bpy.context.view_layer.objects.active = avatars[0].obj
    scene.frame_set(0)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == "VIEW_3D":
                space = area.spaces.active
                space.shading.type = "MATERIAL"
                space.overlay.show_overlays = False
                space.region_3d.view_rotation = Quaternion((1,0,0),radians(85))
                space.region_3d.view_location = (0,0,1.48)
                space.region_3d.view_distance = 12.8
                space.region_3d.view_perspective = "ORTHO"
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"assets/avatares/terrasonic-banda.blend"),compress=True)


if __name__ == "__main__":
    main()
