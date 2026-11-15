// Cifras de la página. Cada bloque indica su fuente. Los gráficos se dibujan desde aquí (app.js);
// las tablas visibles están escritas en index.html para que se lean sin JavaScript.
window.RESULTS = {
  phoenix_pipeline: {
    source: "Memoria, Tabla 5 (métrica de validación de cada componente sobre PHOENIX)",
    rows: [
      { component: "Difusor (stage 1)", steps: 50000, metric: "SSIM", value: 0.849 },
      { component: "Difusor (stage 2)", steps: 50000, metric: "FVD", value: 749.9 },
      { component: "FSQ", steps: 50000, metric: "Pérdida de validación", value: 0.073 },
      { component: "GPT", steps: 100000, metric: "DTW", value: 157 }
    ]
  },

  phoenix_modes: {
    source: "Memoria, Tabla 10 (modelo funcional sobre PHOENIX, mismo conjunto de prueba)",
    modes: ["Difusor (poses reales)", "FSQ → Difusor", "GPT → FSQ → Difusor"],
    highlight: 2,
    metrics: [
      { key: "FVD", better: "lower", values: [528.5, 598.3, 1526.6], digits: 1 },
      { key: "SSIM", better: "higher", values: [0.819, 0.780, 0.643], digits: 3 },
      { key: "LPIPS", better: "lower", values: [0.087, 0.114, 0.270], digits: 3 },
      { key: "IDS", better: "higher", values: [0.633, 0.633, 0.574], digits: 3 },
      { key: "FID", better: "lower", values: [31.3, 33.2, 22.9], digits: 1, chart: false },
      { key: "Nitidez (Laplaciano)", better: "higher", values: [748, 746, 726], digits: 0, chart: false }
    ]
  },

  diffuser_corpus: {
    source: "Memoria, Tabla 11 (difusor con poses reales; cada uno sobre su propio conjunto de prueba)",
    columns: ["PHOENIX", "Chilean2Sign (chdata_clei)"],
    rows: { FVD: [528.5, 1389.0], FID: [31.3, 50.1], SSIM: [0.819, 0.660], LPIPS: [0.087, 0.316], IDS: [0.633, 0.478] }
  },

  clei_vs_chdata12: {
    source: "Memoria, Tabla 12 (difusor con poses reales sobre el test de Chilean2Sign; 455 y 330 pares)",
    columns: ["chdata_clei", "chdata12"],
    rows: { FVD: [1389.0, 1653.6], FID: [50.1, 57.4], SSIM: [0.660, 0.683], LPIPS: [0.316, 0.317], IDS: [0.478, 0.515] }
  },

  fsq_chdata12_vs_chdata20: {
    source: "Memoria, Tabla 13 (modo FSQ → difusor, cada modelo sobre el test de su corpus)",
    columns: ["chdata12", "chdata20"],
    rows: { FVD: [2612.9, 2804.1], FID: [61.5, 62.3], SSIM: [0.707, 0.666], LPIPS: [0.258, 0.309], IDS: [0.446, 0.091] }
  },

  fsq_last_three: {
    source: "Memoria, Tabla 14 (modo FSQ → difusor, mismo conjunto de prueba)",
    columns: ["chdata20", "chdata_quant", "chdata_latent"],
    rows: { FVD: [2804.1, 2718.2, 2704.4], FID: [62.3, 63.4, 64.4], SSIM: [0.666, 0.664, 0.665], LPIPS: [0.309, 0.310, 0.309], IDS: [0.091, 0.087, 0.089] }
  },

  fsq_training: {
    source: "Memoria, Tablas 6 a 9 (validación del FSQ)",
    quantization_error_final: { chdata20: 1.420, chdata_quant: 0.494, chdata_latent: 0.493 },
    distillation_final: { chdata20: 0.076, chdata_quant: 0.088, chdata_latent: 0.024 }
  },

  model384: {
    source: "kb/03-difusor.md §4 (set intermedio de 15 clips, mismos clips para ambos modelos)",
    columns: ["chdata12-fvd-FT (272×224)", "chdata12-384-FT (384×320)"],
    rows: [
      { metric: "IDS", better: "higher", values: [0.405, 0.518] },
      { metric: "SSIM", better: "higher", values: [0.813, 0.878] },
      { metric: "LPIPS", better: "lower", values: [0.089, 0.069] },
      { metric: "Hand SSIM a 384", better: "higher", values: [0.571, 0.592] },
      { metric: "Error de keypoints de mano (% ancho de hombros)", better: "lower", values: [4.97, 4.03] }
    ]
  },

  identity_ranking: {
    source: "kb/06-pruebas.md §9 y outputs/ranking_identidad/chdata12-384-FT/ranking.json (chdata12-384-FT, hasta 50 frases reales por informante)",
    rows: [
      { informant: "inf16", ids: 0.668, median: 0.675, sd: 0.046, n: 50 },
      { informant: "inf9", ids: 0.637, median: 0.632, sd: 0.047, n: 50 },
      { informant: "inf6", ids: 0.627, median: 0.627, sd: 0.037, n: 45 },
      { informant: "inf1", ids: 0.617, median: 0.627, sd: 0.042, n: 50 },
      { informant: "inf11", ids: 0.614, median: 0.614, sd: 0.037, n: 50 },
      { informant: "inf18", ids: 0.599, median: 0.606, sd: 0.038, n: 18 },
      { informant: "inf22", ids: 0.540, median: 0.533, sd: 0.038, n: 27 },
      { informant: "inf7", ids: 0.538, median: 0.546, sd: 0.038, n: 50 },
      { informant: "inf10", ids: 0.511, median: 0.517, sd: 0.054, n: 32 },
      { informant: "inf19", ids: 0.489, median: 0.493, sd: 0.050, n: 23 },
      { informant: "inf8", ids: 0.447, median: 0.461, sd: 0.056, n: 50 },
      { informant: "inf13", ids: 0.364, median: 0.380, sd: 0.076, n: 50 }
    ],
    insufficient: [
      { informant: "inf21", ids: 0.541, n: 5 },
      { informant: "inf15", ids: 0.522, n: 4 }
    ]
  }
};
