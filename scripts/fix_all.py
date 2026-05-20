"""
All-in-one fix:
1. Fix invalid geometries in vietnam-simplified.geojson → vietnam-simplified-fixed.geojson
2. Rebuild vietnam-34provinces.geojson with CORRECT 2025 merge map (from official source)
3. Rebuild province-data.json 2025 section with correct 34-province structure

Official 34 provinces (from chinhphu.vn, effective 12/6/2025):
=== UNCHANGED (11) ===
Hà Nội, Huế (city), Cao Bằng, Điện Biên, Hà Tĩnh, Lai Châu, Lạng Sơn, Nghệ An, Quảng Ninh, Sơn La, Thanh Hóa

=== MERGED → NEW NAME (23) ===
YênBái + LàoCai → LàoCai
BắcKạn + TháiNguyên → TháiNguyên
VĩnhPhúc + HoàBình + PhúThọ → PhúThọ
BắcGiang + BắcNinh → BắcNinh
TháiBình + HưngYên → HưngYên
HảiDương + HảiPhòng → HảiPhòng
HàNam + NamĐịnh + NinhBình → NinhBình
QuảngBình + QuảngTrị → QuảngTrị   *** NAME IS QuảngTrị ***
QuảngNam + ĐàNẵng → ĐàNẵng
KonTum + QuảngNgãi → QuảngNgãi   *** KonTum goes to QuảngNgãi ***
BìnhĐịnh + GiaLai → GiaLai        *** BìnhĐịnh goes to GiaLai ***
NinhThuận + KhánhHòa → KhánhHòa
ĐắkNông + BìnhThuận + LâmĐồng → LâmĐồng  *** BìnhThuận also merged here ***
PhúYên + ĐắkLắk → ĐắkLắk         *** PhúYên merges with ĐắkLắk ***
HCM + BàRịaVũngTàu + BìnhDương → HồChíMinh
BìnhPhước + ĐồngNai → ĐồngNai
LongAn + TâyNinh → TâyNinh        *** NAME IS TâyNinh ***
CầnThơ + SócTrăng + HậuGiang → CầnThơ
BếnTre + TràVinh + VĩnhLong → VĩnhLong
TiềnGiang + ĐồngTháp → ĐồngTháp  *** NAME IS ĐồngTháp ***
BạcLiêu + CàMau → CàMau           *** NAME IS CàMau ***
KiênGiang + AnGiang → AnGiang
HàGiang + TuyênQuang → TuyênQuang
"""

import json
from shapely.ops import unary_union
from shapely.geometry import shape, mapping

# -----------------------------------------------------------------------
# CORRECT merge map (official nghị quyết 202/2025/QH15)
# key = new province name, value = list of old province keys from geojson
# -----------------------------------------------------------------------
MERGE_MAP = {
    # Unchanged
    "HàNội":        ["HàNội"],
    "Huế":          ["ThừaThiênHuế"],
    "CaoBằng":      ["CaoBằng"],
    "ĐiệnBiên":     ["ĐiệnBiên"],
    "HàTĩnh":       ["HàTĩnh"],
    "LaiChâu":      ["LaiChâu"],
    "LạngSơn":      ["LạngSơn"],
    "NghệAn":       ["NghệAn"],
    "QuảngNinh":    ["QuảngNinh"],
    "SơnLa":        ["SơnLa"],
    "ThanhHóa":     ["ThanhHóa"],
    # Merged
    "LàoCai":       ["LàoCai", "YênBái"],
    "TháiNguyên":   ["TháiNguyên", "BắcKạn"],
    "TuyênQuang":   ["TuyênQuang", "HàGiang"],
    "PhúThọ":       ["PhúThọ", "VĩnhPhúc", "HoàBình"],
    "BắcNinh":      ["BắcNinh", "BắcGiang"],
    "HưngYên":      ["HưngYên", "TháiBình"],
    "HảiPhòng":     ["HảiPhòng", "HảiDương"],
    "NinhBình":     ["NinhBình", "HàNam", "NamĐịnh"],
    "QuảngTrị":     ["QuảngTrị", "QuảngBình"],   # ← QuảngTrị (not QuảngBình)
    "ĐàNẵng":       ["ĐàNẵng", "QuảngNam"],
    "QuảngNgãi":    ["QuảngNgãi", "KonTum"],      # ← KonTum joins QuảngNgãi
    "GiaLai":       ["GiaLai", "BìnhĐịnh"],       # ← BìnhĐịnh joins GiaLai
    "KhánhHòa":     ["KhánhHòa", "NinhThuận"],
    "LâmĐồng":      ["LâmĐồng", "ĐắkNông", "BìnhThuận"],  # ← BìnhThuận here
    "ĐắkLắk":       ["ĐắkLắk", "PhúYên"],         # ← PhúYên joins ĐắkLắk
    "HồChíMinh":    ["HồChíMinh", "BàRịa-VũngTàu", "BìnhDương"],
    "ĐồngNai":      ["ĐồngNai", "BìnhPhước"],
    "TâyNinh":      ["TâyNinh", "LongAn"],         # ← TâyNinh (not LongAn)
    "CầnThơ":       ["CầnThơ", "SócTrăng", "HậuGiang"],
    "VĩnhLong":     ["VĩnhLong", "BếnTre", "TràVinh"],
    "ĐồngTháp":     ["ĐồngTháp", "TiềnGiang"],    # ← ĐồngTháp (not LongAn)
    "CàMau":        ["CàMau", "BạcLiêu"],          # ← CàMau (not BạcLiêu)
    "AnGiang":      ["AnGiang", "KiênGiang"],
}

PROVINCE_INFO = {
    "HàNội":        {"displayName": "Hà Nội", "region": "Đồng bằng sông Hồng"},
    "Huế":          {"displayName": "Huế", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "CaoBằng":      {"displayName": "Cao Bằng", "region": "Trung du và miền núi phía Bắc"},
    "ĐiệnBiên":     {"displayName": "Điện Biên", "region": "Trung du và miền núi phía Bắc"},
    "HàTĩnh":       {"displayName": "Hà Tĩnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LaiChâu":      {"displayName": "Lai Châu", "region": "Trung du và miền núi phía Bắc"},
    "LạngSơn":      {"displayName": "Lạng Sơn", "region": "Trung du và miền núi phía Bắc"},
    "NghệAn":       {"displayName": "Nghệ An", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNinh":    {"displayName": "Quảng Ninh", "region": "Đồng bằng sông Hồng"},
    "SơnLa":        {"displayName": "Sơn La", "region": "Trung du và miền núi phía Bắc"},
    "ThanhHóa":     {"displayName": "Thanh Hóa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LàoCai":       {"displayName": "Lào Cai", "region": "Trung du và miền núi phía Bắc"},
    "TháiNguyên":   {"displayName": "Thái Nguyên", "region": "Trung du và miền núi phía Bắc"},
    "TuyênQuang":   {"displayName": "Tuyên Quang", "region": "Trung du và miền núi phía Bắc"},
    "PhúThọ":       {"displayName": "Phú Thọ", "region": "Trung du và miền núi phía Bắc"},
    "BắcNinh":      {"displayName": "Bắc Ninh", "region": "Đồng bằng sông Hồng"},
    "HưngYên":      {"displayName": "Hưng Yên", "region": "Đồng bằng sông Hồng"},
    "HảiPhòng":     {"displayName": "Hải Phòng", "region": "Đồng bằng sông Hồng"},
    "NinhBình":     {"displayName": "Ninh Bình", "region": "Đồng bằng sông Hồng"},
    "QuảngTrị":     {"displayName": "Quảng Trị", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "ĐàNẵng":       {"displayName": "Đà Nẵng", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNgãi":    {"displayName": "Quảng Ngãi", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "GiaLai":       {"displayName": "Gia Lai", "region": "Tây Nguyên"},
    "KhánhHòa":     {"displayName": "Khánh Hòa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LâmĐồng":      {"displayName": "Lâm Đồng", "region": "Tây Nguyên"},
    "ĐắkLắk":       {"displayName": "Đắk Lắk", "region": "Tây Nguyên"},
    "HồChíMinh":    {"displayName": "TP. Hồ Chí Minh", "region": "Đông Nam Bộ"},
    "ĐồngNai":      {"displayName": "Đồng Nai", "region": "Đông Nam Bộ"},
    "TâyNinh":      {"displayName": "Tây Ninh", "region": "Đông Nam Bộ"},
    "CầnThơ":       {"displayName": "Cần Thơ", "region": "Đồng bằng sông Cửu Long"},
    "VĩnhLong":     {"displayName": "Vĩnh Long", "region": "Đồng bằng sông Cửu Long"},
    "ĐồngTháp":     {"displayName": "Đồng Tháp", "region": "Đồng bằng sông Cửu Long"},
    "CàMau":        {"displayName": "Cà Mau", "region": "Đồng bằng sông Cửu Long"},
    "AnGiang":      {"displayName": "An Giang", "region": "Đồng bằng sông Cửu Long"},
}

SUBJECTS = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc",
            "sinh_hoc", "lich_su", "dia_li", "gdcd"]


def fix_geojson(input_path, output_path):
    """Fix invalid geometries by applying buffer(0)."""
    with open(input_path, encoding="utf-8") as f:
        geo = json.load(f)

    fixed = 0
    for feat in geo["features"]:
        geom = shape(feat["geometry"])
        if not geom.is_valid:
            geom = geom.buffer(0)
            feat["geometry"] = mapping(geom)
            fixed += 1

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geo, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Fixed {fixed} invalid geometries -> {output_path}")
    return geo  # return the fixed version


def build_34_geojson(fixed_geo, output_path):
    """Build 34-province GeoJSON by merging fixed 63-province geometries."""
    old_features = {}
    for feat in fixed_geo["features"]:
        name = feat["properties"]["name"]
        old_features[name] = feat

    # Verify all expected old names exist
    for new_name, old_names in MERGE_MAP.items():
        for on in old_names:
            if on not in old_features:
                print(f"WARNING: '{on}' not found in GeoJSON (needed for {new_name})")

    new_features = []
    for new_name, old_names in MERGE_MAP.items():
        shapes = [shape(old_features[on]["geometry"])
                  for on in old_names if on in old_features]
        if not shapes:
            print(f"SKIP {new_name}: no geometries")
            continue
        merged = unary_union(shapes)
        if not merged.is_valid:
            merged = merged.buffer(0)
        info = PROVINCE_INFO[new_name]
        new_features.append({
            "type": "Feature",
            "properties": {
                "name": new_name,
                "displayName": info["displayName"],
                "region": info["region"],
            },
            "geometry": mapping(merged),
        })

    new_geo = {"type": "FeatureCollection", "features": new_features}
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(new_geo, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Built {output_path} with {len(new_features)} features")


def weighted_merge(entries, subjects):
    """Weighted average of scores by totalStudents."""
    total_students = sum(e.get("totalStudents", 0) for e in entries)
    avg_scores = {}
    for s in subjects:
        items = [(e["averageScores"].get(s, 0), e.get("totalStudents", 0))
                 for e in entries if e.get("averageScores", {}).get(s, 0) > 0]
        if items:
            tw = sum(i[1] for i in items)
            tv = sum(i[0] * i[1] for i in items)
            avg_scores[s] = round(tv / tw, 2) if tw else 0
    overall = round(sum(avg_scores.values()) / len(avg_scores), 2) if avg_scores else 0
    return total_students, avg_scores, overall


def rebuild_2025_data(pdata):
    """Build correct 2025 data section with 34-province keys matching the GeoJSON."""
    data_2024 = pdata["provinces"]["2024"]

    new_2025 = {}
    for new_key, old_keys in MERGE_MAP.items():
        entries = [data_2024[k] for k in old_keys if k in data_2024]
        if not entries:
            print(f"WARN: no 2024 source data for {new_key}")
            continue
        total_students, avg_scores, overall = weighted_merge(entries, SUBJECTS)
        info = PROVINCE_INFO[new_key]
        new_2025[new_key] = {
            "displayName": info["displayName"],
            "region": info["region"],
            "totalStudents": total_students,
            "averageScores": avg_scores,
            "overallAverage": overall,
        }

    print(f"Built 2025 section with {len(new_2025)} provinces")
    return new_2025


def main():
    # 1. Fix vietnam-simplified.geojson
    fixed_geo = fix_geojson(
        "public/vietnam-simplified.geojson",
        "public/vietnam-simplified.geojson"   # overwrite in place
    )

    # 2. Rebuild 34-province GeoJSON with correct merge map
    build_34_geojson(fixed_geo, "public/vietnam-34provinces.geojson")

    # 3. Rebuild 2025 province data
    with open("src/app/dashboard/province-data.json", encoding="utf-8") as f:
        pdata = json.load(f)

    pdata["provinces"]["2025"] = rebuild_2025_data(pdata)

    with open("src/app/dashboard/province-data.json", "w", encoding="utf-8") as f:
        json.dump(pdata, f, ensure_ascii=False, indent=2)

    print("All done!")

    # Verification
    with open("public/vietnam-34provinces.geojson", encoding="utf-8") as f:
        geo34 = json.load(f)
    geo_names = {f["properties"]["name"] for f in geo34["features"]}
    data_keys = set(pdata["provinces"]["2025"].keys())
    mismatch = (geo_names - data_keys) | (data_keys - geo_names)
    if mismatch:
        print(f"MISMATCH: {mismatch}")
    else:
        print(f"Verification OK: {len(geo_names)} provinces match perfectly.")


if __name__ == "__main__":
    main()
