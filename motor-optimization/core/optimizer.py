import math
import random

# ==============================================================
# 🧩 OPTIMIZADOR TEXTIL: Lógica de colocación de piezas
# ==============================================================

def shelf_pack(piezas, ancho_rollo_mm, largo_rollo_mm):
    """
    Algoritmo tipo "Shelf Packing"
    Coloca las piezas en filas (shelves) dentro del rollo textil.
    Calcula métricas de aprovechamiento y desperdicio.
    """

    x, y, max_y = 0, 0, 0
    colocadas = []
    total_area = 0

    for p in piezas:
        # Si no cabe en el ancho, pasa a la siguiente fila
        if x + p["ancho_mm"] > ancho_rollo_mm:
            x = 0
            y += max_y
            max_y = 0

        # Si se pasa del largo del rollo, dejamos de colocar
        if y + p["alto_mm"] > largo_rollo_mm:
            print(f"Pieza {p['nombre']} no cabe en el rollo.")
            continue

        colocadas.append({
            **p,
            "x": x,
            "y": y
        })

        x += p["ancho_mm"]
        max_y = max(max_y, p["alto_mm"])
        total_area += p["area_mm2"]

    # Métricas del marcador
    area_rollo = ancho_rollo_mm * largo_rollo_mm
    eficiencia = round((total_area / area_rollo) * 100, 2)
    desperdicio = round(100 - eficiencia, 2)

    kpis = {
        "area_total_cm2": round(total_area / 100, 2),
        "ancho_rollo_mm": ancho_rollo_mm,
        "largo_rollo_mm": largo_rollo_mm,
        "eficiencia": eficiencia,
        "desperdicio": desperdicio,
        "piezas_colocadas": len(colocadas)
    }

    return colocadas, kpis


# ==============================================================
# 🔁 GENERADOR DE VERSIONES: Giros y orientaciones alternativas
# ==============================================================

def generar_version_con_giro(piezas, ancho_rollo_mm, largo_rollo_mm, orientacion="libre", giro_permitido=0):
    """
    Crea una nueva versión del marcador aplicando:
    - Orientaciones restringidas ("recto hilo", "libre")
    - Giros de piezas (0°, 90°, 180°)
    """

    nuevas_piezas = []

    for p in piezas:
        ancho, alto = p["ancho_mm"], p["alto_mm"]

        # Aplicar giro si está permitido
        if giro_permitido == 90:
            ancho, alto = alto, ancho
        elif giro_permitido == 180:
            # 180° no cambia dimensiones, pero puede afectar orientación
            pass

        # Si la orientación es restringida (recto hilo), ma
