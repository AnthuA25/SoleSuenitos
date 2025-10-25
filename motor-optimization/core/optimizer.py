# core/optimizer.py
from typing import List, Dict
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate

def _bbox(poly: Polygon):
    minx, miny, maxx, maxy = poly.bounds
    return maxx - minx, maxy - miny

def generar_layout(piezas: List[Dict], ancho_rollo: float, largo_rollo: float,
                   permitir_giro_90: bool = True):
    """
    piezas: [{nombre, polygon, ...}]
    Retorna (piezas_colocadas, largo_usado_mm, metricas)
    """
    # Ordenar por alto descendente (heurística)
    piezas = sorted(piezas, key=lambda p: _bbox(p["polygon"])[1], reverse=True)

    x, y = 10.0, 10.0          # margen
    fila_altura = 0.0
    largo_usado = 0.0
    colocadas = []

    for p in piezas:
        poly = p["polygon"]
        w, h = _bbox(poly)

        # Intenta sin rotar; si no cabe, intenta 90°
        colocado = None
        orient = 0
        if x + w <= ancho_rollo - 10:
            colocado = translate(poly, xoff=x, yoff=y)
            orient = 0
        elif permitir_giro_90 and p.get("permite_giro_90", True):
            poly_r = rotate(poly, 90, origin='centroid', use_radians=False)
            w2, h2 = _bbox(poly_r)
            if x + w2 <= ancho_rollo - 10:
                poly, w, h = poly_r, w2, h2
                colocado = translate(poly, xoff=x, yoff=y)
                orient = 90

        # Si no cabe en esta fila, salta a otra
        if colocado is None:
            # cerrar fila
            y += fila_altura + 10
            x = 10
            fila_altura = 0.0
            if y + h > largo_rollo - 10:
                raise ValueError("No hay largo suficiente en el rollo para colocar todas las piezas.")
            # reintentar en nueva fila
            colocado = translate(poly, xoff=x, yoff=y)
            orient = 0

        colocadas.append({
            "nombre": p["nombre"],
            "polygon": colocado,
            "orientacion_deg": orient,
            "ancho_mm": w,
            "alto_mm": h,
            "area_mm2": colocado.area
        })

        x += w + 10
        fila_altura = max(fila_altura, h)
        largo_usado = max(largo_usado, y + fila_altura + 10)

    area_piezas = sum(pc["area_mm2"] for pc in colocadas)
    area_rollo_usado = ancho_rollo * (largo_usado)
    aprovechamiento = area_piezas / area_rollo_usado if area_rollo_usado > 0 else 0.0

    metricas = {
        "largo_usado_mm": round(largo_usado, 2),
        "area_piezas_mm2": round(area_piezas, 2),
        "area_rollo_usado_mm2": round(area_rollo_usado, 2),
        "aprovechamiento_porcentaje": round(aprovechamiento * 100, 2),
        "desperdicio_porcentaje": round((1 - aprovechamiento) * 100, 2)
    }
    return colocadas, largo_usado, metricas
