import random

def shelf_pack(piezas, ancho_rollo, largo_rollo, spacing=10):
    colocadas = []
    x, y, max_alto = 0, 0, 0

    for pieza in piezas:
        ancho = pieza["ancho_mm"]
        alto = pieza["alto_mm"]

        if x + ancho > ancho_rollo:
            x = 0
            y += max_alto + spacing
            max_alto = 0

        if y + alto > largo_rollo:
            raise ValueError("Se excedió el largo del rollo con la heurística actual.")

        pieza_colocada = pieza.copy()
        pieza_colocada["pos_x"] = x + random.uniform(0, 5)
        pieza_colocada["pos_y"] = y + random.uniform(0, 5)
        colocadas.append(pieza_colocada)

        x += ancho + spacing
        max_alto = max(max_alto, alto)

    total_area = sum(p["area_mm2"] for p in piezas)
    area_rollo = ancho_rollo * largo_rollo
    aprovechamiento = total_area / area_rollo * 100
    desperdicio = 100 - aprovechamiento

    kpis = {
        "tela_utilizada_mm2": total_area,
        "aprovechamiento_%": round(aprovechamiento, 2),
        "desperdicio_%": round(desperdicio, 2)
    }

    return colocadas, kpis
