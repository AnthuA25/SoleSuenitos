import ezdxf

def leer_dxf(path):
    """
    Lee un archivo DXF y extrae las piezas textiles.
    Soporta polilíneas cerradas con curvas (bulge).
    Retorna lista con vértices, bulges, nombre y métricas.
    """
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()
    piezas = []

    for e in msp.query("LWPOLYLINE"):
        if not e.closed:
            continue

        puntos = [(p[0], p[1]) for p in e]
        bulges = [p[2] if len(p) > 2 else 0 for p in e]

        bbox = e.bbox()
        ancho = bbox.extmax.x - bbox.extmin.x
        alto = bbox.extmax.y - bbox.extmin.y
        area = ancho * alto

        piezas.append({
            "nombre": e.dxf.layer or "Pieza",
            "vertices": puntos,
            "bulges": bulges,
            "ancho_mm": round(ancho, 2),
            "alto_mm": round(alto, 2),
            "area_mm2": round(area, 2),
        })

    return {"piezas": piezas}
