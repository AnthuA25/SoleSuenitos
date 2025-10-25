# core/dxf_reader.py
import math
from typing import Dict, List, Tuple
import ezdxf
from shapely.geometry import Polygon, LineString
from shapely.ops import linemerge
from shapely.affinity import translate

# --- helpers ---------------------------------------------------------------

def _approx_arc_from_bulge(p0, p1, bulge, seg_per_90=6) -> List[Tuple[float, float]]:
    """
    Convierte un segmento con bulge a una lista de puntos (aprox. arco).
    p0 -> p1 (x, y); bulge: tan(theta/4) con signo (ccw:+).
    """
    if abs(bulge) < 1e-12:
        return [p0, p1]

    x0, y0 = p0
    x1, y1 = p1
    chord = math.hypot(x1 - x0, y1 - y0)
    theta = 4.0 * math.atan(bulge)  # ángulo central (rad)
    r = chord / (2.0 * math.sin(abs(theta) / 2.0))

    # Ángulo del chord
    ang = math.atan2(y1 - y0, x1 - x0)

    # Dirección a la izquierda del chord (normal)
    sign = 1.0 if bulge > 0 else -1.0
    h = r * math.cos(theta / 2.0)
    mx, my = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    cx = mx - sign * h * math.sin(ang)
    cy = my + sign * h * math.cos(ang)

    # Ángulos absolutos de p0 y p1 alrededor del centro
    a0 = math.atan2(y0 - cy, x0 - cx)
    a1 = math.atan2(y1 - cy, x1 - cx)

    # Asegurar sentido correcto (ccw si bulge>0)
    if bulge > 0 and a1 < a0:
        a1 += 2 * math.pi
    if bulge < 0 and a1 > a0:
        a1 -= 2 * math.pi

    # nº de segmentos según ángulo
    steps = max(2, int(seg_per_90 * abs(a1 - a0) / (math.pi / 2.0)))
    pts = []
    for i in range(steps + 1):
        t = i / steps
        a = a0 + t * (a1 - a0)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def _lwpolyline_to_points(lw) -> List[Tuple[float, float]]:
    """Devuelve lista de puntos XY aproximando arcos por bulge."""
    pts_b = lw.get_points("xyb")  # [(x,y,bulge), ...]
    n = len(pts_b)
    pts_all: List[Tuple[float, float]] = []
    for i in range(n):
        x0, y0, b = pts_b[i]
        x1, y1, _ = pts_b[(i + 1) % n]
        segpts = _approx_arc_from_bulge((x0, y0), (x1, y1), b)
        if i < n - 1 or not lw.closed:
            pts_all.extend(segpts[:-1])  # evitar duplicar p1
        else:
            pts_all.extend(segpts)       # último agrega cierre
    if lw.closed:
        if pts_all[0] != pts_all[-1]:
            pts_all.append(pts_all[0])
    return pts_all

# --- lectura principal -----------------------------------------------------

def leer_dxf(path: str) -> Dict:
    """
    Lee un DXF y extrae piezas por CAPA (layer).
    Devuelve dict con piezas = [{nombre, polygon, ancho_mm, alto_mm, area_mm2, puntos_ref}]
    """
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()

    # recolectar por capa
    por_layer: Dict[str, List[LineString]] = {}

    # LWPOLYLINE con bulge
    for e in msp.query("LWPOLYLINE"):
        if not (e.closed or abs(e.dxf.const_width or 0) >= 0):  # ignorar abiertas si no cierran
            pass
        pts = _lwpolyline_to_points(e)
        if len(pts) >= 4:
            ln = LineString(pts)
            por_layer.setdefault(e.dxf.layer or "PIEZA", []).append(ln)

    # SPLINE -> discretizar
    for e in msp.query("SPLINE"):
        pts = [(p[0], p[1]) for p in e.approximate(200)]
        if pts[0] != pts[-1]:
            pts.append(pts[0])
        ln = LineString(pts)
        por_layer.setdefault(e.dxf.layer or "PIEZA", []).append(ln)

    # POLYLINE (viejo) cerrado
    for e in msp.query("POLYLINE"):
        if e.is_closed:
            pts = [(v.dxf.location.x, v.dxf.location.y) for v in e.vertices]
            if pts[0] != pts[-1]:
                pts.append(pts[0])
            por_layer.setdefault(e.dxf.layer or "PIEZA", []).append(LineString(pts))

    piezas = []
    for layer, contornos in por_layer.items():
        if not contornos:
            continue
        # fusionar líneas y cerrar polígono principal
        merged = linemerge(contornos)
        if isinstance(merged, LineString):
            rings = [merged]
        else:
            rings = list(merged.geoms)

        # escoger el más grande como contorno
        rings_sorted = sorted(rings, key=lambda l: l.length, reverse=True)
        poly = Polygon(rings_sorted[0])
        if not poly.is_valid:
            poly = poly.buffer(0)

        minx, miny, maxx, maxy = poly.bounds
        piezas.append({
            "nombre": layer,  # ej. "DELANTERO", "ESPALDA", "MANGA"
            "polygon": poly,
            "ancho_mm": maxx - minx,
            "alto_mm": maxy - miny,
            "area_mm2": poly.area,
            "puntos_ref": {
                "bbox_bl": (minx, miny),
                "centro": (poly.centroid.x, poly.centroid.y),
            },
            # Por defecto permitimos rotar 180°. El 90° lo decidirá el endpoint.
            "permite_giro_90": True,
        })

    return {"unidades": "mm", "piezas": piezas}
