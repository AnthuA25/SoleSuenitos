import ezdxf
import os
import math

def agregar_pieza_curva(msp, nombre, puntos, color):
    """
    Dibuja una pieza textil con curvas (bulges) en el marcador.
    """
    poly = msp.add_lwpolyline(
        [(x, y, bulge) for x, y, bulge in puntos],
        format="xyb",
        close=True,
        dxfattribs={"layer": nombre, "color": color}
    )

    # Calcular centro aproximado para el texto
    cx = sum(x for x, _, _ in puntos) / len(puntos)
    cy = sum(y for _, y, _ in puntos) / len(puntos)
    msp.add_text(nombre, dxfattribs={"height": 40, "color": color}).set_placement((cx - 100, cy))


def generar_marcador_polo():
    os.makedirs("output/markers", exist_ok=True)
    path = "output/markers/marcador_polo_real.dxf"

    doc = ezdxf.new(dxfversion="R2010")
    msp = doc.modelspace()

    # Marco del rollo (ancho x alto)
    ancho_rollo = 1600
    alto_rollo = 900
    msp.add_lwpolyline(
        [(0, 0), (ancho_rollo, 0), (ancho_rollo, alto_rollo), (0, alto_rollo), (0, 0)],
        close=True,
        dxfattribs={"layer": "Rollo", "color": 7}
    )

    # --- PIEZA: DELANTERO ---
    delantero = [
        (50, 50, 0.0),
        (600, 50, 0.15),
        (620, 400, -0.4),
        (300, 700, 0.3),
        (50, 650, 0.0),
        (50, 50, 0.0)
    ]
    agregar_pieza_curva(msp, "Delantero", delantero, 3)

    # --- PIEZA: ESPALDA ---
    espalda = [
        (700, 100, 0.0),
        (1250, 100, -0.2),
        (1260, 400, 0.4),
        (720, 450, 0.0),
        (700, 100, 0.0)
    ]
    agregar_pieza_curva(msp, "Espalda", espalda, 1)

    # --- PIEZA: MANGA ---
    manga = [
        (800, 500, 0.0),
        (1150, 500, 0.2),
        (1170, 750, -0.3),
        (820, 760, 0.2),
        (800, 500, 0.0)
    ]
    agregar_pieza_curva(msp, "Manga", manga, 5)

    # --- Título ---
    msp.add_text(
        "Marcador Polo Básico 1.6m x 0.9m",
        dxfattribs={"height": 30, "color": 7}
    ).set_placement((100, 880))

    # Guardar DXF
    doc.saveas(path)
    print(f"✅ Marcador textil generado en: {path}")

if __name__ == "__main__":
    generar_marcador_polo()
