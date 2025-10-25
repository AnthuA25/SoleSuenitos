# scripts/generar_polo_basico_dxf.py
import ezdxf

def add_piece(msp, layer, origin_xy, scale=1.0):
    ox, oy = origin_xy

    def T(pts):
        out = []
        for x, y, b in pts:
            out.append((ox + x*scale, oy + y*scale, b))
        return out

    if layer.upper() == "DELANTERO":
        # contorno con hombro y sisa curvos (bulge)
        pts = [
            (0, 0, 0),
            (450, 0, 0),
            (480, 120, 0.45),   # curva hombro
            (470, 700, 0),
            (120, 760, -0.6),   # curva costado
            (0, 760, 0),
        ]
        msp.add_lwpolyline(T(pts), format="xyb", close=True, dxfattribs={"layer": layer})

    elif layer.upper() == "ESPALDA":
        pts = [
            (0, 0, 0),
            (680, 0, 0),
            (680, 280, 0),
            (0, 280, 0),
        ]
        msp.add_lwpolyline(T(pts), format="xyb", close=True, dxfattribs={"layer": layer})

    elif layer.upper() == "MANGA":
        pts = [
            (0, 0, 0),
            (260, 0, 0),
            (260, 420, 0),
            (200, 420, -0.45),  # curva bocamanga
            (40, 420, -0.45),
            (0, 420, 0),
        ]
        msp.add_lwpolyline(T(pts), format="xyb", close=True, dxfattribs={"layer": layer})

def generar(path="polo_basico.dxf"):
    doc = ezdxf.new(setup=True)
    msp = doc.modelspace()

    # piezas (en mm) separadas para que no se superpongan
    add_piece(msp, "DELANTERO", (50, 50), scale=1.0)
    add_piece(msp, "ESPALDA", (600, 50), scale=1.0)
    add_piece(msp, "MANGA", (650, 380), scale=1.0)

    doc.saveas(path)
    print(f"DXF generado: {path}")

if __name__ == "__main__":
    generar()
