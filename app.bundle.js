/* KLT Smart Lubrication Calculator - compiled bundle (offline) */
/* ===== module: bearing-data ===== */
(function(){
"use strict";
// ============================================================
// KLT Smart Lubrication Calculator — Bearing Data & Logic
// ISO 15 / 355 표준 형번 체계 기반
// ============================================================

// ─── 1. 보조 기호 (앞) — 재질/특수 형태 ───
const PREFIXES = [{
  code: "",
  ko: "표준 (Cr강)",
  en: "Standard (Cr steel)",
  desc: "일반 베어링강"
}, {
  code: "S",
  ko: "스테인리스",
  en: "Stainless",
  desc: "내식성 / 식품·의료"
}, {
  code: "F",
  ko: "플랜지형",
  en: "Flanged",
  desc: "플랜지 외륜"
}, {
  code: "HC",
  ko: "세라믹 하이브리드",
  en: "Ceramic hybrid",
  desc: "고속·저마찰"
}];

// ─── 2. 기본 번호 — 베어링 형식 ───
const BEARING_TYPES = [{
  code: "6",
  ko: "깊은홈 볼",
  en: "Deep Groove Ball",
  load: "radial",
  factor: 1.0,
  popular: true,
  desc: "가장 표준. KLT 주유기 설치 1순위"
}, {
  code: "7",
  ko: "앵귤러 볼",
  en: "Angular Contact Ball",
  load: "combined",
  factor: 1.1,
  popular: true,
  desc: "축·반경방향 복합하중 / 공작기계"
}, {
  code: "N",
  ko: "원통 롤러 (외륜턱)",
  en: "Cylindrical Roller (N)",
  load: "radial",
  factor: 1.3,
  popular: true,
  desc: "고하중 반경방향"
}, {
  code: "NU",
  ko: "원통 롤러 (외륜턱無)",
  en: "Cylindrical Roller (NU)",
  load: "radial",
  factor: 1.3,
  popular: false,
  desc: "축방향 자유"
}, {
  code: "5",
  ko: "스러스트 볼",
  en: "Thrust Ball",
  load: "axial",
  factor: 1.5,
  popular: false,
  desc: "축방향 하중 전용"
}, {
  code: "2",
  ko: "구면 롤러",
  en: "Spherical Roller",
  load: "radial",
  factor: 1.6,
  popular: false,
  desc: "자동조심 / 중하중"
}, {
  code: "3",
  ko: "테이퍼 롤러",
  en: "Tapered Roller",
  load: "combined",
  factor: 1.4,
  popular: false,
  desc: "허브·기어박스"
}];

// ─── 3. 기본 번호 — 치수 계열 (폭+직경) ───
const DIAMETER_SERIES = [{
  code: "0",
  ko: "초경량",
  en: "Extra Light",
  ratio: 0.55
}, {
  code: "1",
  ko: "초경하중",
  en: "Light",
  ratio: 0.65
}, {
  code: "2",
  ko: "경하중",
  en: "Light/Medium",
  ratio: 0.78,
  popular: true
}, {
  code: "3",
  ko: "중하중",
  en: "Medium",
  ratio: 0.92,
  popular: true
}, {
  code: "4",
  ko: "초중하중",
  en: "Heavy",
  ratio: 1.10
}];

// ─── 4. 내경번호 → 실제 내경(mm) ───
function boreToMM(boreCode) {
  // 00=10, 01=12, 02=15, 03=17, 04~ = code*5
  const n = parseInt(boreCode, 10);
  if (n === 0) return 10;
  if (n === 1) return 12;
  if (n === 2) return 15;
  if (n === 3) return 17;
  return n * 5;
}
const BORE_NUMBERS = (() => {
  const arr = [];
  for (let i = 0; i <= 40; i++) {
    const code = String(i).padStart(2, "0");
    arr.push({
      code,
      mm: boreToMM(code),
      popular: [4, 8, 10, 12, 15, 20].includes(i)
    });
  }
  return arr;
})();

// ─── 5. 밀봉 (Seals) ───
const SEALS = [{
  code: "",
  ko: "개방형",
  en: "Open",
  autoLube: "ideal",
  desc: "자동주유기 최적"
}, {
  code: "Z",
  ko: "한쪽 금속실드",
  en: "1-side metal shield",
  autoLube: "good",
  desc: "한쪽 개방→ 주유 가능"
}, {
  code: "ZZ",
  ko: "양쪽 금속실드",
  en: "2-side metal shield",
  autoLube: "limited",
  desc: "내부 그리스 봉입형"
}, {
  code: "DDU",
  ko: "양쪽 고무실",
  en: "2-side rubber seal",
  autoLube: "no",
  desc: "비접촉 주유기 부적합"
}, {
  code: "VV",
  ko: "비접촉 고무실",
  en: "Non-contact rubber",
  autoLube: "limited",
  desc: "조건부 가능"
}];

// ─── 6. 내부 간극 ───
const CLEARANCE = [{
  code: "C2",
  ko: "작음",
  en: "Small",
  factor: 0.95
}, {
  code: "",
  ko: "표준",
  en: "Standard",
  factor: 1.00,
  popular: true
}, {
  code: "C3",
  ko: "큼",
  en: "Large",
  factor: 1.10,
  popular: true,
  desc: "고온·고속"
}, {
  code: "C4",
  ko: "더 큼",
  en: "Extra Large",
  factor: 1.20
}];

// ─── 7. 정밀도 ───
const PRECISION = [{
  code: "P0",
  ko: "표준 등급",
  en: "Normal",
  factor: 1.00,
  popular: true
}, {
  code: "P6",
  ko: "정밀",
  en: "Precision",
  factor: 0.95
}, {
  code: "P5",
  ko: "고정밀",
  en: "High Prec.",
  factor: 0.90
}, {
  code: "P4",
  ko: "초정밀",
  en: "Ultra Prec.",
  factor: 0.85
}];

// ─── 베어링 규격 계산 (ISO 표준 추정식) ───
// 외경 D, 폭 B는 형식·치수계열·내경에 따라 결정.
// 실제 카탈로그값에 매우 근접한 추정공식을 사용.
function computeDimensions(typeCode, seriesCode, boreCode) {
  const d = boreToMM(boreCode);
  const series = DIAMETER_SERIES.find(s => s.code === seriesCode) || DIAMETER_SERIES[2];
  const type = BEARING_TYPES.find(t => t.code === typeCode) || BEARING_TYPES[0];

  // 외경 D ≈ d + (d * series.ratio) + 형식별 가산
  let typeBoost = 0;
  if (type.code === "N" || type.code === "NU" || type.code === "2" || type.code === "3") typeBoost = 4;
  if (type.code === "5") typeBoost = -2;
  let D = Math.round(d + d * series.ratio + typeBoost);
  // 폭 B ≈ (D-d)/2 * 폭계수
  let widthFactor = 0.55;
  if (type.code === "N" || type.code === "NU") widthFactor = 0.75;
  if (type.code === "2") widthFactor = 0.85;
  if (type.code === "3") widthFactor = 0.65;
  if (type.code === "5") widthFactor = 0.40;
  if (type.code === "7") widthFactor = 0.50;
  let B = Math.round((D - d) / 2 * widthFactor);
  if (B < 5) B = 5;
  return {
    d,
    D,
    B
  };
}

// ─── 잘 알려진 카탈로그 값 보정 (정확도 향상용) ───
const KNOWN_DIMS = {
  "6204": {
    d: 20,
    D: 47,
    B: 14
  },
  "6205": {
    d: 25,
    D: 52,
    B: 15
  },
  "6206": {
    d: 30,
    D: 62,
    B: 16
  },
  "6207": {
    d: 35,
    D: 72,
    B: 17
  },
  "6208": {
    d: 40,
    D: 80,
    B: 18
  },
  "6209": {
    d: 45,
    D: 85,
    B: 19
  },
  "6210": {
    d: 50,
    D: 90,
    B: 20
  },
  "6211": {
    d: 55,
    D: 100,
    B: 21
  },
  "6212": {
    d: 60,
    D: 110,
    B: 22
  },
  "6213": {
    d: 65,
    D: 120,
    B: 23
  },
  "6214": {
    d: 70,
    D: 125,
    B: 24
  },
  "6215": {
    d: 75,
    D: 130,
    B: 25
  },
  "6216": {
    d: 80,
    D: 140,
    B: 26
  },
  "6304": {
    d: 20,
    D: 52,
    B: 15
  },
  "6305": {
    d: 25,
    D: 62,
    B: 17
  },
  "6306": {
    d: 30,
    D: 72,
    B: 19
  },
  "6307": {
    d: 35,
    D: 80,
    B: 21
  },
  "6308": {
    d: 40,
    D: 90,
    B: 23
  },
  "6309": {
    d: 45,
    D: 100,
    B: 25
  },
  "6310": {
    d: 50,
    D: 110,
    B: 27
  },
  "6311": {
    d: 55,
    D: 120,
    B: 29
  },
  "6312": {
    d: 60,
    D: 130,
    B: 31
  },
  "7206": {
    d: 30,
    D: 62,
    B: 16
  },
  "7208": {
    d: 40,
    D: 80,
    B: 18
  },
  "7212": {
    d: 60,
    D: 110,
    B: 22
  },
  "NU206": {
    d: 30,
    D: 62,
    B: 16
  },
  "NU208": {
    d: 40,
    D: 80,
    B: 18
  },
  "NU212": {
    d: 60,
    D: 110,
    B: 22
  },
  "N206": {
    d: 30,
    D: 62,
    B: 16
  },
  "N212": {
    d: 60,
    D: 110,
    B: 22
  }
};
function getDimensions(typeCode, seriesCode, boreCode) {
  const key = `${typeCode}${seriesCode}${boreCode}`;
  if (KNOWN_DIMS[key]) return {
    ...KNOWN_DIMS[key],
    known: true
  };
  return {
    ...computeDimensions(typeCode, seriesCode, boreCode),
    known: false
  };
}

// ─── 표준 형번 문자열 조립 ───
function buildDesignation({
  prefix,
  type,
  series,
  bore,
  seal,
  clearance,
  precision
}) {
  return [prefix, `${type}${series}${bore}`, seal, clearance, precision === "P0" ? "" : precision].filter(Boolean).join(" ").trim();
}

// ─── 환경 계수 ───
const ENV_DUST = [{
  code: "low",
  ko: "청정",
  en: "Clean",
  factor: 1.0
}, {
  code: "med",
  ko: "보통",
  en: "Normal",
  factor: 1.3
}, {
  code: "high",
  ko: "분진",
  en: "Dusty",
  factor: 1.7
}, {
  code: "extreme",
  ko: "극심",
  en: "Extreme",
  factor: 2.2
}];
const ENV_HUMID = [{
  code: "dry",
  ko: "건조",
  en: "Dry",
  factor: 1.0
}, {
  code: "norm",
  ko: "보통",
  en: "Normal",
  factor: 1.1
}, {
  code: "wet",
  ko: "고습/수분",
  en: "Wet",
  factor: 1.5
}];
const ENV_VIB = [{
  code: "low",
  ko: "낮음",
  en: "Low",
  factor: 1.0
}, {
  code: "med",
  ko: "보통",
  en: "Medium",
  factor: 1.2
}, {
  code: "high",
  ko: "충격",
  en: "Heavy",
  factor: 1.5
}];
const ORIENTATION = [{
  code: "horiz",
  ko: "수평축",
  en: "Horizontal",
  factor: 1.0
}, {
  code: "vert",
  ko: "수직축",
  en: "Vertical",
  factor: 1.3
}];

// ─── 핵심 계산 로직 ───
// 1. 베어링 그리스 충진량 G (g) = 0.005 × D × B  (SKF 표준식)
// 2. 보충 주기 T (h) = k × 14×10^6 / (n × √d) ; k는 형식·환경 보정
// 3. 1회 보충량 Gp (g) ≈ 0.005 × D × B × 0.3  (충진량의 30%, 일반식)
// 4. 1일 급유량 (cc/day) = Gp / T × hoursPerDay × 1.05(g→cc 환산 ≈ 그리스 비중 0.95)
function calcLubrication(input) {
  const {
    dims,
    type,
    clearance,
    seal,
    rpm,
    hoursPerDay,
    tempC,
    dust,
    humid,
    vib,
    orientation,
    safety
  } = input;
  const {
    d,
    D,
    B
  } = dims;

  // 충진량 G (g)
  const G = 0.005 * D * B;

  // 형식 계수 (보충 주기에 적용)
  const typeObj = BEARING_TYPES.find(t => t.code === type) || BEARING_TYPES[0];
  let k = 1 / typeObj.factor;

  // 온도 보정 — 70°C 초과시 매 15°C당 절반
  let tempFactor = 1.0;
  if (tempC > 70) {
    const over = tempC - 70;
    tempFactor = Math.pow(0.5, over / 15);
  } else if (tempC < 20) {
    tempFactor = 1.1;
  }

  // 환경 계수
  const dustObj = ENV_DUST.find(e => e.code === dust) || ENV_DUST[1];
  const humidObj = ENV_HUMID.find(e => e.code === humid) || ENV_HUMID[1];
  const vibObj = ENV_VIB.find(e => e.code === vib) || ENV_VIB[0];
  const orObj = ORIENTATION.find(e => e.code === orientation) || ORIENTATION[0];
  const clObj = CLEARANCE.find(c => c.code === clearance) || CLEARANCE[1];
  const envFactor = dustObj.factor * humidObj.factor * vibObj.factor * orObj.factor * clObj.factor;

  // 보충 주기 T (시간)
  const baseT = 14_000_000 / (Math.max(rpm, 1) * Math.sqrt(Math.max(d, 1)));
  let T_hours = baseT * k * tempFactor / envFactor;
  // 안전계수: 1.0=표준, <1=보수(주기↓), >1=공격(주기↑)
  T_hours = T_hours / Math.max(safety, 0.5);

  // 1회 보충량 Gp (g) — 충진량의 30%
  const Gp = G * 0.30;

  // 1회 보충량(cc) — 그리스 비중 ≈ 0.90 g/cc → cc = g / 0.90
  const GpCC = Gp / 0.90;

  // 일일 급유량 (cc/day) = (1회 보충량 cc / 보충주기 일) × 운전시간비율
  const T_days = T_hours / 24;
  const dailyDosesPerDay = hoursPerDay / 24 / Math.max(T_days, 0.0001);
  const ccPerDay = GpCC * dailyDosesPerDay;

  // 보충 주기를 운전기준으로 환산 (월)
  const T_runHours = T_hours;
  const realDaysToReplenish = T_runHours / Math.max(hoursPerDay, 0.1);
  const T_months = realDaysToReplenish / 30;

  // 밀봉 경고
  const sealObj = SEALS.find(s => s.code === seal) || SEALS[0];
  return {
    G_grease_g: G,
    G_grease_cc: G / 0.90,
    Gp_g: Gp,
    Gp_cc: GpCC,
    T_hours,
    T_days,
    T_months,
    ccPerDay,
    gPerDay: ccPerDay * 0.90,
    realDaysToReplenish,
    sealWarning: sealObj.autoLube,
    factors: {
      type: typeObj.factor,
      temp: tempFactor,
      env: envFactor,
      clearance: clObj.factor,
      safety
    }
  };
}

// ─── Pulsarlube 제품 라인업 ───
const PULSARLUBE_MODELS = [
// M — 기계식 (단일 포인트)
{
  series: "M",
  capacity: 60,
  ko: "M 60ml",
  en: "M 60ml",
  type: "mechanical",
  ex: false
}, {
  series: "M",
  capacity: 125,
  ko: "M 125ml",
  en: "M 125ml",
  type: "mechanical",
  ex: false
}, {
  series: "M",
  capacity: 250,
  ko: "M 250ml",
  en: "M 250ml",
  type: "mechanical",
  ex: false
}, {
  series: "M",
  capacity: 500,
  ko: "M 500ml",
  en: "M 500ml",
  type: "mechanical",
  ex: false
},
// EXPL — 방폭형
{
  series: "EXPL",
  capacity: 60,
  ko: "EXPL 60ml",
  en: "EXPL 60ml",
  type: "ex",
  ex: true
}, {
  series: "EXPL",
  capacity: 120,
  ko: "EXPL 120ml",
  en: "EXPL 120ml",
  type: "ex",
  ex: true
}, {
  series: "EXPL",
  capacity: 240,
  ko: "EXPL 240ml",
  en: "EXPL 240ml",
  type: "ex",
  ex: true
}, {
  series: "EXPL",
  capacity: 480,
  ko: "EXPL 480ml",
  en: "EXPL 480ml",
  type: "ex",
  ex: true
}];

// 제품 추천: 1일 급유량 → 6개월 사용량 → 적정 용량 매칭
function recommendPulsarlube(ccPerDay, vibCode, dustCode, requireEx = false) {
  const yearCC = ccPerDay * 365;
  const sixMonthCC = ccPerDay * 180;
  const targetCC = sixMonthCC; // 6개월 1회 교체 권장

  // 방폭(ATEX) 환경이면 EXPL, 아니면 M 라인업
  let candidates = PULSARLUBE_MODELS.filter(m => requireEx ? m.ex : !m.ex);
  candidates = [...candidates].sort((a, b) => a.capacity - b.capacity);

  // 목표 용량 이상인 가장 작은 모델 (없으면 최대 용량)
  let primary = candidates.find(m => m.capacity >= targetCC) || candidates[candidates.length - 1];
  if (!primary) primary = PULSARLUBE_MODELS[0];

  // 대체 옵션: 같은 라인업에서 용량이 가까운 2개
  const alts = candidates.filter(m => m !== primary).sort((a, b) => Math.abs(a.capacity - primary.capacity) - Math.abs(b.capacity - primary.capacity)).slice(0, 2);
  const monthsAtCapacity = primary.capacity / Math.max(ccPerDay, 0.001) / 30;
  return {
    primary,
    alts,
    monthsAtCapacity,
    yearCC,
    sixMonthCC
  };
}

// 표준 베어링: 6212 ZZ C3 (KLT 영업 현장 1순위)
const DEFAULT_INPUT = {
  prefix: "",
  type: "6",
  series: "2",
  bore: "12",
  seal: "ZZ",
  clearance: "C3",
  precision: "P0",
  rpm: 1500,
  hoursPerDay: 16,
  tempC: 65,
  dust: "med",
  humid: "norm",
  vib: "low",
  orientation: "horiz",
  safety: 1.0,
  requireEx: false
};
window.KLT = {
  PREFIXES,
  BEARING_TYPES,
  DIAMETER_SERIES,
  BORE_NUMBERS,
  SEALS,
  CLEARANCE,
  PRECISION,
  ENV_DUST,
  ENV_HUMID,
  ENV_VIB,
  ORIENTATION,
  PULSARLUBE_MODELS,
  boreToMM,
  getDimensions,
  buildDesignation,
  calcLubrication,
  recommendPulsarlube,
  DEFAULT_INPUT
};

})();

/* ===== module: i18n ===== */
(function(){
"use strict";
// ============================================================
// KLT 스마트 윤활 계산기 — i18n 사전
// ============================================================
const I18N = {
  ko: {
    appName: "KLT 스마트 윤활 계산기",
    tagline: "ISO 표준 형번 기반 베어링 자동급유 설계",
    step1: "1 · 베어링 형번 구성",
    step2: "2 · 운전 조건",
    step3: "3 · 결과 리포트",
    next: "다음 단계",
    back: "뒤로",
    recalc: "다시 계산",
    designation: "선택된 형번",
    dimensions: "베어링 규격",
    inner: "내경 (d)",
    outer: "외경 (D)",
    width: "폭 (B)",
    bore: "내경 번호",
    type: "형식 (Type)",
    series: "치수 계열",
    seal: "밀봉 (Seal)",
    clearance: "내부 간극",
    precision: "정밀도",
    prefix: "재질/접두사",
    rpm: "회전수",
    hours: "운전 시간",
    tempC: "운전 온도",
    env: "환경 계수",
    dust: "분진/오염도",
    humid: "습도",
    vib: "진동/충격",
    orientation: "축 방향",
    safety: "안전계수",
    safetyConservative: "보수적",
    safetyStandard: "표준",
    safetyAggressive: "공격적",
    requireEx: "방폭 환경 (ATEX)",
    perDay: "1일 권장 급유량",
    period: "보충 주기",
    productPick: "추천 Pulsarlube",
    capacity: "충진량",
    refillOnce: "1회 보충량",
    runHours: "유효 작동 시간",
    settingDose: "주유기 설정",
    timeline: "교체 타임라인",
    factors: "보정 계수 분해",
    factorType: "형식",
    factorTemp: "온도",
    factorEnv: "환경",
    factorClear: "간극",
    factorSafety: "안전",
    altModels: "대체 옵션",
    monthsCoverage: "1회 충전 운용",
    sealNote: "밀봉 검토",
    sealOK: "자동주유기 호환 — 권장",
    sealLimited: "조건부 호환 — 비접촉형 확인 필요",
    sealNoOK: "자동주유기 부적합 — 개방형/한쪽 실드 권장",
    sealIdeal: "최적 호환 — 자동주유기 효과 극대화",
    months: "개월",
    days: "일",
    hoursUnit: "시간",
    rpmUnit: "RPM",
    cc: "cc",
    ccPerDay: "cc/일",
    g: "g",
    mm: "mm",
    deg: "°C",
    popular: "표준",
    knownDim: "카탈로그 일치",
    estimatedDim: "ISO 추정",
    knobsTitle: "표시 옵션",
    decimals: "소수점 자릿수",
    units: "단위",
    unitCC: "cc (체적)",
    unitG: "g (중량)",
    lang: "언어",
    summary: "요약",
    detail: "상세",
    print: "리포트 출력",
    customer: "고객사",
    application: "적용 설비",
    notes: "비고",
    spec: "사양",
    config: "구성",
    runEnv: "운전 환경",
    advanced: "세부 설정",
    sealAutoIdeal: "최적",
    sealAutoGood: "양호",
    sealAutoLimited: "조건부",
    sealAutoNo: "부적합",
    quickPresets: "빠른 프리셋",
    manualEntry: "형번 직접 입력",
    manualPlaceholder: "예: 6212 ZZ C3",
    manualHint: "형번을 입력하면 자동으로 채워집니다",
    manualOk: "인식됨",
    manualErr: "형번을 인식할 수 없습니다",
    presetStandard: "표준 설비 (6212 ZZ C3)",
    presetMotor: "모터 (6308 C3)",
    presetGearbox: "감속기 (NU212)",
    presetMachineTool: "공작기계 (7208)"
  },
  en: {
    appName: "KLT Smart Lubrication Calculator",
    tagline: "ISO designation–based auto-lubrication sizing",
    step1: "1 · Bearing Designation",
    step2: "2 · Operating Conditions",
    step3: "3 · Report",
    next: "Next",
    back: "Back",
    recalc: "Recalculate",
    designation: "Designation",
    dimensions: "Bearing dimensions",
    inner: "Bore (d)",
    outer: "OD (D)",
    width: "Width (B)",
    bore: "Bore code",
    type: "Type",
    series: "Diameter series",
    seal: "Seal",
    clearance: "Clearance",
    precision: "Precision",
    prefix: "Material / prefix",
    rpm: "Rotational speed",
    hours: "Run hours",
    tempC: "Operating temperature",
    env: "Environment",
    dust: "Dust / contamination",
    humid: "Humidity",
    vib: "Vibration / shock",
    orientation: "Shaft orientation",
    safety: "Safety factor",
    safetyConservative: "Conservative",
    safetyStandard: "Standard",
    safetyAggressive: "Aggressive",
    requireEx: "ATEX explosive zone",
    perDay: "Daily grease feed",
    period: "Replenish cycle",
    productPick: "Recommended Pulsarlube",
    capacity: "Initial fill",
    refillOnce: "Per-cycle dose",
    runHours: "Effective run hrs",
    settingDose: "Pulsarlube setting",
    timeline: "Replacement timeline",
    factors: "Adjustment factors",
    factorType: "Type",
    factorTemp: "Temp",
    factorEnv: "Environment",
    factorClear: "Clearance",
    factorSafety: "Safety",
    altModels: "Alternates",
    monthsCoverage: "Coverage on one fill",
    sealNote: "Seal compatibility",
    sealOK: "Compatible — recommended",
    sealLimited: "Conditional — verify non-contact type",
    sealNoOK: "Not suitable — use open / single-shield",
    sealIdeal: "Ideal — auto-lube fully effective",
    months: "mo",
    days: "d",
    hoursUnit: "h",
    rpmUnit: "RPM",
    cc: "cc",
    ccPerDay: "cc/day",
    g: "g",
    mm: "mm",
    deg: "°C",
    popular: "Common",
    knownDim: "Catalog match",
    estimatedDim: "ISO estimate",
    knobsTitle: "Display options",
    decimals: "Decimal places",
    units: "Unit",
    unitCC: "cc (volume)",
    unitG: "g (weight)",
    lang: "Language",
    summary: "Summary",
    detail: "Detail",
    print: "Print report",
    customer: "Customer",
    application: "Application",
    notes: "Notes",
    spec: "Spec",
    config: "Config",
    runEnv: "Run environment",
    advanced: "Advanced",
    sealAutoIdeal: "Ideal",
    sealAutoGood: "Good",
    sealAutoLimited: "Limited",
    sealAutoNo: "No",
    quickPresets: "Quick presets",
    manualEntry: "Type designation",
    manualPlaceholder: "e.g. 6212 ZZ C3",
    manualHint: "Type a designation to auto-fill",
    manualOk: "Recognized",
    manualErr: "Designation not recognized",
    presetStandard: "Standard (6212 ZZ C3)",
    presetMotor: "Motor (6308 C3)",
    presetGearbox: "Gearbox (NU212)",
    presetMachineTool: "Machine tool (7208)"
  }
};
window.I18N = I18N;

})();

/* ===== module: tweaks-panel ===== */
(function(){
"use strict";
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function TweakColor({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
    type: "color",
    className: "twk-swatch",
    value: value,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

})();

/* ===== module: ui-helpers ===== */
(function(){
"use strict";
// ============================================================
// KLT 스마트 윤활 계산기 — 메인 React 앱
// ============================================================
const {
  useState,
  useMemo,
  useEffect,
  useRef
} = React;
const {
  PREFIXES,
  BEARING_TYPES,
  DIAMETER_SERIES,
  BORE_NUMBERS,
  SEALS,
  CLEARANCE,
  PRECISION,
  ENV_DUST,
  ENV_HUMID,
  ENV_VIB,
  ORIENTATION,
  PULSARLUBE_MODELS,
  boreToMM,
  getDimensions,
  buildDesignation,
  calcLubrication,
  recommendPulsarlube,
  DEFAULT_INPUT
} = window.KLT;

// ─── 작은 UI 헬퍼 ───
const cn = (...xs) => xs.filter(Boolean).join(" ");
function Card({
  className,
  children,
  padded = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cn("bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]", padded && "p-6", className)
  }, children);
}
function Pill({
  children,
  tone = "blue"
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200"
  };
  return /*#__PURE__*/React.createElement("span", {
    className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium tracking-tight", tones[tone])
  }, children);
}
function FieldLabel({
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between mb-1.5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"
  }, children), hint && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400"
  }, hint));
}
function Select({
  value,
  onChange,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    className: "w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 py-2.5 text-sm font-medium text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none"
  }, children), /*#__PURE__*/React.createElement("svg", {
    className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
function NumInput({
  value,
  onChange,
  suffix,
  min,
  max,
  step
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(parseFloat(e.target.value) || 0),
    className: "w-full bg-transparent px-3 py-2.5 text-sm font-mono font-semibold text-slate-900 outline-none"
  }), suffix && /*#__PURE__*/React.createElement("span", {
    className: "pr-3 text-xs text-slate-400 font-medium"
  }, suffix));
}
function Segmented({
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "inline-flex rounded-lg bg-slate-100 p-1 gap-1"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.code,
    onClick: () => onChange(o.code),
    className: cn("px-3 py-1.5 rounded-md text-xs font-medium transition", value === o.code ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")
  }, o.label)));
}
function StepBadge({
  n,
  active,
  done,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: cn("w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold border-2 transition", active ? "border-blue-600 bg-blue-600 text-white" : done ? "border-blue-600 bg-white text-blue-600" : "border-slate-200 bg-white text-slate-400")
  }, done ? "✓" : n), /*#__PURE__*/React.createElement("span", {
    className: cn("text-sm font-semibold", active ? "text-slate-900" : "text-slate-400")
  }, children));
}

// ─── 헤더 ───
function TopBar({
  lang,
  setLang,
  t,
  onPrint
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 grid place-items-center shadow-md shadow-blue-600/30"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    className: "w-5 h-5 text-white",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: "currentColor",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4",
    stroke: "currentColor",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "3.5",
    r: "1.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "20.5",
    r: "1.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "3.5",
    cy: "12",
    r: "1.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20.5",
    cy: "12",
    r: "1.5",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[15px] font-bold text-slate-900 tracking-tight"
  }, t.appName), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 -mt-0.5"
  }, t.tagline))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex rounded-lg bg-slate-100 p-1 gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setLang("ko"),
    className: cn("px-2.5 py-1 rounded-md text-xs font-bold transition", lang === "ko" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
  }, "KO"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setLang("en"),
    className: cn("px-2.5 py-1 rounded-md text-xs font-bold transition", lang === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
  }, "EN")), /*#__PURE__*/React.createElement("button", {
    onClick: onPrint,
    className: "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "w-3.5 h-3.5",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4V2h8v2M4 12H2V7a1 1 0 011-1h10a1 1 0 011 1v5h-2M4 10h8v4H4z",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  })), t.print))));
}

// ─── 단계 인디케이터 ───
function StepIndicator({
  step,
  t
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-5"
  }, /*#__PURE__*/React.createElement(StepBadge, {
    n: 1,
    active: step === 1,
    done: step > 1
  }, t.step1), /*#__PURE__*/React.createElement("div", {
    className: cn("h-px w-10", step > 1 ? "bg-blue-600" : "bg-slate-200")
  }), /*#__PURE__*/React.createElement(StepBadge, {
    n: 2,
    active: step === 2,
    done: step > 2
  }, t.step2), /*#__PURE__*/React.createElement("div", {
    className: cn("h-px w-10", step > 2 ? "bg-blue-600" : "bg-slate-200")
  }), /*#__PURE__*/React.createElement(StepBadge, {
    n: 3,
    active: step === 3
  }, t.step3));
}
window.UI = {
  Card,
  Pill,
  FieldLabel,
  Select,
  NumInput,
  Segmented,
  TopBar,
  StepIndicator,
  cn
};

})();

/* ===== module: bearing-viz ===== */
(function(){
"use strict";
// ============================================================
// 베어링 단면도 + 회전 애니메이션 SVG 컴포넌트
// RPM에 따라 실제 속도가 변화. 형식별로 내부 구조 차이.
// ============================================================
const {
  useEffect,
  useRef,
  useState
} = React;
function BearingViz({
  dims,
  type,
  rpm,
  seal,
  lang = "ko",
  labels = true,
  size = 320
}) {
  const cageRef = useRef(null); // 전동체 + 케이지 (RPS의 절반)
  const innerRef = useRef(null); // 내륜 (RPS 그대로)
  const rafRef = useRef(0);
  const cageAngleRef = useRef(0);
  const innerAngleRef = useRef(0);
  const lastTRef = useRef(0);

  // d, D, B는 mm. 화면용으로 정규화.
  const d = dims.d,
    D = dims.D;
  const cx = size / 2,
    cy = size / 2;
  const Dr = size * 0.42; // 외경 반경 (px)
  const dr = Dr * (d / D); // 내경 반경
  const cageR = (Dr + dr) / 2; // 전동체 중심 원
  const ballR = (Dr - dr) / 2 * 0.85; // 전동체 반경

  // 형식별 전동체 개수
  let nBalls = 9;
  if (type === "N" || type === "NU") nBalls = 11;
  if (type === "2") nBalls = 12;
  if (type === "3") nBalls = 14;
  if (type === "5") nBalls = 10;
  if (type === "7") nBalls = 11;

  // 실제 RPS = RPM/60. 60RPM이면 1RPS(초당 1회전).
  // 너무 빠르면(>10RPS) 시각적 한도로 캡 — 어차피 사람 눈에 구분 안됨.
  const trueRPS = rpm / 60;
  const innerRPS = Math.min(trueRPS, 10); // 내륜 회전수
  const cageRPS = innerRPS / 2; // 케이지는 내륜의 약 절반 속도(베어링 운동학)

  useEffect(() => {
    let mounted = true;
    function tick(t) {
      if (!mounted) return;
      const dt = lastTRef.current ? Math.min((t - lastTRef.current) / 1000, 0.05) : 0;
      lastTRef.current = t;
      cageAngleRef.current = (cageAngleRef.current + dt * cageRPS * 360) % 360;
      innerAngleRef.current = (innerAngleRef.current + dt * innerRPS * 360) % 360;
      if (cageRef.current) cageRef.current.setAttribute("transform", `rotate(${cageAngleRef.current} ${cx} ${cy})`);
      if (innerRef.current) innerRef.current.setAttribute("transform", `rotate(${innerAngleRef.current} ${cx} ${cy})`);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cageRPS, innerRPS, cx, cy]);

  // 전동체 모양: 볼 vs 롤러
  const isRoller = type === "N" || type === "NU" || type === "2" || type === "3";
  const isThrust = type === "5";
  const balls = [];
  for (let i = 0; i < nBalls; i++) {
    const a = i / nBalls * Math.PI * 2;
    const x = cx + Math.cos(a) * cageR;
    const y = cy + Math.sin(a) * cageR;
    if (isRoller) {
      // 롤러: 회전 방향에 정렬된 직사각형
      const rollerLen = ballR * 2.0;
      const rollerW = ballR * 1.3;
      const rotDeg = a * 180 / Math.PI + 90;
      balls.push(/*#__PURE__*/React.createElement("g", {
        key: i,
        transform: `translate(${x},${y}) rotate(${rotDeg})`
      }, /*#__PURE__*/React.createElement("rect", {
        x: -rollerW / 2,
        y: -rollerLen / 2,
        width: rollerW,
        height: rollerLen,
        rx: rollerW / 3,
        ry: rollerW / 3,
        fill: "url(#rollerGrad)",
        stroke: "#1e3a5f",
        strokeWidth: 0.8
      }), /*#__PURE__*/React.createElement("rect", {
        x: -rollerW / 2 + 1,
        y: -rollerLen / 2 + 1,
        width: rollerW * 0.35,
        height: rollerLen - 2,
        rx: 1,
        fill: "rgba(255,255,255,0.45)"
      })));
    } else {
      balls.push(/*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("circle", {
        cx: x,
        cy: y,
        r: ballR,
        fill: "url(#ballGrad)",
        stroke: "#1e3a5f",
        strokeWidth: 0.8
      }), /*#__PURE__*/React.createElement("circle", {
        cx: x - ballR * 0.3,
        cy: y - ballR * 0.3,
        r: ballR * 0.3,
        fill: "rgba(255,255,255,0.6)"
      })));
    }
  }

  // 케이지 (전동체 사이 격벽)
  const cageStroke = "rgba(96,165,250,0.55)";

  // 라벨용 좌표
  const labelOffset = 18;
  return /*#__PURE__*/React.createElement("div", {
    className: "relative",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "outerRingGrad",
    cx: "0.5",
    cy: "0.4",
    r: "0.7"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#cbd5e1"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "60%",
    stopColor: "#94a3b8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#475569"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: "innerRingGrad",
    cx: "0.5",
    cy: "0.4",
    r: "0.7"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#e2e8f0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "50%",
    stopColor: "#94a3b8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#334155"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: "ballGrad",
    cx: "0.35",
    cy: "0.35",
    r: "0.7"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#e0ecff"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "50%",
    stopColor: "#7aa3d8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1e3a5f"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "rollerGrad",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#7aa3d8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "50%",
    stopColor: "#cbd5e1"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#475569"
  })), /*#__PURE__*/React.createElement("radialGradient", {
    id: "bgGrad",
    cx: "0.5",
    cy: "0.5",
    r: "0.55"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#f8fafc"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#e2e8f0"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: Dr + 22,
    fill: "url(#bgGrad)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: Dr,
    fill: "url(#outerRingGrad)",
    stroke: "#0f172a",
    strokeWidth: 1
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: Dr - 4,
    fill: "none",
    stroke: "rgba(15,23,42,0.2)",
    strokeWidth: 0.5
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: cageR + ballR + 1,
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("g", {
    ref: cageRef
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: cageR,
    fill: "none",
    stroke: cageStroke,
    strokeWidth: 1.5,
    strokeDasharray: "3 4"
  }), balls), /*#__PURE__*/React.createElement("g", {
    ref: innerRef
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: cageR - ballR - 1,
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: cageR - ballR - 1,
    fill: "url(#innerRingGrad)",
    stroke: "#0f172a",
    strokeWidth: 1
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: dr,
    fill: "#fff",
    stroke: "#0f172a",
    strokeWidth: 1
  }), /*#__PURE__*/React.createElement("rect", {
    x: cx - 2,
    y: cy - dr - 2,
    width: 4,
    height: 6,
    fill: "#0f172a"
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx - dr * 0.3,
    y1: cy,
    x2: cx + dr * 0.3,
    y2: cy,
    stroke: "rgba(15,23,42,0.5)",
    strokeWidth: 0.8
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: cy - dr * 0.3,
    x2: cx,
    y2: cy + dr * 0.3,
    stroke: "rgba(15,23,42,0.5)",
    strokeWidth: 0.8
  })), (seal === "ZZ" || seal === "Z") && /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: Dr - 1,
    fill: "none",
    stroke: "#94a3b8",
    strokeWidth: 2.5,
    strokeDasharray: "2 1",
    opacity: 0.8
  }), (seal === "DDU" || seal === "VV") && /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: Dr - 1,
    fill: "none",
    stroke: "#1e3a5f",
    strokeWidth: 3.5,
    opacity: 0.5
  }), labels && /*#__PURE__*/React.createElement("g", {
    fontFamily: "ui-monospace, monospace",
    fontSize: "10"
  }, /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: cy - Dr,
    x2: cx,
    y2: cy - Dr - 14,
    stroke: "#64748b",
    strokeWidth: 0.5
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx - Dr - 6,
    y1: cy,
    x2: cx + Dr + 6,
    y2: cy,
    stroke: "#3b82f6",
    strokeWidth: 0.5,
    strokeDasharray: "2 2",
    opacity: 0.5
  }), /*#__PURE__*/React.createElement("text", {
    x: cx + Dr + 8,
    y: cy - 4,
    fill: "#1e3a5f",
    fontWeight: "600"
  }, "D = ", dims.D), /*#__PURE__*/React.createElement("text", {
    x: cx + Dr + 8,
    y: cy + 8,
    fill: "#64748b",
    fontSize: "9"
  }, "mm"), /*#__PURE__*/React.createElement("text", {
    x: cx + 4,
    y: cy - dr / 2,
    fill: "#1e3a5f",
    fontWeight: "600"
  }, "d = ", dims.d))), /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-1 right-1 px-2 py-1 rounded-md bg-slate-900/80 text-white text-[10px] font-mono tracking-wide"
  }, rpm, " RPM"));
}
window.BearingViz = BearingViz;

})();

/* ===== module: steps-1-2 ===== */
(function(){
"use strict";
// ============================================================
// Step 1: 베어링 형번 구성 + Step 2: 운전 조건
// ============================================================
const {
  useState: _useState1,
  useMemo: _useMemo1
} = React;
const {
  Card: C1,
  Pill: P1,
  FieldLabel: FL1,
  Select: S1,
  NumInput: NI1,
  Segmented: SEG1,
  cn: cn1
} = window.UI;
const {
  BEARING_TYPES: BT,
  DIAMETER_SERIES: DS,
  BORE_NUMBERS: BN,
  SEALS: SL,
  CLEARANCE: CL,
  PRECISION: PR,
  PREFIXES: PX,
  ENV_DUST: ED,
  ENV_HUMID: EH,
  ENV_VIB: EV,
  ORIENTATION: OR,
  getDimensions: gDim,
  buildDesignation: bDes
} = window.KLT;

// ─── 빠른 프리셋 ───
const PRESETS = [{
  id: "std",
  ko: "표준 (6212 ZZ C3)",
  en: "Standard (6212 ZZ C3)",
  patch: {
    type: "6",
    series: "2",
    bore: "12",
    seal: "ZZ",
    clearance: "C3"
  }
}, {
  id: "mot",
  ko: "모터 (6308 C3)",
  en: "Motor (6308 C3)",
  patch: {
    type: "6",
    series: "3",
    bore: "08",
    seal: "",
    clearance: "C3"
  }
}, {
  id: "gbx",
  ko: "감속기 (NU212)",
  en: "Gearbox (NU212)",
  patch: {
    type: "NU",
    series: "2",
    bore: "12",
    seal: "",
    clearance: ""
  }
}, {
  id: "tool",
  ko: "공작기계 (7208)",
  en: "Machine tool (7208)",
  patch: {
    type: "7",
    series: "2",
    bore: "08",
    seal: "",
    clearance: ""
  }
}];

// ─── 형번 문자열 파서 (수기 입력 → input 패치) ───
function parseDesignation(str) {
  if (!str) return null;
  const s = str.toUpperCase().replace(/\s+/g, " ").trim();
  if (!s) return null;
  const tokens = s.split(" ");
  const core = tokens[0];
  const sorted = [...BT.map(b => b.code)].sort((a, b) => b.length - a.length);
  let type = null,
    rest = core;
  for (const tc of sorted) {
    if (core.startsWith(tc)) {
      type = tc;
      rest = core.slice(tc.length);
      break;
    }
  }
  if (!type) return null;
  const digits = rest.replace(/[^0-9]/g, "");
  if (digits.length < 3) return null;
  const series = digits[0];
  const bore = digits.slice(1, 3);
  if (!DS.find(d => d.code === series)) return null;
  if (!BN.find(b => b.code === bore)) return null;
  const patch = {
    type,
    series,
    bore,
    seal: "",
    clearance: ""
  };
  for (let i = 1; i < tokens.length; i++) {
    const tk = tokens[i];
    if (tk && CL.find(c => c.code === tk)) patch.clearance = tk;else if (tk && SL.find(sl => sl.code === tk)) patch.seal = tk;
  }
  return patch;
}

// ─── 수기 입력 박스 ───
function ManualDesignation({
  input,
  setInput,
  designation,
  t
}) {
  const [raw, setRaw] = _useState1("");
  const [status, setStatus] = _useState1(null);
  const apply = text => {
    setRaw(text);
    if (!text.trim()) {
      setStatus(null);
      return;
    }
    const patch = parseDesignation(text);
    if (patch) {
      setInput({
        ...input,
        ...patch
      });
      setStatus("ok");
    } else {
      setStatus("err");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement(FL1, {
    hint: /*#__PURE__*/React.createElement("span", {
      className: "text-slate-400"
    }, t.manualHint)
  }, t.manualEntry), /*#__PURE__*/React.createElement("div", {
    className: cn1("flex items-center rounded-lg border bg-white transition focus-within:ring-2", status === "err" ? "border-rose-300 focus-within:ring-rose-100" : status === "ok" ? "border-emerald-300 focus-within:ring-emerald-100" : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100")
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: raw,
    onChange: e => apply(e.target.value),
    placeholder: t.manualPlaceholder,
    spellCheck: false,
    className: "w-full bg-transparent px-3 py-2.5 text-sm font-mono font-semibold text-slate-900 outline-none uppercase"
  }), status === "ok" && /*#__PURE__*/React.createElement("span", {
    className: "pr-3 text-xs font-semibold text-emerald-600 whitespace-nowrap"
  }, "\u2713 ", t.manualOk), status === "err" && /*#__PURE__*/React.createElement("span", {
    className: "pr-3 text-xs font-semibold text-rose-500 whitespace-nowrap"
  }, t.manualErr)));
}

// ─── Step 1: 형번 구성 ───
function Step1Designation({
  input,
  setInput,
  dims,
  designation,
  t,
  lang,
  onNext
}) {
  const Viz = window.BearingViz;
  const popularTypes = BT.filter(b => b.popular);
  const otherTypes = BT.filter(b => !b.popular);
  const Field = ({
    label,
    hint,
    children
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, {
    hint: hint
  }, label), children);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-12 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-7 space-y-5"
  }, /*#__PURE__*/React.createElement(C1, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-slate-900"
  }, t.designation), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-500 font-mono"
  }, "ISO 15 / 355")), /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement(FL1, null, t.quickPresets), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, PRESETS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => setInput({
      ...input,
      ...p.patch
    }),
    className: "px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 hover:border-blue-300 transition"
  }, p[lang])))), /*#__PURE__*/React.createElement(ManualDesignation, {
    input: input,
    setInput: setInput,
    designation: designation,
    t: t
  }), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 p-4 mb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-2"
  }, t.designation), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-1.5 font-mono text-2xl font-bold text-slate-900 tracking-tight"
  }, /*#__PURE__*/React.createElement("span", null, input.type), /*#__PURE__*/React.createElement("span", null, input.series), /*#__PURE__*/React.createElement("span", null, input.bore), input.seal && /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-700"
  }, input.seal), input.clearance && /*#__PURE__*/React.createElement("span", {
    className: "text-amber-700"
  }, input.clearance)), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 grid grid-cols-5 gap-1 text-[9px] text-slate-400 font-medium"
  }, /*#__PURE__*/React.createElement("span", null, "1.\uD615\uC2DD"), /*#__PURE__*/React.createElement("span", null, "2.\uACC4\uC5F4"), /*#__PURE__*/React.createElement("span", null, "3.\uB0B4\uACBD"), /*#__PURE__*/React.createElement("span", null, "4.\uBC00\uBD09"), /*#__PURE__*/React.createElement("span", null, "5.\uAC04\uADF9"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement(Field, {
    label: `1. ${t.type}`,
    hint: dims.known ? /*#__PURE__*/React.createElement("span", {
      className: "text-emerald-600"
    }, t.knownDim) : /*#__PURE__*/React.createElement("span", {
      className: "text-slate-400"
    }, t.estimatedDim)
  }, /*#__PURE__*/React.createElement(S1, {
    value: input.type,
    onChange: v => setInput({
      ...input,
      type: v
    })
  }, /*#__PURE__*/React.createElement("optgroup", {
    label: lang === "ko" ? "표준" : "Common"
  }, popularTypes.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.code,
    value: b.code
  }, b.code, " \u2014 ", b[lang]))), /*#__PURE__*/React.createElement("optgroup", {
    label: lang === "ko" ? "기타" : "Others"
  }, otherTypes.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.code,
    value: b.code
  }, b.code, " \u2014 ", b[lang]))))), /*#__PURE__*/React.createElement(Field, {
    label: `2. ${t.series}`
  }, /*#__PURE__*/React.createElement(S1, {
    value: input.series,
    onChange: v => setInput({
      ...input,
      series: v
    })
  }, DS.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.code,
    value: s.code
  }, s.code, " \u2014 ", s[lang])))), /*#__PURE__*/React.createElement(Field, {
    label: `3. ${t.bore}`,
    hint: `d = ${dims.d}mm`
  }, /*#__PURE__*/React.createElement(S1, {
    value: input.bore,
    onChange: v => setInput({
      ...input,
      bore: v
    })
  }, BN.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.code,
    value: b.code
  }, b.code, " \u2014 d=", b.mm, "mm", b.popular ? " ★" : "")))), /*#__PURE__*/React.createElement(Field, {
    label: `4. ${t.seal}`
  }, /*#__PURE__*/React.createElement(S1, {
    value: input.seal,
    onChange: v => setInput({
      ...input,
      seal: v
    })
  }, SL.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.code || "open",
    value: s.code
  }, s.code || "—", " \u2014 ", s[lang])))), /*#__PURE__*/React.createElement(Field, {
    label: `5. ${t.clearance}`
  }, /*#__PURE__*/React.createElement(S1, {
    value: input.clearance,
    onChange: v => setInput({
      ...input,
      clearance: v
    })
  }, CL.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.code || "std",
    value: c.code
  }, c.code || "—", " \u2014 ", c[lang]))))))), /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-5 space-y-5"
  }, /*#__PURE__*/React.createElement(C1, {
    padded: false,
    className: "overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-6 pt-6 pb-2 flex items-baseline justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-slate-900"
  }, t.dimensions), dims.known ? /*#__PURE__*/React.createElement(P1, {
    tone: "green"
  }, t.knownDim) : /*#__PURE__*/React.createElement(P1, {
    tone: "slate"
  }, t.estimatedDim)), /*#__PURE__*/React.createElement("div", {
    className: "grid place-items-center py-4"
  }, /*#__PURE__*/React.createElement(Viz, {
    dims: dims,
    type: input.type,
    rpm: input.rpm,
    seal: input.seal,
    lang: lang,
    size: 300
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 border-t border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 text-center border-r border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, t.inner), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 font-mono text-2xl font-bold text-slate-900"
  }, dims.d), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "mm")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 text-center border-r border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, t.outer), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 font-mono text-2xl font-bold text-slate-900"
  }, dims.D), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "mm")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, t.width), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 font-mono text-2xl font-bold text-slate-900"
  }, dims.B), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "mm")))), /*#__PURE__*/React.createElement(SealCompat, {
    seal: input.seal,
    t: t,
    lang: lang
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onNext,
    className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
  }, t.next, /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 3l5 5-5 5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })))));
}
function SealCompat({
  seal,
  t,
  lang
}) {
  const sl = SL.find(s => s.code === seal) || SL[0];
  const map = {
    ideal: ["green", t.sealIdeal],
    good: ["green", t.sealOK],
    limited: ["amber", t.sealLimited],
    no: ["red", t.sealNoOK]
  };
  const [tone, msg] = map[sl.autoLube];
  const icon = tone === "red" ? "⚠" : tone === "amber" ? "⚠" : "✓";
  const tones = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-rose-50 border-rose-200 text-rose-900"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: cn1("rounded-xl border p-4 flex gap-3", tones[tone])
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xl leading-none"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold uppercase tracking-wider opacity-70"
  }, t.sealNote), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold mt-0.5"
  }, seal || "—", " \xB7 ", sl[lang]), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1 opacity-90"
  }, msg)));
}

// ─── Step 2: 운전 조건 ───
function Step2Operating({
  input,
  setInput,
  dims,
  designation,
  t,
  lang,
  onNext,
  onBack
}) {
  const Viz = window.BearingViz;
  return /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-12 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-4 space-y-5"
  }, /*#__PURE__*/React.createElement(C1, {
    padded: false,
    className: "overflow-hidden sticky top-24"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-5 pt-5 pb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, t.designation), /*#__PURE__*/React.createElement("div", {
    className: "mt-0.5 font-mono text-lg font-bold text-slate-900"
  }, designation)), /*#__PURE__*/React.createElement("div", {
    className: "grid place-items-center py-2"
  }, /*#__PURE__*/React.createElement(Viz, {
    dims: dims,
    type: input.type,
    rpm: input.rpm,
    seal: input.seal,
    lang: lang,
    size: 260
  })), /*#__PURE__*/React.createElement("div", {
    className: "px-5 pb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 text-center"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: t.inner,
    value: dims.d,
    unit: "mm"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: t.outer,
    value: dims.D,
    unit: "mm"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: t.width,
    value: dims.B,
    unit: "mm"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-8 space-y-5"
  }, /*#__PURE__*/React.createElement(C1, null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-slate-900 mb-5"
  }, t.runEnv), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, {
    hint: "r/min"
  }, t.rpm), /*#__PURE__*/React.createElement(NI1, {
    value: input.rpm,
    onChange: v => setInput({
      ...input,
      rpm: v
    }),
    suffix: "RPM",
    min: 10,
    max: 20000,
    step: 50
  }), /*#__PURE__*/React.createElement(RPMSlider, {
    value: input.rpm,
    onChange: v => setInput({
      ...input,
      rpm: v
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, {
    hint: "h/day"
  }, t.hours), /*#__PURE__*/React.createElement(NI1, {
    value: input.hoursPerDay,
    onChange: v => setInput({
      ...input,
      hoursPerDay: v
    }),
    suffix: t.hoursUnit,
    min: 1,
    max: 24,
    step: 1
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "24",
    step: "1",
    value: input.hoursPerDay,
    onChange: e => setInput({
      ...input,
      hoursPerDay: parseFloat(e.target.value)
    }),
    className: "w-full mt-3 accent-blue-600"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, {
    hint: "20\u2013180\xB0C"
  }, t.tempC), /*#__PURE__*/React.createElement(NI1, {
    value: input.tempC,
    onChange: v => setInput({
      ...input,
      tempC: v
    }),
    suffix: t.deg,
    min: 10,
    max: 200,
    step: 5
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "10",
    max: "180",
    step: "5",
    value: input.tempC,
    onChange: e => setInput({
      ...input,
      tempC: parseFloat(e.target.value)
    }),
    className: "w-full mt-3 accent-blue-600"
  }), /*#__PURE__*/React.createElement(TempBar, {
    tempC: input.tempC
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, null, t.safety), /*#__PURE__*/React.createElement(SafetyControl, {
    value: input.safety,
    onChange: v => setInput({
      ...input,
      safety: v
    }),
    t: t
  })))), /*#__PURE__*/React.createElement(C1, null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-slate-900 mb-5"
  }, t.env), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-5"
  }, /*#__PURE__*/React.createElement(EnvField, {
    label: t.dust,
    value: input.dust,
    onChange: v => setInput({
      ...input,
      dust: v
    }),
    options: ED,
    lang: lang
  }), /*#__PURE__*/React.createElement(EnvField, {
    label: t.humid,
    value: input.humid,
    onChange: v => setInput({
      ...input,
      humid: v
    }),
    options: EH,
    lang: lang
  }), /*#__PURE__*/React.createElement(EnvField, {
    label: t.vib,
    value: input.vib,
    onChange: v => setInput({
      ...input,
      vib: v
    }),
    options: EV,
    lang: lang
  }), /*#__PURE__*/React.createElement(EnvField, {
    label: t.orientation,
    value: input.orientation,
    onChange: v => setInput({
      ...input,
      orientation: v
    }),
    options: OR,
    lang: lang
  })), /*#__PURE__*/React.createElement("label", {
    className: "mt-5 flex items-center gap-2.5 cursor-pointer select-none"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: input.requireEx,
    onChange: e => setInput({
      ...input,
      requireEx: e.target.checked
    }),
    className: "w-4 h-4 accent-blue-600 rounded"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-medium text-slate-700"
  }, t.requireEx))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    className: "px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 3l-5 5 5 5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), t.back), /*#__PURE__*/React.createElement("button", {
    onClick: onNext,
    className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
  }, t.next, " \u2192 ", t.step3, /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 3l5 5-5 5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))));
}
function Stat({
  label,
  value,
  unit
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-lg bg-slate-50 py-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] font-bold uppercase tracking-wider text-slate-500"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "mt-0.5 font-mono text-base font-bold text-slate-900"
  }, value, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 font-normal ml-0.5"
  }, unit)));
}
function RPMSlider({
  value,
  onChange
}) {
  const min = 10,
    max = 10000;
  const lg = Math.log10;
  const pos = (lg(value) - lg(min)) / (lg(max) - lg(min)) * 100;
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: lg(min) * 100,
    max: lg(max) * 100,
    step: "10",
    value: lg(Math.max(value, min)) * 100,
    onChange: e => onChange(Math.round(Math.pow(10, parseFloat(e.target.value) / 100))),
    className: "w-full accent-blue-600"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[9px] text-slate-400 font-mono mt-0.5"
  }, /*#__PURE__*/React.createElement("span", null, "10"), /*#__PURE__*/React.createElement("span", null, "100"), /*#__PURE__*/React.createElement("span", null, "1k"), /*#__PURE__*/React.createElement("span", null, "10k")));
}
function TempBar({
  tempC
}) {
  const pct = Math.min(Math.max((tempC - 10) / 170, 0), 1) * 100;
  const isHot = tempC > 90;
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 h-1.5 rounded-full bg-gradient-to-r from-blue-200 via-amber-200 to-rose-400 relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow",
    style: {
      left: `${pct}%`,
      transform: `translate(-50%, -50%)`,
      background: isHot ? "#ef4444" : "#3b82f6"
    }
  })), isHot && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-rose-600"
  }, "HIGH"));
}
function SafetyControl({
  value,
  onChange,
  t
}) {
  const labels = [{
    v: 0.7,
    label: t.safetyConservative
  }, {
    v: 1.0,
    label: t.safetyStandard
  }, {
    v: 1.3,
    label: t.safetyAggressive
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex w-full rounded-lg bg-slate-100 p-1 gap-1"
  }, labels.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.v,
    onClick: () => onChange(l.v),
    className: cn1("flex-1 py-1.5 rounded-md text-xs font-medium transition", Math.abs(value - l.v) < 0.05 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-mono mt-2"
  }, "k = ", value.toFixed(2)));
}
function EnvField({
  label,
  value,
  onChange,
  options,
  lang
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FL1, null, label), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-1"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.code,
    onClick: () => onChange(o.code),
    className: cn1("px-2 py-2 rounded-lg text-[11px] font-medium transition border", value === o.code ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")
  }, o[lang]))));
}
window.Steps12 = {
  Step1Designation,
  Step2Operating
};

})();

/* ===== module: step-3 ===== */
(function(){
"use strict";
// ============================================================
// Step 3: 결과 리포트
// ============================================================
const {
  Card: C3,
  Pill: P3,
  cn: cn3
} = window.UI;
const {
  PULSARLUBE_MODELS: PLM,
  SEALS: SL3
} = window.KLT;
function Step3Report({
  input,
  dims,
  designation,
  calc,
  rec,
  t,
  lang,
  decimals,
  onBack
}) {
  const fmt = (n, d = decimals) => Number(n).toFixed(d);
  const Viz = window.BearingViz;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-12 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4 h-full"
  }, /*#__PURE__*/React.createElement(KPI, {
    tone: "blue",
    label: t.perDay,
    value: fmt(calc.ccPerDay),
    unit: t.ccPerDay,
    sub: `= ${fmt(calc.gPerDay)} ${t.g}/${t.days}`
  }), /*#__PURE__*/React.createElement(KPI, {
    tone: "indigo",
    label: t.period,
    value: fmt(calc.T_months, 1),
    unit: t.months,
    sub: `${fmt(calc.realDaysToReplenish, 0)} ${t.days} · ${fmt(calc.T_hours, 0)}${t.hoursUnit}`
  }), /*#__PURE__*/React.createElement(KPI, {
    tone: "emerald",
    label: t.productPick,
    value: rec.primary[lang],
    unit: "",
    sub: `${t.monthsCoverage} ${fmt(rec.monthsAtCapacity, 1)} ${t.months}`,
    isText: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-5"
  }, /*#__PURE__*/React.createElement(C3, {
    padded: false,
    className: "overflow-hidden h-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 p-5"
  }, /*#__PURE__*/React.createElement(Viz, {
    dims: dims,
    type: input.type,
    rpm: input.rpm,
    seal: input.seal,
    lang: lang,
    size: 140,
    labels: false
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, t.designation), /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-xl font-bold text-slate-900 leading-tight mt-0.5"
  }, designation), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 text-xs text-slate-600"
  }, "d ", dims.d, " \xB7 D ", dims.D, " \xB7 B ", dims.B, " ", /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400"
  }, "mm")), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs text-slate-600"
  }, input.rpm, " ", t.rpmUnit, " \xB7 ", input.tempC, t.deg, " \xB7 ", input.hoursPerDay, t.hoursUnit, "/", t.days)))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-12 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-7 space-y-6"
  }, /*#__PURE__*/React.createElement(C3, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between mb-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-slate-900"
  }, t.productPick), /*#__PURE__*/React.createElement(P3, {
    tone: "blue"
  }, "Pulsarlube\xAE \xB7 KLT")), /*#__PURE__*/React.createElement(PrimaryProductCard, {
    model: rec.primary,
    calc: calc,
    rec: rec,
    t: t,
    lang: lang,
    fmt: fmt
  }), rec.alts.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2"
  }, t.altModels), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, rec.alts.map((m, i) => /*#__PURE__*/React.createElement(AltProductCard, {
    key: i,
    model: m,
    calc: calc,
    t: t,
    lang: lang,
    fmt: fmt
  }))))), /*#__PURE__*/React.createElement(C3, null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-slate-900 mb-4"
  }, t.timeline), /*#__PURE__*/React.createElement(Timeline, {
    monthsAtCapacity: rec.monthsAtCapacity,
    t: t,
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    className: "col-span-12 lg:col-span-5 space-y-6"
  }, /*#__PURE__*/React.createElement(C3, null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-slate-900 mb-4"
  }, t.detail), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: t.capacity,
    value: `${fmt(calc.G_grease_g)} g · ${fmt(calc.G_grease_cc)} cc`,
    formula: "G = 0.005 \xD7 D \xD7 B"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: t.refillOnce,
    value: `${fmt(calc.Gp_g)} g · ${fmt(calc.Gp_cc)} cc`,
    formula: "Gp = G \xD7 30%"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: t.runHours,
    value: `${fmt(calc.T_hours, 0)} ${t.hoursUnit}`,
    formula: "T = k \xB7 14\xD710\u2076 / (n\xB7\u221Ad)"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: t.period,
    value: `${fmt(calc.realDaysToReplenish, 0)} ${t.days}`,
    formula: `T_run = T / ${input.hoursPerDay}h × 24`
  }), /*#__PURE__*/React.createElement("div", {
    className: "border-t border-slate-100 pt-3"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    highlight: true,
    label: t.perDay,
    value: `${fmt(calc.ccPerDay)} ${t.ccPerDay}`,
    formula: "cc/day = Gp_cc / T_days \xD7 duty"
  }))), /*#__PURE__*/React.createElement(C3, null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-slate-900 mb-4"
  }, t.factors), /*#__PURE__*/React.createElement(FactorBars, {
    factors: calc.factors,
    t: t
  })), /*#__PURE__*/React.createElement(SealCompatCompact, {
    seal: input.seal,
    t: t,
    lang: lang
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    className: "px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11 3l-5 5 5 5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), t.back), /*#__PURE__*/React.createElement("button", {
    onClick: () => window.print(),
    className: "px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4V2h8v2M4 12H2V7a1 1 0 011-1h10a1 1 0 011 1v5h-2M4 10h8v4H4z",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  })), t.print)));
}
function KPI({
  tone,
  label,
  value,
  unit,
  sub,
  isText
}) {
  const tones = {
    blue: "from-blue-600 to-blue-700",
    indigo: "from-indigo-600 to-indigo-700",
    emerald: "from-emerald-600 to-emerald-700"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: cn3("rounded-2xl bg-gradient-to-br text-white p-5 shadow-lg shadow-slate-900/10", tones[tone])
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-[0.1em] opacity-80"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: cn3("mt-2 font-bold leading-none", isText ? "text-2xl" : "font-mono text-4xl tracking-tight")
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "text-base font-normal opacity-80 ml-1.5"
  }, unit)), sub && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 text-[11px] opacity-75 font-medium"
  }, sub));
}
function PrimaryProductCard({
  model,
  calc,
  rec,
  t,
  lang,
  fmt
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white p-5 relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-3 right-3"
  }, /*#__PURE__*/React.createElement(P3, {
    tone: "blue"
  }, "\u2605 ", lang === "ko" ? "최적" : "Best fit")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-5"
  }, /*#__PURE__*/React.createElement(PulsarlubeIcon, {
    series: model.series,
    capacity: model.capacity
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold uppercase tracking-wider text-blue-700"
  }, "Pulsarlube ", model.series), /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-3xl font-bold text-slate-900 leading-tight"
  }, model.capacity, " ml"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-600 mt-1"
  }, seriesDesc(model.series, lang)), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border border-slate-200 px-3 py-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] font-bold uppercase tracking-wider text-slate-500"
  }, t.settingDose), /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-sm font-bold text-slate-900 mt-0.5"
  }, fmt(calc.ccPerDay, 2), " cc/day")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg border border-slate-200 px-3 py-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] font-bold uppercase tracking-wider text-slate-500"
  }, t.monthsCoverage), /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-sm font-bold text-slate-900 mt-0.5"
  }, fmt(rec.monthsAtCapacity, 1), " ", t.months))))));
}
function AltProductCard({
  model,
  calc,
  t,
  lang,
  fmt
}) {
  const months = model.capacity / Math.max(calc.ccPerDay, 0.001) / 30;
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement(PulsarlubeIcon, {
    series: model.series,
    capacity: model.capacity,
    small: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider text-slate-500"
  }, model.series), /*#__PURE__*/React.createElement("div", {
    className: "font-mono text-base font-bold text-slate-900"
  }, model.capacity, " ml"))), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-500 mt-2"
  }, fmt(months, 1), " ", t.months, " ", lang === "ko" ? "운용" : "coverage"));
}
function PulsarlubeIcon({
  series,
  capacity,
  small
}) {
  const size = small ? 36 : 64;
  // 원통형 디스펜서 형태
  const colors = {
    M: "#3b82f6",
    EXPL: "#dc2626"
  };
  const c = colors[series] || "#3b82f6";
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size * 1.4,
    viewBox: "0 0 64 90"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "20",
    width: "36",
    height: "50",
    rx: "3",
    fill: c,
    stroke: "#0f172a",
    strokeWidth: "0.8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "28",
    width: "30",
    height: "22",
    rx: "1",
    fill: "white",
    opacity: "0.95"
  }), /*#__PURE__*/React.createElement("text", {
    x: "32",
    y: "40",
    textAnchor: "middle",
    fontSize: "9",
    fontWeight: "800",
    fill: c,
    fontFamily: "ui-sans-serif"
  }, series), /*#__PURE__*/React.createElement("text", {
    x: "32",
    y: "48",
    textAnchor: "middle",
    fontSize: "6",
    fontWeight: "600",
    fill: "#64748b",
    fontFamily: "ui-monospace"
  }, capacity, "ml"), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "54",
    width: "24",
    height: "3",
    rx: "1",
    fill: "#0f172a",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "54",
    width: "14",
    height: "3",
    rx: "1",
    fill: "#fbbf24"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "26",
    y: "70",
    width: "12",
    height: "6",
    fill: "#475569"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "28",
    y: "76",
    width: "8",
    height: "8",
    fill: "#1e293b"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "20",
    y: "14",
    width: "24",
    height: "8",
    rx: "2",
    fill: "#1e293b"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "18",
    r: "1.5",
    fill: "#fbbf24"
  }));
}
function seriesDesc(series, lang) {
  const d = {
    M: {
      ko: "단일 포인트 · 기계식",
      en: "Single-point · mechanical"
    },
    EXPL: {
      ko: "방폭형 · ATEX 인증",
      en: "Explosion-proof · ATEX"
    }
  };
  return d[series]?.[lang] || "";
}
function DetailRow({
  label,
  value,
  formula,
  highlight
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: cn3("flex items-center justify-between gap-3", highlight && "rounded-lg bg-blue-50 -mx-2 px-2 py-2")
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: cn3("text-xs font-semibold", highlight ? "text-blue-900" : "text-slate-700")
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-mono mt-0.5"
  }, formula)), /*#__PURE__*/React.createElement("div", {
    className: cn3("font-mono text-sm font-bold whitespace-nowrap", highlight ? "text-blue-700" : "text-slate-900")
  }, value));
}
function FactorBars({
  factors,
  t
}) {
  const items = [{
    key: "type",
    label: t.factorType,
    v: factors.type
  }, {
    key: "temp",
    label: t.factorTemp,
    v: factors.temp
  }, {
    key: "env",
    label: t.factorEnv,
    v: factors.env
  }, {
    key: "clearance",
    label: t.factorClear,
    v: factors.clearance
  }, {
    key: "safety",
    label: t.factorSafety,
    v: factors.safety
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5"
  }, items.map(it => {
    const pct = Math.min(it.v / 3, 1) * 100;
    const danger = it.v > 1.5;
    return /*#__PURE__*/React.createElement("div", {
      key: it.key
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-baseline justify-between text-xs mb-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-medium text-slate-700"
    }, it.label), /*#__PURE__*/React.createElement("span", {
      className: cn3("font-mono font-bold", danger ? "text-rose-600" : "text-slate-900")
    }, "\xD7", it.v.toFixed(2))), /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full bg-slate-100 overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: cn3("h-full rounded-full", danger ? "bg-rose-500" : "bg-blue-600"),
      style: {
        width: `${pct}%`
      }
    })));
  }));
}
function Timeline({
  monthsAtCapacity,
  t,
  lang
}) {
  // 1년 타임라인에 점 찍기
  const refillsPerYear = 12 / Math.max(monthsAtCapacity, 0.1);
  const dots = [];
  for (let m = monthsAtCapacity; m < 24; m += monthsAtCapacity) {
    dots.push(m);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "relative h-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-0 top-full text-[10px] text-slate-500 font-mono mt-1"
  }, "0"), dots.map((m, i) => {
    const pos = m / 24 * 100;
    if (pos > 100) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
      style: {
        left: `${pos}%`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white"
    }), /*#__PURE__*/React.createElement("div", {
      className: "absolute top-full text-[10px] text-slate-500 font-mono mt-1 -translate-x-1/2 whitespace-nowrap"
    }, m.toFixed(1), t.months));
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 border-dashed"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-1/2 -top-1 -translate-x-1/2 text-[9px] text-slate-400 font-mono"
  }, "12", t.months)), /*#__PURE__*/React.createElement("div", {
    className: "mt-7 text-xs text-slate-600"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-900"
  }, refillsPerYear.toFixed(1), lang === "ko" ? "회/년" : " refills/yr"), /*#__PURE__*/React.createElement("span", {
    className: "mx-2 text-slate-300"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, lang === "ko" ? "연간 사용량" : "Annual usage", " ", /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-bold"
  }, (monthsAtCapacity > 0 ? 12 / monthsAtCapacity : 0).toFixed(1)), " \xD7 ", lang === "ko" ? "교체" : "fills")));
}
function SealCompatCompact({
  seal,
  t,
  lang
}) {
  const sl = SL3.find(s => s.code === seal) || SL3[0];
  const map = {
    ideal: ["green", t.sealIdeal, "✓"],
    good: ["green", t.sealOK, "✓"],
    limited: ["amber", t.sealLimited, "⚠"],
    no: ["red", t.sealNoOK, "⚠"]
  };
  const [tone, msg, ico] = map[sl.autoLube];
  const tones = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-rose-50 border-rose-200 text-rose-900"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: cn3("rounded-xl border p-4 flex gap-3", tones[tone])
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xl leading-none"
  }, ico), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase tracking-wider opacity-70"
  }, t.sealNote), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold mt-0.5"
  }, seal || "—", " \xB7 ", sl[lang]), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1 opacity-90"
  }, msg)));
}
window.Step3 = {
  Step3Report
};

})();

/* ===== module: app ===== */
(function(){
"use strict";
// ============================================================
// KLT 스마트 윤활 계산기 — App entry
// ============================================================
const {
  useState: uS,
  useMemo: uM,
  useEffect: uE
} = React;
const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "decimals": 2,
  "lang": "ko"
} /*EDITMODE-END*/;
function App() {
  const [step, setStep] = uS(1);
  const [input, setInput] = uS(window.KLT.DEFAULT_INPUT);
  const [tweaks, setTweak] = window.useTweaks(TWEAKS_DEFAULTS);
  const lang = tweaks.lang;
  const t = window.I18N[lang];
  const dims = uM(() => window.KLT.getDimensions(input.type, input.series, input.bore), [input.type, input.series, input.bore]);
  const designation = uM(() => window.KLT.buildDesignation(input), [input]);
  const calc = uM(() => window.KLT.calcLubrication({
    ...input,
    dims
  }), [input, dims]);
  const rec = uM(() => window.KLT.recommendPulsarlube(calc.ccPerDay, input.vib, input.dust, input.requireEx), [calc, input]);
  const setLang = v => setTweak("lang", v);
  const {
    TopBar,
    StepIndicator
  } = window.UI;
  const {
    Step1Designation,
    Step2Operating
  } = window.Steps12;
  const {
    Step3Report
  } = window.Step3;
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-slate-50 text-slate-900"
  }, /*#__PURE__*/React.createElement(TopBar, {
    lang: lang,
    setLang: setLang,
    t: t,
    onPrint: () => window.print()
  }), /*#__PURE__*/React.createElement("div", {
    className: "max-w-[1400px] mx-auto px-6 py-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement(StepIndicator, {
    step: step,
    t: t
  })), step === 1 && /*#__PURE__*/React.createElement(Step1Designation, {
    input: input,
    setInput: setInput,
    dims: dims,
    designation: designation,
    t: t,
    lang: lang,
    onNext: () => setStep(2)
  }), step === 2 && /*#__PURE__*/React.createElement(Step2Operating, {
    input: input,
    setInput: setInput,
    dims: dims,
    designation: designation,
    t: t,
    lang: lang,
    onNext: () => setStep(3),
    onBack: () => setStep(1)
  }), step === 3 && /*#__PURE__*/React.createElement(Step3Report, {
    input: input,
    dims: dims,
    designation: designation,
    calc: calc,
    rec: rec,
    t: t,
    lang: lang,
    decimals: tweaks.decimals,
    onBack: () => setStep(2)
  })), /*#__PURE__*/React.createElement("footer", {
    className: "max-w-[1400px] mx-auto px-6 py-6 text-[11px] text-slate-400 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 KLT \xB7 Pulsarlube\xAE Smart Lubrication Sizing \u2014 ISO 15 / 355 \xB7 SKF lubrication formula"), /*#__PURE__*/React.createElement("div", {
    className: "font-mono"
  }, "v1.0")), /*#__PURE__*/React.createElement(window.TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(window.TweakSection, {
    label: t.knobsTitle
  }, /*#__PURE__*/React.createElement(window.TweakRadio, {
    label: t.lang,
    value: tweaks.lang,
    onChange: v => setTweak("lang", v),
    options: [{
      label: "한국어",
      value: "ko"
    }, {
      label: "English",
      value: "en"
    }]
  }), /*#__PURE__*/React.createElement(window.TweakSlider, {
    label: t.decimals,
    value: tweaks.decimals,
    min: 0,
    max: 4,
    step: 1,
    onChange: v => setTweak("decimals", v)
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));

})();

