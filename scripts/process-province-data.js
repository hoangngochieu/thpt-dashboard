const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// ─── FILE PATHS ──────────────────────────────────────────────
const CSV_2023 = path.join(__dirname, '../../diem_thi_thpt_2023.csv');
const CSV_2024 = path.join(__dirname, '../../diem_thi_thpt_2024.csv');
const CSV_2025 = path.join(__dirname, '../../diem_thi_thpt_2025.csv');
const OUT_FILE = path.join(__dirname, '../src/app/dashboard/province-data.json');

// ─── SBD Province Code → Province Name mapping ──────────────
// Based on Vietnam Ministry of Education exam board codes
const provinceCodeMap = {
  '01': 'HàNội',
  '02': 'HồChíMinh',
  '03': 'HảiPhòng',
  '04': 'ĐàNẵng',
  '05': 'HàGiang',
  '06': 'CaoBằng',
  '07': 'LaiChâu',
  '08': 'LàoCai',
  '09': 'TuyênQuang',
  '10': 'LạngSơn',
  '11': 'BắcKạn',
  '12': 'TháiNguyên',
  '13': 'YênBái',
  '14': 'SơnLa',
  '15': 'PhúThọ',
  '16': 'VĩnhPhúc',
  '17': 'QuảngNinh',
  '18': 'BắcGiang',
  '19': 'BắcNinh',
  // 20 is not used
  '21': 'HảiDương',
  '22': 'HưngYên',
  '23': 'HàNam',
  '24': 'NamĐịnh',
  '25': 'TháiBình',
  '26': 'NinhBình',
  '27': 'ThanhHóa',
  '28': 'NghệAn',
  '29': 'HàTĩnh',
  '30': 'QuảngBình',
  '31': 'QuảngTrị',
  '32': 'ThừaThiênHuế',
  '33': 'QuảngNam',
  '34': 'QuảngNgãi',
  '35': 'KonTum',
  '36': 'GiaLai',
  '37': 'BìnhĐịnh',
  '38': 'PhúYên',
  '39': 'ĐắkLắk',
  '40': 'KhánhHòa',
  '41': 'LâmĐồng',
  '42': 'BìnhPhước',
  '43': 'BìnhDương',
  '44': 'NinhThuận',
  '45': 'TâyNinh',
  '46': 'BìnhThuận',
  '47': 'ĐồngNai',
  '48': 'BàRịa-VũngTàu',
  '49': 'LongAn',
  '50': 'TiềnGiang',
  '51': 'BếnTre',
  '52': 'TràVinh',
  '53': 'VĩnhLong',
  '54': 'ĐồngTháp',
  '55': 'AnGiang',
  '56': 'KiênGiang',
  '57': 'CầnThơ',
  '58': 'HậuGiang',
  '59': 'SócTrăng',
  '60': 'BạcLiêu',
  '61': 'CàMau',
  '62': 'ĐiệnBiên',
  '63': 'HoàBình',
  '64': 'ĐắkNông',
};

// Province to region mapping
const provinceRegionMap = {
  'HàNội': 'Đồng bằng sông Hồng',
  'HồChíMinh': 'Đông Nam Bộ',
  'HảiPhòng': 'Đồng bằng sông Hồng',
  'ĐàNẵng': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'HàGiang': 'Trung du và miền núi phía Bắc',
  'CaoBằng': 'Trung du và miền núi phía Bắc',
  'LaiChâu': 'Trung du và miền núi phía Bắc',
  'LàoCai': 'Trung du và miền núi phía Bắc',
  'TuyênQuang': 'Trung du và miền núi phía Bắc',
  'LạngSơn': 'Trung du và miền núi phía Bắc',
  'BắcKạn': 'Trung du và miền núi phía Bắc',
  'TháiNguyên': 'Trung du và miền núi phía Bắc',
  'YênBái': 'Trung du và miền núi phía Bắc',
  'SơnLa': 'Trung du và miền núi phía Bắc',
  'PhúThọ': 'Trung du và miền núi phía Bắc',
  'VĩnhPhúc': 'Đồng bằng sông Hồng',
  'QuảngNinh': 'Đồng bằng sông Hồng',
  'BắcGiang': 'Trung du và miền núi phía Bắc',
  'BắcNinh': 'Đồng bằng sông Hồng',
  'HảiDương': 'Đồng bằng sông Hồng',
  'HưngYên': 'Đồng bằng sông Hồng',
  'HàNam': 'Đồng bằng sông Hồng',
  'NamĐịnh': 'Đồng bằng sông Hồng',
  'TháiBình': 'Đồng bằng sông Hồng',
  'NinhBình': 'Đồng bằng sông Hồng',
  'ThanhHóa': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'NghệAn': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'HàTĩnh': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'QuảngBình': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'QuảngTrị': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'ThừaThiênHuế': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'QuảngNam': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'QuảngNgãi': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'KonTum': 'Tây Nguyên',
  'GiaLai': 'Tây Nguyên',
  'BìnhĐịnh': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'PhúYên': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'ĐắkLắk': 'Tây Nguyên',
  'KhánhHòa': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'LâmĐồng': 'Tây Nguyên',
  'BìnhPhước': 'Đông Nam Bộ',
  'BìnhDương': 'Đông Nam Bộ',
  'NinhThuận': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'TâyNinh': 'Đông Nam Bộ',
  'BìnhThuận': 'Bắc Trung Bộ và Duyên hải miền Trung',
  'ĐồngNai': 'Đông Nam Bộ',
  'BàRịa-VũngTàu': 'Đông Nam Bộ',
  'LongAn': 'Đồng bằng sông Cửu Long',
  'TiềnGiang': 'Đồng bằng sông Cửu Long',
  'BếnTre': 'Đồng bằng sông Cửu Long',
  'TràVinh': 'Đồng bằng sông Cửu Long',
  'VĩnhLong': 'Đồng bằng sông Cửu Long',
  'ĐồngTháp': 'Đồng bằng sông Cửu Long',
  'AnGiang': 'Đồng bằng sông Cửu Long',
  'KiênGiang': 'Đồng bằng sông Cửu Long',
  'CầnThơ': 'Đồng bằng sông Cửu Long',
  'HậuGiang': 'Đồng bằng sông Cửu Long',
  'SócTrăng': 'Đồng bằng sông Cửu Long',
  'BạcLiêu': 'Đồng bằng sông Cửu Long',
  'CàMau': 'Đồng bằng sông Cửu Long',
  'ĐiệnBiên': 'Trung du và miền núi phía Bắc',
  'HoàBình': 'Trung du và miền núi phía Bắc',
  'ĐắkNông': 'Tây Nguyên',
};

// Human-readable province names
const provinceDisplayNames = {
  'HàNội': 'Hà Nội',
  'HồChíMinh': 'TP. Hồ Chí Minh',
  'HảiPhòng': 'Hải Phòng',
  'ĐàNẵng': 'Đà Nẵng',
  'HàGiang': 'Hà Giang',
  'CaoBằng': 'Cao Bằng',
  'LaiChâu': 'Lai Châu',
  'LàoCai': 'Lào Cai',
  'TuyênQuang': 'Tuyên Quang',
  'LạngSơn': 'Lạng Sơn',
  'BắcKạn': 'Bắc Kạn',
  'TháiNguyên': 'Thái Nguyên',
  'YênBái': 'Yên Bái',
  'SơnLa': 'Sơn La',
  'PhúThọ': 'Phú Thọ',
  'VĩnhPhúc': 'Vĩnh Phúc',
  'QuảngNinh': 'Quảng Ninh',
  'BắcGiang': 'Bắc Giang',
  'BắcNinh': 'Bắc Ninh',
  'HảiDương': 'Hải Dương',
  'HưngYên': 'Hưng Yên',
  'HàNam': 'Hà Nam',
  'NamĐịnh': 'Nam Định',
  'TháiBình': 'Thái Bình',
  'NinhBình': 'Ninh Bình',
  'ThanhHóa': 'Thanh Hóa',
  'NghệAn': 'Nghệ An',
  'HàTĩnh': 'Hà Tĩnh',
  'QuảngBình': 'Quảng Bình',
  'QuảngTrị': 'Quảng Trị',
  'ThừaThiênHuế': 'Thừa Thiên Huế',
  'QuảngNam': 'Quảng Nam',
  'QuảngNgãi': 'Quảng Ngãi',
  'KonTum': 'Kon Tum',
  'GiaLai': 'Gia Lai',
  'BìnhĐịnh': 'Bình Định',
  'PhúYên': 'Phú Yên',
  'ĐắkLắk': 'Đắk Lắk',
  'KhánhHòa': 'Khánh Hòa',
  'LâmĐồng': 'Lâm Đồng',
  'BìnhPhước': 'Bình Phước',
  'BìnhDương': 'Bình Dương',
  'NinhThuận': 'Ninh Thuận',
  'TâyNinh': 'Tây Ninh',
  'BìnhThuận': 'Bình Thuận',
  'ĐồngNai': 'Đồng Nai',
  'BàRịa-VũngTàu': 'Bà Rịa-Vũng Tàu',
  'LongAn': 'Long An',
  'TiềnGiang': 'Tiền Giang',
  'BếnTre': 'Bến Tre',
  'TràVinh': 'Trà Vinh',
  'VĩnhLong': 'Vĩnh Long',
  'ĐồngTháp': 'Đồng Tháp',
  'AnGiang': 'An Giang',
  'KiênGiang': 'Kiên Giang',
  'CầnThơ': 'Cần Thơ',
  'HậuGiang': 'Hậu Giang',
  'SócTrăng': 'Sóc Trăng',
  'BạcLiêu': 'Bạc Liêu',
  'CàMau': 'Cà Mau',
  'ĐiệnBiên': 'Điện Biên',
  'HoàBình': 'Hòa Bình',
  'ĐắkNông': 'Đắk Nông',
};

const csvSubjects = [
  'toan', 'ngu_van', 'ngoai_ngu', 'vat_li',
  'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li', 'gdcd'
];



// ─── Province Stats Aggregator ──────────────────────────────
function createProvinceAggregator() {
  return {}; // province -> { count, sumScores: { sub: total }, participants: { sub: count } }
}

function addToProvince(agg, provinceName, subjects, row, getScore) {
  if (!provinceName) return;
  if (!agg[provinceName]) {
    agg[provinceName] = { count: 0, sumScores: {}, participants: {} };
    subjects.forEach(s => { agg[provinceName].sumScores[s] = 0; agg[provinceName].participants[s] = 0; });
  }
  agg[provinceName].count++;
  subjects.forEach(sub => {
    const scoreStr = getScore(row, sub);
    if (scoreStr === undefined || scoreStr === null || scoreStr === '') return;
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return;
    agg[provinceName].participants[sub]++;
    agg[provinceName].sumScores[sub] += score;
  });
}

function finalizeProvinceData(agg, subjects) {
  const result = {};
  Object.entries(agg).forEach(([province, data]) => {
    const averageScores = {};
    subjects.forEach(sub => {
      if (data.participants[sub] > 0) {
        averageScores[sub] = +(data.sumScores[sub] / data.participants[sub]).toFixed(2);
      }
    });
    // Compute overall average across subjects that have participants
    const scoredSubjects = subjects.filter(s => data.participants[s] > 0);
    const overallAvg = scoredSubjects.length > 0
      ? +(scoredSubjects.reduce((s, sub) => s + averageScores[sub], 0) / scoredSubjects.length).toFixed(2)
      : 0;

    result[province] = {
      displayName: provinceDisplayNames[province] || province,
      region: provinceRegionMap[province] || 'Khác',
      totalStudents: data.count,
      averageScores,
      overallAverage: overallAvg,
    };
  });
  return result;
}

// ─── CSV Province Processor ─────────────────────────────────
function processCSVByProvince(filePath, subjects) {
  return new Promise((resolve, reject) => {
    const agg = createProvinceAggregator();
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        const code = row.sbd?.substring(0, 2);
        const province = provinceCodeMap[code];
        addToProvince(agg, province, subjects, row, (r, sub) => r[sub]);

        if (rowCount % 200000 === 0) {
          console.log(`  ... đã xử lý ${rowCount.toLocaleString()} dòng`);
        }
      })
      .on('end', () => {
        console.log(`  Hoàn tất: ${rowCount.toLocaleString()} dòng`);
        resolve(finalizeProvinceData(agg, subjects));
      })
      .on('error', reject);
  });
}



// ─── MAIN ───────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log(' Xử lý dữ liệu theo tỉnh/thành');
  console.log('═══════════════════════════════════════════════\n');

  console.log('📄 [1/3] CSV 2023...');
  const prov2023 = await processCSVByProvince(CSV_2023, csvSubjects);

  console.log('\n📄 [2/3] CSV 2024...');
  const prov2024 = await processCSVByProvince(CSV_2024, csvSubjects);

  console.log('\n📄 [3/3] CSV 2025...');
  const prov2025 = await processCSVByProvince(CSV_2025, csvSubjects);

  const output = {
    provinces: {
      '2023': prov2023,
      '2024': prov2024,
      '2025': prov2025,
    },
    provinceDisplayNames,
    regionMap: provinceRegionMap,
  };

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Đã lưu: ${OUT_FILE}`);

  // Summary
  ['2023', '2024', '2025'].forEach(year => {
    const provinces = Object.keys(output.provinces[year]);
    console.log(`\n${year}: ${provinces.length} tỉnh/thành`);
    const sorted = provinces.sort((a, b) =>
      (output.provinces[year][b].overallAverage || 0) - (output.provinces[year][a].overallAverage || 0)
    );
    sorted.slice(0, 5).forEach((p, i) => {
      const d = output.provinces[year][p];
      console.log(`  ${i+1}. ${d.displayName.padEnd(20)} TB: ${d.overallAverage}  (${d.totalStudents.toLocaleString()} TS)`);
    });
  });
}

main().catch(console.error);
