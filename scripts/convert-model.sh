#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# convert-model.sh — Convert 3D model files to RABID JSON format
# Supports: .3mf, .stl, .obj, .glb, .gltf
# Usage: bash scripts/convert-model.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     RABID — 3D Model Converter           ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check Python ──────────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ Python 3 is required. Install from https://python.org${NC}"
  exit 1
fi

# ── Step 1: Ask for file type ─────────────────────────────────────────────────
echo -e "${BOLD}What type of 3D model do you have?${NC}"
echo ""
echo -e "  ${CYAN}1${NC}  .3mf   ${DIM}— 3D Manufacturing Format (Bambu, PrusaSlicer, Fusion 360)${NC}"
echo -e "  ${CYAN}2${NC}  .stl   ${DIM}— STL mesh (most 3D printers, Blender export)${NC}"
echo -e "  ${CYAN}3${NC}  .obj   ${DIM}— Wavefront OBJ (Blender, Maya, most 3D apps)${NC}"
echo -e "  ${CYAN}4${NC}  .glb   ${DIM}— Binary GLTF (Blender, Sketchfab, web-ready)${NC}"
echo -e "  ${CYAN}5${NC}  .gltf  ${DIM}— JSON GLTF (Blender, web-ready)${NC}"
echo -e "  ${CYAN}6${NC}  .step  ${DIM}— STEP/STP (Fusion 360, CAD — limited support)${NC}"
echo ""
read -rp "$(echo -e "${BOLD}Enter number [1-6]:${NC} ")" TYPE_CHOICE
echo ""

case "$TYPE_CHOICE" in
  1) EXT="3mf" ;;
  2) EXT="stl" ;;
  3) EXT="obj" ;;
  4) EXT="glb" ;;
  5) EXT="gltf" ;;
  6) EXT="step"
     echo -e "${YELLOW}⚠  STEP files contain B-rep (mathematical surfaces), not triangles."
     echo -e "   Direct conversion is not supported without OpenCASCADE."
     echo -e "   ${BOLD}Workaround:${NC}${YELLOW} Open in Fusion 360 / FreeCAD → Export as .3mf or .obj first.${NC}"
     echo ""
     read -rp "$(echo -e "Do you have a .3mf or .obj export instead? [y/N]: ")" HAVE_EXPORT
     if [[ "$HAVE_EXPORT" =~ ^[Yy]$ ]]; then
       echo -e "Please re-run this script and choose the exported format."
     fi
     exit 0
     ;;
  *)
     echo -e "${RED}Invalid choice. Exiting.${NC}"
     exit 1
     ;;
esac

# ── Step 2: Ask for input file ────────────────────────────────────────────────
echo -e "${BOLD}Path to your .${EXT} file:${NC}"
echo -e "${DIM}(drag and drop the file into the terminal, or type the path)${NC}"
read -rp "> " INPUT_FILE

# Strip quotes (from drag-and-drop)
INPUT_FILE="${INPUT_FILE//\'/}"
INPUT_FILE="${INPUT_FILE//\"/}"
INPUT_FILE="${INPUT_FILE% }"   # trim trailing space

if [ ! -f "$INPUT_FILE" ]; then
  echo -e "${RED}✗ File not found: ${INPUT_FILE}${NC}"
  exit 1
fi

ACTUAL_EXT="${INPUT_FILE##*.}"
ACTUAL_EXT_LOWER=$(echo "$ACTUAL_EXT" | tr '[:upper:]' '[:lower:]')

if [ "$ACTUAL_EXT_LOWER" != "$EXT" ]; then
  echo -e "${YELLOW}⚠  Warning: You selected .${EXT} but file ends in .${ACTUAL_EXT_LOWER}${NC}"
  read -rp "$(echo -e "Continue anyway? [y/N]: ")" CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then exit 0; fi
fi

echo ""

# ── Step 3: Ask for part name (optional) ─────────────────────────────────────
echo -e "${BOLD}What is this part called?${NC}"
echo -e "${DIM}Used as the key in the JSON. E.g: case_left, bottom_plate, full_case${NC}"
echo -e "${DIM}Leave blank to auto-detect from filename${NC}"
read -rp "> " PART_NAME

FILENAME_BASE=$(basename "$INPUT_FILE" ".${ACTUAL_EXT_LOWER}")
FILENAME_BASE=$(basename "$FILENAME_BASE" ".${ACTUAL_EXT}")
# Normalize: lowercase, spaces to underscores
FILENAME_NORMALIZED=$(echo "$FILENAME_BASE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g')

if [ -z "$PART_NAME" ]; then
  PART_NAME="$FILENAME_NORMALIZED"
fi
echo ""

# ── Step 4: Ask for output location ──────────────────────────────────────────
echo -e "${BOLD}Where should the output JSON be saved?${NC}"
echo -e "${DIM}Convention: public/productMedia/<product-slug>/model.json${NC}"
echo -e "${DIM}Example:    public/productMedia/corne-lp/model.json${NC}"
echo -e "${DIM}Leave blank to save as: ./${FILENAME_NORMALIZED}.json${NC}"
read -rp "> " OUTPUT_PATH

OUTPUT_PATH="${OUTPUT_PATH//\'/}"
OUTPUT_PATH="${OUTPUT_PATH//\"/}"
OUTPUT_PATH="${OUTPUT_PATH% }"

if [ -z "$OUTPUT_PATH" ]; then
  OUTPUT_PATH="./${FILENAME_NORMALIZED}.json"
fi

# Create output directory if needed
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")
if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir -p "$OUTPUT_DIR"
  echo -e "${DIM}Created directory: ${OUTPUT_DIR}${NC}"
fi

echo ""
echo -e "${DIM}Converting ${INPUT_FILE} → ${OUTPUT_PATH}...${NC}"
echo ""

# ── Python conversion script ──────────────────────────────────────────────────
python3 << PYEOF
import sys, json, os, struct, math
import numpy as np

input_file  = """$INPUT_FILE"""
output_path = """$OUTPUT_PATH"""
part_name   = """$PART_NAME"""
ext         = """$ACTUAL_EXT_LOWER"""

def center_and_normalize(verts, scale_to=3.2):
    """Center mesh at origin and normalize so longest axis = scale_to units."""
    bbox_min = verts.min(axis=0)
    bbox_max = verts.max(axis=0)
    center   = (bbox_min + bbox_max) / 2.0
    verts    = verts - center
    max_span = (bbox_max - bbox_min).max()
    if max_span > 0:
        verts = verts * (scale_to / max_span)
    # Remap: model space is Y-up, Z-forward
    # Input 3MF/STL: X=width, Y=depth, Z=height
    # Three.js: X=width, Y=up, Z=depth
    # Swap: new_x=x, new_y=z, new_z=-y
    swapped = np.zeros_like(verts)
    swapped[:,0] = verts[:,0]
    swapped[:,1] = verts[:,2]
    swapped[:,2] = -verts[:,1]
    return swapped

def to_json_part(verts, faces, name):
    return {
        name: {
            "vertices": verts.flatten().astype(float).tolist(),
            "indices":  faces.flatten().astype(int).tolist(),
        }
    }

# ── 3MF ──────────────────────────────────────────────────────────────────────
def parse_3mf(path):
    import zipfile, xml.etree.ElementTree as ET
    NS = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'
    
    all_parts = {}
    
    with zipfile.ZipFile(path, 'r') as zf:
        model_files = [n for n in zf.namelist() if n.endswith('.model')]
        for mf in model_files:
            with zf.open(mf) as f:
                tree = ET.parse(f)
            root = tree.getroot()
            
            # Find all objects in the file
            for obj in root.findall(f'.//{{{NS}}}object'):
                mesh_el = obj.find(f'{{{NS}}}mesh')
                if mesh_el is None:
                    continue
                verts_el = mesh_el.find(f'{{{NS}}}vertices')
                tris_el  = mesh_el.find(f'{{{NS}}}triangles')
                if verts_el is None or tris_el is None:
                    continue
                
                verts = np.array([[float(v.get('x')), float(v.get('y')), float(v.get('z'))]
                                  for v in verts_el.findall(f'{{{NS}}}vertex')], dtype=np.float64)
                faces = np.array([[int(t.get('v1')), int(t.get('v2')), int(t.get('v3'))]
                                  for t in tris_el.findall(f'{{{NS}}}triangle')], dtype=np.int32)
                
                if len(verts) == 0:
                    continue
                
                obj_name = obj.get('name', '')
                key = obj_name.lower().replace(' ', '_').replace('-', '_') if obj_name else part_name
                # Sanitize key
                key = ''.join(c if c.isalnum() or c == '_' else '_' for c in key)
                if not key:
                    key = part_name
                
                # If multiple objects, suffix with index
                if key in all_parts:
                    key = key + '_2'
                
                all_parts[key] = (verts, faces)
    
    return all_parts

# ── STL ──────────────────────────────────────────────────────────────────────
def parse_stl(path):
    with open(path, 'rb') as f:
        header = f.read(80)
        is_ascii = header.lstrip().startswith(b'solid') and b'\x00' not in header[:5]
    
    if is_ascii:
        return parse_stl_ascii(path)
    else:
        return parse_stl_binary(path)

def parse_stl_binary(path):
    with open(path, 'rb') as f:
        f.read(80)  # header
        n_tris = struct.unpack('<I', f.read(4))[0]
        verts_list = []
        faces = []
        vert_idx = 0
        for i in range(n_tris):
            f.read(12)  # normal
            v0 = struct.unpack('<fff', f.read(12))
            v1 = struct.unpack('<fff', f.read(12))
            v2 = struct.unpack('<fff', f.read(12))
            f.read(2)   # attribute
            verts_list.extend([v0, v1, v2])
            faces.append([vert_idx, vert_idx+1, vert_idx+2])
            vert_idx += 3
    
    verts = np.array(verts_list, dtype=np.float64)
    faces = np.array(faces, dtype=np.int32)
    return {part_name: (verts, faces)}

def parse_stl_ascii(path):
    verts_list, faces = [], []
    idx = 0
    with open(path, 'r', errors='ignore') as f:
        tri_verts = []
        for line in f:
            line = line.strip()
            if line.startswith('vertex'):
                parts = line.split()
                tri_verts.append([float(parts[1]), float(parts[2]), float(parts[3])])
                if len(tri_verts) == 3:
                    verts_list.extend(tri_verts)
                    faces.append([idx, idx+1, idx+2])
                    idx += 3
                    tri_verts = []
    verts = np.array(verts_list, dtype=np.float64)
    return {part_name: (verts, np.array(faces, dtype=np.int32))}

# ── OBJ ──────────────────────────────────────────────────────────────────────
def parse_obj(path):
    all_parts = {}
    
    with open(path, 'r', errors='ignore') as f:
        lines = f.readlines()
    
    all_verts = []
    current_name = part_name
    current_verts_idx = []
    current_faces = []
    
    def flush(name, vidx, faces):
        if not faces:
            return
        # Remap vertex indices to 0-based compact array
        used = sorted(set(i for f in faces for i in f))
        remap = {old: new for new, old in enumerate(used)}
        v_arr = np.array([all_verts[i] for i in used], dtype=np.float64)
        f_arr = np.array([[remap[i] for i in face] for face in faces], dtype=np.int32)
        key = name.lower().replace(' ','_').replace('-','_')
        key = ''.join(c if c.isalnum() or c=='_' else '_' for c in key) or part_name
        if key in all_parts:
            key += '_2'
        all_parts[key] = (v_arr, f_arr)
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split()
        if parts[0] == 'v':
            all_verts.append([float(parts[1]), float(parts[2]), float(parts[3])])
        elif parts[0] in ('o', 'g') and len(parts) > 1:
            flush(current_name, current_verts_idx, current_faces)
            current_name = parts[1]
            current_faces = []
        elif parts[0] == 'f':
            # Handle v, v/vt, v/vt/vn, v//vn
            face = [int(p.split('/')[0]) - 1 for p in parts[1:]]
            # Triangulate polygon
            for i in range(1, len(face)-1):
                current_faces.append([face[0], face[i], face[i+1]])
    
    flush(current_name, current_verts_idx, current_faces)
    
    if not all_parts:
        return {part_name: (np.array(all_verts), np.array([[i,i+1,i+2] for i in range(0,len(all_verts)-2,3)]))}
    return all_parts

# ── GLB/GLTF ─────────────────────────────────────────────────────────────────
def parse_glb(path):
    with open(path, 'rb') as f:
        magic = f.read(4)
        if magic != b'glTF':
            raise ValueError('Not a valid GLB file')
        version = struct.unpack('<I', f.read(4))[0]
        total_len = struct.unpack('<I', f.read(4))[0]
        
        # Read JSON chunk
        json_len  = struct.unpack('<I', f.read(4))[0]
        json_type = f.read(4)
        json_data = json.loads(f.read(json_len).decode('utf-8'))
        
        # Read BIN chunk
        bin_data = b''
        remaining = total_len - 12 - 8 - json_len
        if remaining > 8:
            bin_len  = struct.unpack('<I', f.read(4))[0]
            bin_type = f.read(4)
            bin_data = f.read(bin_len)
    
    return extract_gltf_meshes(json_data, bin_data)

def parse_gltf(path):
    base_dir = os.path.dirname(path)
    with open(path, 'r') as f:
        json_data = json.load(f)
    
    bin_data = b''
    if 'buffers' in json_data and json_data['buffers']:
        buf = json_data['buffers'][0]
        uri = buf.get('uri', '')
        if uri.startswith('data:'):
            import base64
            b64 = uri.split(',', 1)[1]
            bin_data = base64.b64decode(b64)
        elif uri:
            with open(os.path.join(base_dir, uri), 'rb') as bf:
                bin_data = bf.read()
    
    return extract_gltf_meshes(json_data, bin_data)

def extract_gltf_meshes(gltf, bin_data):
    all_parts = {}
    
    def get_accessor_data(acc_idx):
        acc  = gltf['accessors'][acc_idx]
        bv   = gltf['bufferViews'][acc['bufferView']]
        offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        count  = acc['count']
        ctype  = acc['componentType']
        atype  = acc['type']
        
        # Component type sizes
        sizes = {5120:1, 5121:1, 5122:2, 5123:2, 5125:4, 5126:4}
        fmts  = {5120:'b', 5121:'B', 5122:'h', 5123:'H', 5125:'I', 5126:'f'}
        n_comp = {'SCALAR':1, 'VEC2':2, 'VEC3':3, 'VEC4':4, 'MAT4':16}
        
        n  = n_comp[atype]
        sz = sizes[ctype]
        fmt = fmts[ctype]
        
        stride = bv.get('byteStride', n * sz)
        data = []
        for i in range(count):
            pos = offset + i * stride
            vals = struct.unpack_from(f'<{n}{fmt}', bin_data, pos)
            data.append(vals if n > 1 else vals[0])
        return data
    
    for mesh_idx, mesh in enumerate(gltf.get('meshes', [])):
        name = mesh.get('name', '') or f'mesh_{mesh_idx}'
        key  = name.lower().replace(' ','_').replace('-','_')
        key  = ''.join(c if c.isalnum() or c=='_' else '_' for c in key) or part_name
        
        all_mesh_verts = []
        all_mesh_faces = []
        vert_offset = 0
        
        for prim in mesh.get('primitives', []):
            attrs = prim.get('attributes', {})
            if 'POSITION' not in attrs:
                continue
            
            pos_data = get_accessor_data(attrs['POSITION'])
            verts = np.array(pos_data, dtype=np.float64)
            
            if 'indices' in prim:
                idx_data = get_accessor_data(prim['indices'])
                faces = np.array(idx_data, dtype=np.int32).reshape(-1, 3) + vert_offset
            else:
                n = len(pos_data)
                faces = np.array([[i, i+1, i+2] for i in range(0, n-2, 3)], dtype=np.int32) + vert_offset
            
            all_mesh_verts.append(verts)
            all_mesh_faces.append(faces)
            vert_offset += len(verts)
        
        if not all_mesh_verts:
            continue
        
        v = np.concatenate(all_mesh_verts)
        f = np.concatenate(all_mesh_faces)
        
        if key in all_parts:
            key += '_2'
        all_parts[key] = (v, f)
    
    return all_parts or {part_name: (np.zeros((3,3)), np.array([[0,1,2]]))}

# ── Main ─────────────────────────────────────────────────────────────────────
print(f"  Reading {os.path.basename(input_file)}...")

try:
    if ext == '3mf':
        parts = parse_3mf(input_file)
    elif ext == 'stl':
        parts = parse_stl(input_file)
    elif ext == 'obj':
        parts = parse_obj(input_file)
    elif ext == 'glb':
        parts = parse_glb(input_file)
    elif ext == 'gltf':
        parts = parse_gltf(input_file)
    else:
        print(f"  Unsupported format: {ext}")
        sys.exit(1)
except Exception as e:
    print(f"  ERROR parsing file: {e}")
    sys.exit(1)

print(f"  Found {len(parts)} part(s): {', '.join(parts.keys())}")
print(f"  Normalizing geometry...")

result = {}
total_verts = 0
total_faces = 0

# Compute global bbox for consistent scale across all parts
all_verts_combined = np.concatenate([v for v, f in parts.values()])
bbox_min = all_verts_combined.min(axis=0)
bbox_max = all_verts_combined.max(axis=0)
center   = (bbox_min + bbox_max) / 2.0
max_span = (bbox_max - bbox_min).max()
scale    = 3.2 / max_span if max_span > 0 else 1.0

for key, (verts, faces) in parts.items():
    # Center and scale uniformly (all parts share same transform)
    v = verts - center
    v = v * scale
    # Remap axes: 3MF/STL/OBJ use X=width, Y=depth, Z=height
    # Three.js uses X=width, Y=up, Z=depth
    swapped = np.zeros_like(v)
    swapped[:,0] = v[:,0]   # X stays X
    swapped[:,1] = v[:,2]   # Z becomes Y (height → up)
    swapped[:,2] = -v[:,1]  # Y becomes -Z (depth → forward)
    
    result[key] = {
        "vertices": swapped.flatten().round(6).tolist(),
        "indices":  faces.flatten().tolist(),
    }
    total_verts += len(swapped)
    total_faces += len(faces)

print(f"  Total: {total_verts} vertices, {total_faces} triangles")
print(f"  Writing JSON...")

with open(output_path, 'w') as f:
    json.dump(result, f, separators=(',', ':'))

size_kb = os.path.getsize(output_path) / 1024
print(f"  Done! Saved {size_kb:.0f} KB")
print(f"  Parts in JSON: {list(result.keys())}")

PYEOF

PYTHON_EXIT=$?

if [ $PYTHON_EXIT -ne 0 ]; then
  echo ""
  echo -e "${RED}✗ Conversion failed. See error above.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         Conversion Complete! ✓           ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Output:  ${BOLD}${OUTPUT_PATH}${NC}"
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo ""
echo -e "  ${CYAN}1.${NC} Make sure the file is inside your project's ${BOLD}public/${NC} folder"
echo -e "     e.g. ${DIM}public/productMedia/your-product-slug/model.json${NC}"
echo ""
echo -e "  ${CYAN}2.${NC} In the admin panel, go to:"
echo -e "     ${DIM}Dashboard → Products → [your product] → 3D Model${NC}"
echo ""
echo -e "  ${CYAN}3.${NC} Set the ${BOLD}Three.js Model Path${NC} to:"
echo -e "     ${DIM}/productMedia/your-product-slug/model.json${NC}"
echo ""
echo -e "  ${CYAN}4.${NC} Save the product. The 3D viewer will render on the product page."
echo ""

