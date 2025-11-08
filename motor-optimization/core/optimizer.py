# core/optimizer.py
from typing import List, Dict
from shapely.geometry import Polygon
from shapely.affinity import translate, rotate
import numpy as np

def _bbox(poly: Polygon):
    minx, miny, maxx, maxy = poly.bounds
    return maxx - minx, maxy - miny

def _colisiona(nuevo_poly, colocadas):
    """Verifica si una pieza se superpone con alguna ya colocada."""
    for p in colocadas:
        if nuevo_poly.intersects(p["polygon"]):
            return True
    return False

def generar_layout(piezas: List[Dict], ancho_rollo: float, largo_rollo: float, permitir_giro_90: bool = True):
    piezas = sorted(piezas, key=lambda p: p["polygon"].area, reverse=True)

    colocadas = []
    y_actual = 0.0
    paso = 50.0  # espaciado de búsqueda (mm)
    angulos = [0, 90] if permitir_giro_90 else [0]

    for pieza in piezas:
        colocada = None
        for ang in angulos:
            rotada = rotate(pieza["polygon"], ang, origin="centroid", use_radians=False)
            w, h = _bbox(rotada)

            for y in np.arange(y_actual, largo_rollo - h, paso):
                for x in np.arange(0, ancho_rollo - w, paso):
                    movida = translate(rotada, xoff=x, yoff=y)
                    if not _colisiona(movida, colocadas):
                        colocada = {
                            "nombre": pieza["nombre"],
                            "polygon": movida,
                            "orientacion_deg": ang,
                            "ancho_mm": w,
                            "alto_mm": h,
                            "area_mm2": movida.area
                        }
                        colocadas.append(colocada)
                        break
                if colocada:
                    break
            if colocada:
                break

        if not colocada:
            raise ValueError(f"No se pudo colocar la pieza {pieza['nombre']} dentro del rollo.")

    # Calcular métricas
    max_y = max(p["polygon"].bounds[3] for p in colocadas)
    area_piezas = sum(p["polygon"].area for p in colocadas)
    area_usada = ancho_rollo * max_y
    aprovechamiento = area_piezas / area_usada

    metricas = {
        "largo_usado_mm": round(max_y, 2),
        "aprovechamiento_porcentaje": round(aprovechamiento * 100, 2),
        "desperdicio_porcentaje": round((1 - aprovechamiento) * 100, 2)
    }

    return colocadas, max_y, metricas
