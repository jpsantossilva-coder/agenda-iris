# Recorta o fundo cinza das poses da mascote (sem baixar nada: usa System.Drawing).
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File dev\mascote\recortar.ps1
param(
  [string]$Pasta = $PSScriptRoot,
  [double]$T0 = 3, [double]$T1 = 9, [double]$G0 = 12, [int]$Raio = 4
)
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Recorte {
  static double[] Solve(double[,] A, double[] b, int n) {
    for (int i = 0; i < n; i++) {
      int p = i;
      for (int k = i + 1; k < n; k++) if (Math.Abs(A[k, i]) > Math.Abs(A[p, i])) p = k;
      for (int j = 0; j < n; j++) { double t = A[i, j]; A[i, j] = A[p, j]; A[p, j] = t; }
      { double t = b[i]; b[i] = b[p]; b[p] = t; }
      for (int k = i + 1; k < n; k++) {
        double f = A[k, i] / A[i, i];
        for (int j = i; j < n; j++) A[k, j] -= f * A[i, j];
        b[k] -= f * b[i];
      }
    }
    double[] x = new double[n];
    for (int i = n - 1; i >= 0; i--) {
      double s = b[i];
      for (int j = i + 1; j < n; j++) s -= A[i, j] * x[j];
      x[i] = s / A[i, i];
    }
    return x;
  }

  // base polinomial de grau 3 em (u,v)
  const int NB = 10;
  static void Basis(double u, double v, double[] o) {
    o[0] = 1; o[1] = u; o[2] = v; o[3] = u * u; o[4] = u * v; o[5] = v * v;
    o[6] = u * u * u; o[7] = u * u * v; o[8] = u * v * v; o[9] = v * v * v;
  }

  public static string Processar(string entrada, string saida, double T0, double T1, double G0, int Raio) {
    Bitmap src = new Bitmap(entrada);
    int W = src.Width, H = src.Height, N = W * H;
    Bitmap bmp = new Bitmap(W, H, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, W, H);
    src.Dispose();
    BitmapData d = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    byte[] px = new byte[N * 4];
    Marshal.Copy(d.Scan0, px, 0, px.Length);

    // 1) modelo do fundo: polinomio ajustado nos pixels "com certeza fundo"
    bool[] usar = new bool[N];
    int anel = 24;
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
      usar[y * W + x] = (x < anel || x >= W - anel || y < anel || y >= H - anel);
    double[][] coef = new double[3][];
    double[] bs = new double[NB];
    float[] dist = new float[N];
    float[] bgB = new float[N], bgG = new float[N], bgR = new float[N];
    for (int it = 0; it < 4; it++) {
      for (int c = 0; c < 3; c++) {
        double[,] A = new double[NB, NB]; double[] rhs = new double[NB];
        for (int y = 0; y < H; y += 2) for (int x = 0; x < W; x += 2) {
          int i = y * W + x; if (!usar[i]) continue;
          Basis((double)x / W - 0.5, (double)y / H - 0.5, bs);
          double val = px[i * 4 + c];
          for (int a = 0; a < NB; a++) { rhs[a] += bs[a] * val; for (int b2 = 0; b2 < NB; b2++) A[a, b2] += bs[a] * bs[b2]; }
        }
        for (int a = 0; a < NB; a++) A[a, a] += 1e-6;
        coef[c] = Solve(A, rhs, NB);
      }
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        int i = y * W + x;
        Basis((double)x / W - 0.5, (double)y / H - 0.5, bs);
        double vb = 0, vg = 0, vr = 0;
        for (int a = 0; a < NB; a++) { vb += coef[0][a] * bs[a]; vg += coef[1][a] * bs[a]; vr += coef[2][a] * bs[a]; }
        bgB[i] = (float)vb; bgG[i] = (float)vg; bgR[i] = (float)vr;
        double db = px[i * 4] - vb, dg = px[i * 4 + 1] - vg, dr = px[i * 4 + 2] - vr;
        dist[i] = (float)Math.Sqrt(db * db + dg * dg + dr * dr);
        usar[i] = dist[i] < 6;
      }
    }

    // 2) gradiente (Sobel) da luminancia
    float[] lum = new float[N];
    for (int i = 0; i < N; i++) lum[i] = 0.114f * px[i * 4] + 0.587f * px[i * 4 + 1] + 0.299f * px[i * 4 + 2];
    float[] grad = new float[N];
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) {
      int i = y * W + x;
      float gx = -lum[i - W - 1] - 2 * lum[i - 1] - lum[i + W - 1] + lum[i - W + 1] + 2 * lum[i + 1] + lum[i + W + 1];
      float gy = -lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1] + lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1];
      grad[i] = (float)Math.Sqrt(gx * gx + gy * gy) / 4f;
    }

    // 3) sombra = desvio neutro, so mais escuro, e liso
    bool[] sombra = new bool[N];
    for (int i = 0; i < N; i++) {
      float db = px[i * 4] - bgB[i], dg = px[i * 4 + 1] - bgG[i], dr = px[i * 4 + 2] - bgR[i];
      sombra[i] = Math.Abs(dr - dg) < 5 && Math.Abs(db - dg) < 5 && dg < 0 && dg > -90 && grad[i] < G0;
    }

    // 4) inundacao a partir das bordas
    bool[] fundo = new bool[N];
    Stack<int> pilha = new Stack<int>();
    Action<int> tentar = delegate (int i) {
      if (fundo[i]) return;
      if (dist[i] < T1 || sombra[i]) { fundo[i] = true; pilha.Push(i); }
    };
    for (int x = 0; x < W; x++) { tentar(x); tentar((H - 1) * W + x); }
    for (int y = 0; y < H; y++) { tentar(y * W); tentar(y * W + W - 1); }
    while (pilha.Count > 0) {
      int i = pilha.Pop(); int x = i % W, y = i / W;
      if (x > 0) tentar(i - 1); if (x < W - 1) tentar(i + 1);
      if (y > 0) tentar(i - W); if (y < H - 1) tentar(i + W);
    }

    // 4b) abertura do fundo: o fundo so vale onde cabe um quadrado de lado 2R+1
    //     vindo da borda. Fecha furos em espada/capa que vazaram por frestas.
    int R = Raio;
    if (R > 0) {
      int[] soma = new int[(W + 1) * (H + 1)];
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
        soma[(y + 1) * (W + 1) + x + 1] = (fundo[y * W + x] ? 1 : 0) + soma[y * (W + 1) + x + 1] + soma[(y + 1) * (W + 1) + x] - soma[y * (W + 1) + x];
      bool[] ero = new bool[N];
      int cheio = (2 * R + 1) * (2 * R + 1);
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        int x0 = Math.Max(0, x - R), x1 = Math.Min(W - 1, x + R), y0 = Math.Max(0, y - R), y1 = Math.Min(H - 1, y + R);
        int s = soma[(y1 + 1) * (W + 1) + x1 + 1] - soma[y0 * (W + 1) + x1 + 1] - soma[(y1 + 1) * (W + 1) + x0] + soma[y0 * (W + 1) + x0];
        ero[y * W + x] = s == (x1 - x0 + 1) * (y1 - y0 + 1);
      }
      bool[] alc = new bool[N];
      Stack<int> p2 = new Stack<int>();
      for (int x = 0; x < W; x++) { if (ero[x]) { alc[x] = true; p2.Push(x); } int j = (H - 1) * W + x; if (ero[j] && !alc[j]) { alc[j] = true; p2.Push(j); } }
      for (int y = 0; y < H; y++) { int j = y * W; if (ero[j] && !alc[j]) { alc[j] = true; p2.Push(j); } j = y * W + W - 1; if (ero[j] && !alc[j]) { alc[j] = true; p2.Push(j); } }
      while (p2.Count > 0) {
        int i = p2.Pop(); int x = i % W, y = i / W;
        if (x > 0 && ero[i - 1] && !alc[i - 1]) { alc[i - 1] = true; p2.Push(i - 1); }
        if (x < W - 1 && ero[i + 1] && !alc[i + 1]) { alc[i + 1] = true; p2.Push(i + 1); }
        if (y > 0 && ero[i - W] && !alc[i - W]) { alc[i - W] = true; p2.Push(i - W); }
        if (y < H - 1 && ero[i + W] && !alc[i + W]) { alc[i + W] = true; p2.Push(i + W); }
      }
      int[] soma2 = new int[(W + 1) * (H + 1)];
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
        soma2[(y + 1) * (W + 1) + x + 1] = (alc[y * W + x] ? 1 : 0) + soma2[y * (W + 1) + x + 1] + soma2[(y + 1) * (W + 1) + x] - soma2[y * (W + 1) + x];
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        if (!fundo[y * W + x]) continue;
        int x0 = Math.Max(0, x - R), x1 = Math.Min(W - 1, x + R), y0 = Math.Max(0, y - R), y1 = Math.Min(H - 1, y + R);
        int s = soma2[(y1 + 1) * (W + 1) + x1 + 1] - soma2[y0 * (W + 1) + x1 + 1] - soma2[(y1 + 1) * (W + 1) + x0] + soma2[y0 * (W + 1) + x0];
        if (s == 0) fundo[y * W + x] = false;
      }
    }

    // 5) alfa + descontaminacao da cor do fundo nas bordas
    float[] alfa = new float[N];
    for (int i = 0; i < N; i++) {
      if (!fundo[i]) { alfa[i] = 1; continue; }
      if (sombra[i]) { alfa[i] = 0; continue; }
      double t = (dist[i] - T0) / (T1 - T0); if (t < 0) t = 0; if (t > 1) t = 1;
      alfa[i] = (float)(t * t * (3 - 2 * t));
    }
    // pixels opacos colados no fundo: suaviza 1px para tirar serrilhado
    float[] a2 = (float[])alfa.Clone();
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) {
      int i = y * W + x; if (alfa[i] < 1) continue;
      float m = (alfa[i - 1] + alfa[i + 1] + alfa[i - W] + alfa[i + W]) / 4f;
      if (m < 1) a2[i] = 0.55f + 0.45f * m;
    }
    // 5b) fica so o maior pedaco (tira ciscos e restos soltos de sombra)
    int[] rot = new int[N]; int melhor = 0, melhorTam = 0, atual = 0;
    Stack<int> p3 = new Stack<int>();
    for (int s0 = 0; s0 < N; s0++) {
      if (a2[s0] <= 0.004f || rot[s0] != 0) continue;
      atual++; int tam = 0; rot[s0] = atual; p3.Push(s0);
      while (p3.Count > 0) {
        int i = p3.Pop(); tam++; int x = i % W, y = i / W;
        if (x > 0 && rot[i - 1] == 0 && a2[i - 1] > 0.004f) { rot[i - 1] = atual; p3.Push(i - 1); }
        if (x < W - 1 && rot[i + 1] == 0 && a2[i + 1] > 0.004f) { rot[i + 1] = atual; p3.Push(i + 1); }
        if (y > 0 && rot[i - W] == 0 && a2[i - W] > 0.004f) { rot[i - W] = atual; p3.Push(i - W); }
        if (y < H - 1 && rot[i + W] == 0 && a2[i + W] > 0.004f) { rot[i + W] = atual; p3.Push(i + W); }
      }
      if (tam > melhorTam) { melhorTam = tam; melhor = atual; }
    }
    for (int i = 0; i < N; i++) if (rot[i] != melhor) a2[i] = 0;

    int opacos = 0;
    for (int i = 0; i < N; i++) {
      float a = a2[i];
      if (a <= 0.004f) { px[i * 4] = 0; px[i * 4 + 1] = 0; px[i * 4 + 2] = 0; px[i * 4 + 3] = 0; continue; }
      if (a < 1 && fundo[i]) {
        for (int c = 0; c < 3; c++) {
          float bgc = c == 0 ? bgB[i] : (c == 1 ? bgG[i] : bgR[i]);
          float v = (px[i * 4 + c] - (1 - a) * bgc) / a;
          px[i * 4 + c] = (byte)Math.Max(0, Math.Min(255, v));
        }
      }
      px[i * 4 + 3] = (byte)Math.Round(a * 255);
      if (a > 0.5f) opacos++;
    }
    Marshal.Copy(px, 0, d.Scan0, px.Length);
    bmp.UnlockBits(d);
    bmp.Save(saida, ImageFormat.Png);
    bmp.Dispose();
    return String.Format("{0}x{1} personagem={2:P0}", W, H, (double)opacos / N);
  }

  // folha de conferencia: todas as poses sobre uma cor de fundo
  public static void Folha(string[] arquivos, string saida, int r, int g, int b, int alturaCelula) {
    int col = 4, lin = (arquivos.Length + col - 1) / col, cw = alturaCelula, ch = alturaCelula;
    Bitmap folha = new Bitmap(col * cw, lin * ch, PixelFormat.Format32bppArgb);
    using (Graphics gr = Graphics.FromImage(folha)) {
      gr.Clear(Color.FromArgb(r, g, b));
      gr.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
      for (int k = 0; k < arquivos.Length; k++) {
        using (Bitmap im = new Bitmap(arquivos[k])) {
          double s = Math.Min((double)cw / im.Width, (double)ch / im.Height);
          int w = (int)(im.Width * s), h = (int)(im.Height * s);
          gr.DrawImage(im, (k % col) * cw + (cw - w) / 2, (k / col) * ch + (ch - h) / 2, w, h);
        }
      }
    }
    folha.Save(saida, ImageFormat.Png);
    folha.Dispose();
  }
}
"@

$saidaDir = Join-Path $Pasta 'recorte'
New-Item -ItemType Directory -Force $saidaDir | Out-Null
$feitos = @()
foreach ($n in 1..8) {
  $in = Join-Path $Pasta "pose-$n.png"
  $out = Join-Path $saidaDir "pose-$n.png"
  $r = [Recorte]::Processar($in, $out, $T0, $T1, $G0, $Raio)
  Write-Output "pose-$n  $r"
  $feitos += $out
}
[Recorte]::Folha($feitos, (Join-Path $saidaDir '_conferencia-indigo.png'), 43, 52, 110, 480)
[Recorte]::Folha($feitos, (Join-Path $saidaDir '_conferencia-papel.png'), 250, 246, 236, 480)
Write-Output 'folhas de conferencia geradas'
