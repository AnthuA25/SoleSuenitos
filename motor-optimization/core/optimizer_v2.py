# core/optimizer_v2.py
from typing import List, Dict
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
import numpy as np

def _bbox(poly: Polygon):
    minx, miny, maxx, maxy = poly.bounds
    return maxx - minx, maxy - miny

def _colisiona(nuevo_poly, colocadas):
    for p in colocadas:
        if nuevo_poly.intersects(p["polygon"]):
            return True
    return False

def generar_layout_v2(piezas: List[Dict], ancho_rollo: float, largo_rollo: float):
    """
    Versión 2 del marcador digital (optimización geométrica con rotaciones múltiples).
    """
    piezas = sorted(piezas, key=lambda p: p["polygon"].area, reverse=True)
    colocadas = []

    paso = 20  # mm
    angulos = np.arange(0, 180, 10)

    for pieza in piezas:
        mejor_colocacion = None
        menor_y = float("inf")

        for ang in angulos:
            rotada = rotate(pieza["polygon"], ang, origin="centroid", use_radians=False)
            w, h = _bbox(rotada)

            for y in np.arange(0, largo_rollo - h, paso):
                for x in np.arange(0, ancho_rollo - w, paso):
                    movida = translate(rotada, xoff=x, yoff=y)
                    if _colisiona(movida, colocadas):
                        continue
                    if y < menor_y:
                        menor_y = y
                        mejor_colocacion = {
                            "nombre": pieza["nombre"],
                            "polygon": movida,
                            "orientacion_deg": ang,
                            "ancho_mm": w,
                            "alto_mm": h,
                            "area_mm2": movida.area
                        }
                if mejor_colocacion:
                    break

        if mejor_colocacion:
            colocadas.append(mejor_colocacion)
        else:
            raise ValueError(f"No se pudo colocar la pieza {pieza['nombre']} dentro del rollo.")

    max_y = max(p["polygon"].bounds[3] for p in colocadas)
    area_piezas = sum(p["polygon"].area for p in colocadas)
    area_usada = ancho_rollo * max_y
    aprovechamiento = area_piezas / area_usada

    metricas = {
        "largo_usado_mm": round(max_y, 2),
        "area_piezas_mm2": round(area_piezas, 2),
        "area_rollo_usado_mm2": round(area_usada, 2),
        "aprovechamiento_porcentaje": round(aprovechamiento * 100, 2),
        "desperdicio_porcentaje": round((1 - aprovechamiento) * 100, 2)
    }

    return colocadas, max_y, metricas
