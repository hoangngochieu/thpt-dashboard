"""
Build vietnam-34provinces.geojson from the existing 63-province GeoJSON
by merging geometries according to Vietnam's 2025 administrative reform.
"""

import json
from shapely.ops import unary_union
from shapely.geometry import shape, mapping

# -----------------------------------------------------------------------
# Merge table: new province name -> list of OLD province keys that form it
# Keys match feature.properties.name in vietnam-simplified.geojson
# -----------------------------------------------------------------------
MERGE_MAP = {
    # Unchanged (kept as-is, just single old province)
    "HàNội":        ["HàNội"],
    "CaoBằng":      ["CaoBằng"],
    "ĐiệnBiên":     ["ĐiệnBiên"],
    "HàTĩnh":       ["HàTĩnh"],
    "LaiChâu":      ["LaiChâu"],
    "LạngSơn":      ["LạngSơn"],
    "NghệAn":       ["NghệAn"],
    "QuảngNinh":    ["QuảngNinh"],
    "SơnLa":        ["SơnLa"],
    "ThanhHóa":     ["ThanhHóa"],
    "Huế":          ["ThừaThiênHuế"],  # Thừa Thiên Huế → Huế

    # Merged provinces
    "LàoCai":       ["LàoCai", "YênBái"],
    "TuyênQuang":   ["TuyênQuang", "HàGiang"],
    "TháiNguyên":   ["TháiNguyên", "BắcKạn"],
    "PhúThọ":       ["PhúThọ", "VĩnhPhúc", "HoàBình"],
    "BắcNinh":      ["BắcNinh", "BắcGiang"],
    "HưngYên":      ["HưngYên", "TháiBình"],
    "HảiPhòng":     ["HảiPhòng", "HảiDương"],
    "NinhBình":     ["NinhBình", "HàNam", "NamĐịnh"],
    "QuảngBình":    ["QuảngBình", "QuảngTrị"],
    "ĐàNẵng":       ["ĐàNẵng", "QuảngNam"],
    "QuảngNgãi":    ["QuảngNgãi", "BìnhĐịnh"],
    "KhánhHòa":     ["KhánhHòa", "PhúYên", "NinhThuận"],
    "LâmĐồng":      ["LâmĐồng", "ĐắkNông"],
    "ĐắkLắk":       ["ĐắkLắk", "GiaLai", "KonTum"],
    "BìnhDương":    ["BìnhDương", "BìnhPhước", "TâyNinh"],
    "HồChíMinh":    ["HồChíMinh", "BìnhThuận", "ĐồngNai", "BàRịa-VũngTàu"],
    "LongAn":       ["LongAn", "TiềnGiang", "ĐồngTháp"],
    "AnGiang":      ["AnGiang", "KiênGiang"],
    "CầnThơ":       ["CầnThơ", "SócTrăng", "HậuGiang"],
    "VĩnhLong":     ["VĩnhLong", "BếnTre", "TràVinh"],
    "BạcLiêu":      ["BạcLiêu"],
    "CàMau":        ["CàMau"],
}

# Display names and regions for the 34 new provinces
PROVINCE_INFO = {
    "HàNội":        {"displayName": "Hà Nội", "region": "Đồng bằng sông Hồng"},
    "CaoBằng":      {"displayName": "Cao Bằng", "region": "Trung du và miền núi phía Bắc"},
    "ĐiệnBiên":     {"displayName": "Điện Biên", "region": "Trung du và miền núi phía Bắc"},
    "HàTĩnh":       {"displayName": "Hà Tĩnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LaiChâu":      {"displayName": "Lai Châu", "region": "Trung du và miền núi phía Bắc"},
    "LạngSơn":      {"displayName": "Lạng Sơn", "region": "Trung du và miền núi phía Bắc"},
    "NghệAn":       {"displayName": "Nghệ An", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNinh":    {"displayName": "Quảng Ninh", "region": "Đồng bằng sông Hồng"},
    "SơnLa":        {"displayName": "Sơn La", "region": "Trung du và miền núi phía Bắc"},
    "ThanhHóa":     {"displayName": "Thanh Hóa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "Huế":          {"displayName": "Huế", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LàoCai":       {"displayName": "Lào Cai", "region": "Trung du và miền núi phía Bắc"},
    "TuyênQuang":   {"displayName": "Tuyên Quang", "region": "Trung du và miền núi phía Bắc"},
    "TháiNguyên":   {"displayName": "Thái Nguyên", "region": "Trung du và miền núi phía Bắc"},
    "PhúThọ":       {"displayName": "Phú Thọ", "region": "Trung du và miền núi phía Bắc"},
    "BắcNinh":      {"displayName": "Bắc Ninh", "region": "Đồng bằng sông Hồng"},
    "HưngYên":      {"displayName": "Hưng Yên", "region": "Đồng bằng sông Hồng"},
    "HảiPhòng":     {"displayName": "Hải Phòng", "region": "Đồng bằng sông Hồng"},
    "NinhBình":     {"displayName": "Ninh Bình", "region": "Đồng bằng sông Hồng"},
    "QuảngBình":    {"displayName": "Quảng Bình", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "ĐàNẵng":       {"displayName": "Đà Nẵng", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNgãi":    {"displayName": "Quảng Ngãi", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "KhánhHòa":     {"displayName": "Khánh Hòa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LâmĐồng":      {"displayName": "Lâm Đồng", "region": "Tây Nguyên"},
    "ĐắkLắk":       {"displayName": "Đắk Lắk", "region": "Tây Nguyên"},
    "BìnhDương":    {"displayName": "Bình Dương", "region": "Đông Nam Bộ"},
    "HồChíMinh":    {"displayName": "TP. Hồ Chí Minh", "region": "Đông Nam Bộ"},
    "LongAn":       {"displayName": "Long An", "region": "Đồng bằng sông Cửu Long"},
    "AnGiang":      {"displayName": "An Giang", "region": "Đồng bằng sông Cửu Long"},
    "CầnThơ":       {"displayName": "Cần Thơ", "region": "Đồng bằng sông Cửu Long"},
    "VĩnhLong":     {"displayName": "Vĩnh Long", "region": "Đồng bằng sông Cửu Long"},
    "BạcLiêu":      {"displayName": "Bạc Liêu", "region": "Đồng bằng sông Cửu Long"},
    "CàMau":        {"displayName": "Cà Mau", "region": "Đồng bằng sông Cửu Long"},
    "ĐắkNông":      {"displayName": "Đắk Nông", "region": "Tây Nguyên"},  # fallback if not merged
}

def main():
    with open("public/vietnam-simplified.geojson", encoding="utf-8") as f:
        geo = json.load(f)

    # Index old features by name
    old_features = {}
    for feat in geo["features"]:
        name = feat["properties"]["name"]
        old_features[name] = feat

    missing = []
    for new_name, old_names in MERGE_MAP.items():
        for on in old_names:
            if on not in old_features:
                missing.append((new_name, on))

    if missing:
        print("WARNING - old province names not found in GeoJSON:")
        for pair in missing:
            print(f"  {pair[0]} <- {pair[1]}")

    new_features = []
    for new_name, old_names in MERGE_MAP.items():
        shapes = []
        for on in old_names:
            if on in old_features:
                geom = shape(old_features[on]["geometry"])
                if not geom.is_valid:
                    geom = geom.buffer(0)  # fix invalid geometry
                shapes.append(geom)
        if not shapes:
            print(f"SKIP {new_name}: no geometries found")
            continue
        merged = unary_union(shapes)
        info = PROVINCE_INFO.get(new_name, {"displayName": new_name, "region": ""})
        new_features.append({
            "type": "Feature",
            "properties": {
                "name": new_name,
                "displayName": info["displayName"],
                "region": info["region"],
            },
            "geometry": mapping(merged),
        })

    new_geo = {
        "type": "FeatureCollection",
        "features": new_features,
    }

    out_path = "public/vietnam-34provinces.geojson"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(new_geo, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Created {out_path} with {len(new_features)} features")

if __name__ == "__main__":
    main()
