import ezdxf
import math
from shapely.geometry import Polygon, LineString
from shapely.ops import unary_union

def leer_dxf(path):
    try:
        doc = ezdxf.readfile(path)
    except Exception as e:
        raise ValueError(f"No se pudo leer el archivo DXF: {e}")

    piezas = []
    for e in doc.modelspace().query("LWPOLYLINE ARC LINE"):
        try:
            nombre = e.dxf.layer if hasattr(e.dxf, "layer") else "SIN_NOMBRE"
            puntos = []

            # --- POLILÍNEAS CERRADAS ---
            if e.dxftype() == "LWPOLYLINE":
                puntos = [(p[0], p[1]) for p in e.get_points()]
                if e.closed and len(puntos) >= 3:
                    xs, ys = zip(*puntos)
                    ancho = max(xs) - min(xs)
                    alto = max(ys) - min(ys)
                    area = abs(ancho * alto)
                    piezas.append({
                        "nombre": nombre,
                        "coordenadas": puntos,
                        "ancho_mm": ancho,
                        "alto_mm": alto,
                        "area_mm2": area
                    })

            # --- CURVAS O ARCOS ---
            elif e.dxftype() == "ARC":
                center = e.dxf.center
                radius = e.dxf.radius
                start_angle = e.dxf.start_angle
                end_angle = e.dxf.end_angle
                arc_points = [
                    (
                        center.x + radius * math.cos(math.radians(a)),
                        center.y + radius * math.sin(math.radians(a))
                    )
                    for a in range(int(start_angle), int(end_angle)+1, 3)
                ]
                if len(arc_points) > 2:
                    piezas.append({
                        "nombre": nombre,
                        "coordenadas": arc_points,
                        "ancho_mm": radius*2,
                        "alto_mm": radius,
                        "area_mm2": radius**2
                    })
        except Exception:
            continue

    return {
        "unidades": "milímetros",
        "total_piezas": len(piezas),
        "piezas": piezas
    }
