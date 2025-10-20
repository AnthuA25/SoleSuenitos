from shapely.geometry import Polygon

def shelf_pack(piezas, ancho_rollo_mm, largo_rollo_mm, spacing=10):
    colocadas = []
    x, y = 0, 0
    fila_altura = 0
    total_area = 0

    for pieza in piezas:
        w = pieza["ancho_mm"]
        h = pieza["alto_mm"]

        if w > ancho_rollo_mm or h > largo_rollo_mm:
            print(f"⚠️ {pieza['nombre']} es demasiado grande para el rollo.")
            continue

        # Salto de línea si no cabe en la fila
        if x + w > ancho_rollo_mm:
            x = 0
            y += fila_altura + spacing
            fila_altura = 0

        # Si ya no cabe en el largo del rollo, termina
        if y + h > largo_rollo_mm:
            print(f"⚠️ {pieza['nombre']} no cabe en el largo del rollo.")
            break

        poly = Polygon([
            (x, y),
            (x + w, y),
            (x + w, y + h),
            (x, y + h)
        ])

        colocadas.append({
            "nombre": pieza["nombre"],
            "poligono": poly
        })

        x += w + spacing
        fila_altura = max(fila_altura, h)
        total_area += w * h

    if not colocadas:
        raise ValueError("❌ No se pudieron colocar piezas. Revisa las unidades o el tamaño del rollo.")

    rollo_area = ancho_rollo_mm * largo_rollo_mm
    kpis = {
        "total_piezas": len(colocadas),
        "area_tela": rollo_area,
        "area_utilizada": total_area,
        "aprovechamiento_%": round((total_area / rollo_area) * 100, 2),
        "desperdicio_%": round(100 - (total_area / rollo_area) * 100, 2)
    }

    return colocadas, kpis
