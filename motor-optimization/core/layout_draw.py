import ezdxf
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import math


def dibujar_marcador(piezas, path_salida):
    """
    Genera un archivo DXF del marcador textil.
    Cada pieza se dibuja con su contorno (curvas si tiene bulge).
    """
    doc = ezdxf.new(dxfversion="R2010")
    msp = doc.modelspace()

    for p in piezas:
        x, y = p["x"], p["y"]
        ancho, alto = p["ancho_mm"], p["alto_mm"]

        # Rectángulo base (si no hay curvas en la pieza)
        msp.add_lwpolyline([
            (x, y),
            (x + ancho, y),
            (x + ancho, y + alto),
            (x, y + alto),
            (x, y)
        ], close=True, dxfattribs={"layer": p.get("nombre", "Pieza"), "color": 3})

    doc.saveas(path_salida)


def _interpolar_curva_bulge(x1, y1, x2, y2, bulge, steps=20):
    """
    Calcula puntos intermedios para un segmento con bulge (curvatura).
    Retorna una lista de puntos (x, y) que forman el arco.
    """
    if bulge == 0:
        return [(x1, y1), (x2, y2)]

    # Calcular ángulo del arco
    angulo = 4 * math.atan(bulge)
    dist = math.hypot(x2 - x1, y2 - y1)
    radio = dist / (2 * math.sin(abs(angulo) / 2))

    # Dirección de línea
    dx, dy = x2 - x1, y2 - y1
    ang_linea = math.atan2(dy, dx)

    # Calcular centro del arco
    ang_bisectriz = ang_linea + (math.pi / 2 - angulo / 2) * (1 if bulge >= 0 else -1)
    cx = (x1 + x2) / 2 - radio * math.cos(ang_bisectriz)
    cy = (y1 + y2) / 2 - radio * math.sin(ang_bisectriz)

    # Ángulos inicial y final
    start_angle = math.atan2(y1 - cy, x1 - cx)
    end_angle = start_angle + angulo

    # Interpolación de puntos
    puntos = []
    for i in range(steps + 1):
        theta = start_angle + (angulo * i / steps)
        px = cx + radio * math.cos(theta)
        py = cy + radio * math.sin(theta)
        puntos.append((px, py))

    return puntos


def dibujar_marcador_png(piezas, path_png, ancho_rollo, largo_rollo):
    """
    Genera una imagen PNG del marcador textil con curvas reales (si existen).
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_xlim(0, ancho_rollo)
    ax.set_ylim(0, largo_rollo)
    ax.set_aspect("equal")
    ax.set_facecolor("#f7f7f7")

    print("[DEBUG] Cantidad de piezas a dibujar:", len(piezas))
    for idx, p in enumerate(piezas):
        print(f"[DEBUG] Pieza {idx+1}: nombre={p.get('nombre','')}")
        if 'vertices' in p:
            print(f"  [DEBUG]  Vértices: {p['vertices']}")
        if 'bulges' in p:
            print(f"  [DEBUG]  Bulges: {p['bulges']}")
        if 'x' in p and 'y' in p:
            print(f"  [DEBUG]  Posición: x={p['x']}, y={p['y']}")
        if 'ancho_mm' in p and 'alto_mm' in p:
            print(f"  [DEBUG]  Tamaño: ancho={p['ancho_mm']}, alto={p['alto_mm']}")

        # Si viene de DXF con curvas
        if "bulges" in p:
            coords = []
            puntos = p["vertices"]
            bulges = p["bulges"]

            for i in range(len(puntos)):
                x1, y1 = puntos[i]
                x2, y2 = puntos[(i + 1) % len(puntos)]
                bulge = bulges[i]
                segmento = _interpolar_curva_bulge(x1, y1, x2, y2, bulge, steps=25)
                coords.extend(segmento)

            xs, ys = zip(*coords)
            ax.fill(xs, ys, color="#9ad2ae", alpha=0.8, edgecolor="black", linewidth=0.8)

            # Etiqueta de nombre
            cx = np.mean(xs)
            cy = np.mean(ys)
            ax.text(cx, cy, p.get("nombre", ""), ha="center", va="center", fontsize=6, color="black")

        else:
            # Rectángulo básico (sin curvas)
            rect = patches.Rectangle(
                (p["x"], p["y"]),
                p["ancho_mm"],
                p["alto_mm"],
                linewidth=0.8,
                edgecolor="black",
                facecolor="#9ad2ae",
                alpha=0.7,
            )
            ax.add_patch(rect)
            ax.text(
                p["x"] + p["ancho_mm"] / 2,
                p["y"] + p["alto_mm"] / 2,
                p.get("nombre", ""),
                ha="center",
                va="center",
                fontsize=6,
                color="black",
            )

    # Marco del rollo
    ax.add_patch(
        patches.Rectangle(
            (0, 0),
            ancho_rollo,
            largo_rollo,
            fill=False,
            edgecolor="#555",
            linestyle="--",
            linewidth=0.8,
        )
    )

    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig(path_png, dpi=250)
    plt.close()
