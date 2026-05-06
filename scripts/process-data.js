const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

// ─── FILE PATHS ──────────────────────────────────────────────
const CSV_2023 = path.join(__dirname, '../../diem_thi_thpt_2023.csv');
const CSV_2024 = path.join(__dirname, '../../diem_thi_thpt_2024.csv');
const XLSX_2025 = path.join(__dirname, '../../20250715-ketquathi-ct2018a.xlsx');
const OUT_FILE = path.join(__dirname, '../src/app/dashboard/data.json');

// ─── SUBJECT DEFINITIONS ────────────────────────────────────
// Subjects for 2023/2024 CSV files
const csvSubjects = [
  'toan', 'ngu_van', 'ngoai_ngu', 'vat_li',
  'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li', 'gdcd'
];

// Column mapping for 2025 XLSX (Vietnamese headers → normalized keys)
const xlsx2025Map = {
  'Toán': 'toan',
  'Văn': 'ngu_van',
  'Ngoại ngữ': 'ngoai_ngu',
  'Lí': 'vat_li',
  'Hóa': 'hoa_hoc',
  'Sinh': 'sinh_hoc',
  'Sử': 'lich_su',
  'Địa': 'dia_li',
  'Giáo dục kinh tế và pháp luật': 'gdktpl',
  'Tin học': 'tin_hoc',
  'Công nghệ công nghiệp': 'cong_nghe_cn',
  'Công nghệ nông nghiệp': 'cong_nghe_nn',
};

// All possible subjects across all years
const allSubjects = [
  'toan', 'ngu_van', 'ngoai_ngu', 'vat_li',
  'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li',
  'gdcd', 'gdktpl', 'tin_hoc', 'cong_nghe_cn', 'cong_nghe_nn'
];

// Subject labels (Vietnamese)
const subjectLabels = {
  toan: 'Toán',
  ngu_van: 'Ngữ Văn',
  ngoai_ngu: 'Ngoại Ngữ',
  vat_li: 'Vật Lí',
  hoa_hoc: 'Hóa Học',
  sinh_hoc: 'Sinh Học',
  lich_su: 'Lịch Sử',
  dia_li: 'Địa Lí',
  gdcd: 'GDCD',
  gdktpl: 'GD KT&PL',
  tin_hoc: 'Tin Học',
  cong_nghe_cn: 'CN Công Nghiệp',
  cong_nghe_nn: 'CN Nông Nghiệp',
};

// ─── STATS INITIALIZER ──────────────────────────────────────
function createYearStats(subjects) {
  const stats = {
    totalStudents: 0,
    averageScores: {},
    participants: {},
    sumScores: {},
    distributions: {},
    scoreRanges: {},  // <1 (liệt), >=5, >=8, 9-10
    allScores: {},    // for median/mode/stddev
  };

  subjects.forEach(sub => {
    stats.averageScores[sub] = 0;
    stats.participants[sub] = 0;
    stats.sumScores[sub] = 0;
    stats.distributions[sub] = {};
    for (let i = 0; i <= 10; i++) {
      stats.distributions[sub][i] = 0;
    }
    stats.scoreRanges[sub] = { below1: 0, above5: 0, above8: 0, above9: 0 };
    stats.allScores[sub] = [];
  });

  return stats;
}

function processScore(stats, sub, scoreStr) {
  if (scoreStr === undefined || scoreStr === null || scoreStr === '') return;
  const score = parseFloat(scoreStr);
  if (isNaN(score)) return;

  stats.participants[sub]++;
  stats.sumScores[sub] += score;

  let bin = Math.floor(score);
  if (bin < 0) bin = 0;
  if (bin > 10) bin = 10;
  stats.distributions[sub][bin]++;

  if (score < 1) stats.scoreRanges[sub].below1++;
  if (score >= 5) stats.scoreRanges[sub].above5++;
  if (score >= 8) stats.scoreRanges[sub].above8++;
  if (score >= 9) stats.scoreRanges[sub].above9++;

  stats.allScores[sub].push(score);
}

function finalizeStats(stats) {
  const subjects = Object.keys(stats.participants);
  subjects.forEach(sub => {
    if (stats.participants[sub] > 0) {
      stats.averageScores[sub] = +(stats.sumScores[sub] / stats.participants[sub]).toFixed(2);
    }
  });

  // Compute median, mode, stddev
  stats.statistics = {};
  subjects.forEach(sub => {
    const scores = stats.allScores[sub];
    if (scores.length === 0) {
      stats.statistics[sub] = { median: 0, mode: 0, stddev: 0, min: 0, max: 0 };
      return;
    }
    scores.sort((a, b) => a - b);
    const n = scores.length;
    const median = n % 2 === 0
      ? +((scores[n / 2 - 1] + scores[n / 2]) / 2).toFixed(2)
      : +scores[Math.floor(n / 2)].toFixed(2);

    // Mode (rounded to 0.25)
    const freq = {};
    scores.forEach(s => {
      const rounded = (Math.round(s * 4) / 4).toFixed(2);
      freq[rounded] = (freq[rounded] || 0) + 1;
    });
    let modeVal = 0, modeCount = 0;
    Object.entries(freq).forEach(([val, count]) => {
      if (count > modeCount) { modeCount = count; modeVal = parseFloat(val); }
    });

    // Stddev
    const mean = stats.sumScores[sub] / n;
    const variance = scores.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const stddev = +Math.sqrt(variance).toFixed(2);

    stats.statistics[sub] = {
      median,
      mode: modeVal,
      stddev,
      min: +scores[0].toFixed(2),
      max: +scores[n - 1].toFixed(2),
    };
  });

  // Clean up raw data (too large to store)
  delete stats.allScores;
  delete stats.sumScores;
}

// ─── CSV PROCESSOR ───────────────────────────────────────────
function processCSV(filePath, subjects) {
  return new Promise((resolve, reject) => {
    const stats = createYearStats(subjects);
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        stats.totalStudents++;

        subjects.forEach(sub => {
          processScore(stats, sub, row[sub]);
        });

        if (rowCount % 200000 === 0) {
          console.log(`  ... đã xử lý ${rowCount.toLocaleString()} dòng`);
        }
      })
      .on('end', () => {
        console.log(`  Hoàn tất: ${rowCount.toLocaleString()} dòng`);
        finalizeStats(stats);
        resolve(stats);
      })
      .on('error', reject);
  });
}

// ─── XLSX PROCESSOR ──────────────────────────────────────────
function processXLSX(filePath) {
  console.log('  Đang đọc file XLSX (có thể mất vài giây)...');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['Sheet2'];
  if (!ws) {
    console.error('  Không tìm thấy Sheet2!');
    return createYearStats(Object.values(xlsx2025Map));
  }

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = rows[0];
  const xlsxSubjects = Object.values(xlsx2025Map);
  const stats = createYearStats(xlsxSubjects);

  // Build column index map
  const colMap = {};
  headers.forEach((h, i) => {
    if (xlsx2025Map[h]) {
      colMap[xlsx2025Map[h]] = i;
    }
  });

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    stats.totalStudents++;

    xlsxSubjects.forEach(sub => {
      if (colMap[sub] !== undefined) {
        processScore(stats, sub, row[colMap[sub]]);
      }
    });

    if (r % 50000 === 0) {
      console.log(`  ... đã xử lý ${r.toLocaleString()} dòng`);
    }
  }

  console.log(`  Hoàn tất: ${(rows.length - 1).toLocaleString()} dòng`);
  finalizeStats(stats);
  return stats;
}

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log(' Xử lý dữ liệu điểm thi THPT 2023–2025');
  console.log('═══════════════════════════════════════════════\n');

  // Process 2023
  console.log('📄 [1/3] Đang xử lý CSV 2023...');
  const data2023 = await processCSV(CSV_2023, csvSubjects);

  // Process 2024
  console.log('\n📄 [2/3] Đang xử lý CSV 2024...');
  const data2024 = await processCSV(CSV_2024, csvSubjects);

  // Process 2025
  console.log('\n📊 [3/3] Đang xử lý XLSX 2025...');
  const data2025 = processXLSX(XLSX_2025);

  // Build combined output
  const output = {
    years: {
      '2023': data2023,
      '2024': data2024,
      '2025': data2025,
    },
    subjectLabels,
    metadata: {
      processedAt: new Date().toISOString(),
      csvSubjects,
      xlsxSubjects2025: Object.values(xlsx2025Map),
      commonSubjects: csvSubjects.filter(s =>
        Object.values(xlsx2025Map).includes(s)
      ),
    }
  };

  // Ensure directory exists
  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Đã lưu kết quả tại: ${OUT_FILE}`);

  // Print summary
  console.log('\n═══ TÓM TẮT ═══');
  ['2023', '2024', '2025'].forEach(year => {
    const d = output.years[year];
    console.log(`\n${year}: ${d.totalStudents.toLocaleString()} thí sinh`);
    Object.keys(d.averageScores).forEach(sub => {
      if (d.participants[sub] > 0) {
        console.log(`  ${(subjectLabels[sub] || sub).padEnd(16)} TB: ${d.averageScores[sub]}  (${d.participants[sub].toLocaleString()} bài)`);
      }
    });
  });
}

main().catch(console.error);
