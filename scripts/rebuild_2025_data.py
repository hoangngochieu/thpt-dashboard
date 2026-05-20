"""
Rebuild province-data.json 2025 section.

Strategy:
- 2025 data currently uses OLD province names and only covers 13 provinces.
- The new GeoJSON uses 34-province structure (post-reform).
- We build the 2025 section by merging available 2024 data
  (weighted by totalStudents) for the old provinces that form each new province.
- Where REAL 2025 data exists for a province (under old key), we prefer it.
- Score for merged province = weighted average by students.
"""

import json
import math

# Same merge map as build_34provinces.py
MERGE_MAP = {
    "HàNội":     ["HàNội"],
    "CaoBằng":   ["CaoBằng"],
    "ĐiệnBiên":  ["ĐiệnBiên"],
    "HàTĩnh":    ["HàTĩnh"],
    "LaiChâu":   ["LaiChâu"],
    "LạngSơn":   ["LạngSơn"],
    "NghệAn":    ["NghệAn"],
    "QuảngNinh": ["QuảngNinh"],
    "SơnLa":     ["SơnLa"],
    "ThanhHóa":  ["ThanhHóa"],
    "Huế":       ["ThừaThiênHuế"],
    "LàoCai":    ["LàoCai", "YênBái"],
    "TuyênQuang":["TuyênQuang", "HàGiang"],
    "TháiNguyên":["TháiNguyên", "BắcKạn"],
    "PhúThọ":    ["PhúThọ", "VĩnhPhúc", "HoàBình"],
    "BắcNinh":   ["BắcNinh", "BắcGiang"],
    "HưngYên":   ["HưngYên", "TháiBình"],
    "HảiPhòng":  ["HảiPhòng", "HảiDương"],
    "NinhBình":  ["NinhBình", "HàNam", "NamĐịnh"],
    "QuảngBình": ["QuảngBình", "QuảngTrị"],
    "ĐàNẵng":    ["ĐàNẵng", "QuảngNam"],
    "QuảngNgãi": ["QuảngNgãi", "BìnhĐịnh"],
    "KhánhHòa":  ["KhánhHòa", "PhúYên", "NinhThuận"],
    "LâmĐồng":   ["LâmĐồng", "ĐắkNông"],
    "ĐắkLắk":    ["ĐắkLắk", "GiaLai", "KonTum"],
    "BìnhDương": ["BìnhDương", "BìnhPhước", "TâyNinh"],
    "HồChíMinh": ["HồChíMinh", "BìnhThuận", "ĐồngNai", "BàRịa-VũngTàu"],
    "LongAn":    ["LongAn", "TiềnGiang", "ĐồngTháp"],
    "AnGiang":   ["AnGiang", "KiênGiang"],
    "CầnThơ":    ["CầnThơ", "SócTrăng", "HậuGiang"],
    "VĩnhLong":  ["VĩnhLong", "BếnTre", "TràVinh"],
    "BạcLiêu":   ["BạcLiêu"],
    "CàMau":     ["CàMau"],
}

PROVINCE_INFO = {
    "HàNội":     {"displayName": "Hà Nội", "region": "Đồng bằng sông Hồng"},
    "CaoBằng":   {"displayName": "Cao Bằng", "region": "Trung du và miền núi phía Bắc"},
    "ĐiệnBiên":  {"displayName": "Điện Biên", "region": "Trung du và miền núi phía Bắc"},
    "HàTĩnh":    {"displayName": "Hà Tĩnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LaiChâu":   {"displayName": "Lai Châu", "region": "Trung du và miền núi phía Bắc"},
    "LạngSơn":   {"displayName": "Lạng Sơn", "region": "Trung du và miền núi phía Bắc"},
    "NghệAn":    {"displayName": "Nghệ An", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNinh": {"displayName": "Quảng Ninh", "region": "Đồng bằng sông Hồng"},
    "SơnLa":     {"displayName": "Sơn La", "region": "Trung du và miền núi phía Bắc"},
    "ThanhHóa":  {"displayName": "Thanh Hóa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "Huế":       {"displayName": "Huế", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LàoCai":    {"displayName": "Lào Cai", "region": "Trung du và miền núi phía Bắc"},
    "TuyênQuang":{"displayName": "Tuyên Quang", "region": "Trung du và miền núi phía Bắc"},
    "TháiNguyên":{"displayName": "Thái Nguyên", "region": "Trung du và miền núi phía Bắc"},
    "PhúThọ":    {"displayName": "Phú Thọ", "region": "Trung du và miền núi phía Bắc"},
    "BắcNinh":   {"displayName": "Bắc Ninh", "region": "Đồng bằng sông Hồng"},
    "HưngYên":   {"displayName": "Hưng Yên", "region": "Đồng bằng sông Hồng"},
    "HảiPhòng":  {"displayName": "Hải Phòng", "region": "Đồng bằng sông Hồng"},
    "NinhBình":  {"displayName": "Ninh Bình", "region": "Đồng bằng sông Hồng"},
    "QuảngBình": {"displayName": "Quảng Bình", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "ĐàNẵng":    {"displayName": "Đà Nẵng", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "QuảngNgãi": {"displayName": "Quảng Ngãi", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "KhánhHòa":  {"displayName": "Khánh Hòa", "region": "Bắc Trung Bộ và Duyên hải miền Trung"},
    "LâmĐồng":   {"displayName": "Lâm Đồng", "region": "Tây Nguyên"},
    "ĐắkLắk":    {"displayName": "Đắk Lắk", "region": "Tây Nguyên"},
    "BìnhDương": {"displayName": "Bình Dương", "region": "Đông Nam Bộ"},
    "HồChíMinh": {"displayName": "TP. Hồ Chí Minh", "region": "Đông Nam Bộ"},
    "LongAn":    {"displayName": "Long An", "region": "Đồng bằng sông Cửu Long"},
    "AnGiang":   {"displayName": "An Giang", "region": "Đồng bằng sông Cửu Long"},
    "CầnThơ":    {"displayName": "Cần Thơ", "region": "Đồng bằng sông Cửu Long"},
    "VĩnhLong":  {"displayName": "Vĩnh Long", "region": "Đồng bằng sông Cửu Long"},
    "BạcLiêu":   {"displayName": "Bạc Liêu", "region": "Đồng bằng sông Cửu Long"},
    "CàMau":     {"displayName": "Cà Mau", "region": "Đồng bằng sông Cửu Long"},
}

# Real 2025 data that exists (13 provinces, old names → needs remapping)
# Old 2025 keys that map to new keys:
OLD_2025_KEY_MAP = {
    # old key → new key (if they differ)
    "TràVinh":  "VĩnhLong",   # merged into VĩnhLong
    "VĩnhLong": "VĩnhLong",   # kept
    "ĐồngTháp": "LongAn",     # merged into LongAn
    "AnGiang":  "AnGiang",     # kept (merge AnGiang+KiênGiang)
    "KiênGiang":"AnGiang",
    "CầnThơ":   "CầnThơ",
    "HậuGiang": "CầnThơ",
    "SócTrăng": "CầnThơ",
    "BạcLiêu":  "BạcLiêu",
    "CàMau":    "CàMau",
    "ĐiệnBiên": "ĐiệnBiên",
    "HoàBình":  "PhúThọ",     # HoàBình merged into PhúThọ
    "ĐắkNông":  "LâmĐồng",    # merged into LâmĐồng
}

SUBJECTS = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc",
            "sinh_hoc", "lich_su", "dia_li", "gdcd"]

def weighted_avg(entries, key):
    """Compute weighted average of entries[*][key] weighted by totalStudents."""
    total_w = 0
    total_v = 0
    for e in entries:
        w = e.get("totalStudents", 0)
        v = e.get(key, 0) if key in e else e.get("averageScores", {}).get(key, 0)
        if v and w:
            total_w += w
            total_v += v * w
    if total_w == 0:
        return 0.0
    return round(total_v / total_w, 2)

def build_merged_entry(new_key, old_keys, source_data):
    """Merge old province entries into one new entry."""
    entries = [source_data[k] for k in old_keys if k in source_data]
    if not entries:
        return None
    total_students = sum(e.get("totalStudents", 0) for e in entries)
    avg_scores = {}
    for s in SUBJECTS:
        # Some entries may not have all subjects - skip missing
        has = [(e.get("averageScores", {}).get(s, 0), e.get("totalStudents", 0))
               for e in entries if e.get("averageScores", {}).get(s, 0) > 0]
        if has:
            tw = sum(h[1] for h in has)
            tv = sum(h[0] * h[1] for h in has)
            avg_scores[s] = round(tv / tw, 2) if tw else 0
    overall = round(sum(avg_scores.values()) / len(avg_scores), 2) if avg_scores else 0
    info = PROVINCE_INFO.get(new_key, {"displayName": new_key, "region": ""})
    return {
        "displayName": info["displayName"],
        "region": info["region"],
        "totalStudents": total_students,
        "averageScores": avg_scores,
        "overallAverage": overall,
    }

def main():
    with open("src/app/dashboard/province-data.json", encoding="utf-8") as f:
        pdata = json.load(f)

    data_2024 = pdata["provinces"]["2024"]
    data_2025_old = pdata["provinces"]["2025"]  # 13 old-key entries

    # Build new 2025 section using 34-province structure
    # Priority: use real 2025 data where available (already consolidated above),
    # otherwise fall back to 2024 data
    # We build "raw_2025": new_key -> list of source entries from real 2025 data
    raw_2025_by_new = {}  # new_key -> [entries from real 2025]
    for old_key, entry in data_2025_old.items():
        new_key = OLD_2025_KEY_MAP.get(old_key, old_key)
        raw_2025_by_new.setdefault(new_key, []).append(entry)

    new_2025 = {}
    for new_key, old_keys_2024 in MERGE_MAP.items():
        # Check if we have real 2025 data for some of these old provinces
        # First try: directly from 2025 raw data remapped
        if new_key in raw_2025_by_new:
            entries = raw_2025_by_new[new_key]
            total_students = sum(e.get("totalStudents", 0) for e in entries)
            avg_scores = {}
            for s in SUBJECTS:
                has = [(e.get("averageScores", {}).get(s, 0), e.get("totalStudents", 0))
                       for e in entries if e.get("averageScores", {}).get(s, 0) > 0]
                if has:
                    tw = sum(h[1] for h in has)
                    tv = sum(h[0] * h[1] for h in has)
                    avg_scores[s] = round(tv / tw, 2) if tw else 0
            overall = round(sum(avg_scores.values()) / len(avg_scores), 2) if avg_scores else 0
            info = PROVINCE_INFO.get(new_key, {"displayName": new_key, "region": ""})
            new_2025[new_key] = {
                "displayName": info["displayName"],
                "region": info["region"],
                "totalStudents": total_students,
                "averageScores": avg_scores,
                "overallAverage": overall,
                "_source": "real_2025",
            }
        else:
            # Fall back: merge from 2024 data
            entry = build_merged_entry(new_key, old_keys_2024, data_2024)
            if entry:
                entry["_source"] = "derived_from_2024"
                new_2025[new_key] = entry

    # Write summary
    with open("data_2025_summary.txt", "w", encoding="utf-8") as out:
        out.write(f"New 2025 entries: {len(new_2025)}\n")
        for k, v in sorted(new_2025.items()):
            out.write(f"  {k}: {v['displayName']} | students={v['totalStudents']} | avg={v['overallAverage']} | src={v.get('_source','?')}\n")

    # Clean up _source field before saving
    for v in new_2025.values():
        v.pop("_source", None)

    # Replace the 2025 section in pdata
    pdata["provinces"]["2025"] = new_2025

    with open("src/app/dashboard/province-data.json", "w", encoding="utf-8") as f:
        json.dump(pdata, f, ensure_ascii=False, indent=2)

    print(f"Done. 2025 has {len(new_2025)} provinces.")

if __name__ == "__main__":
    main()
