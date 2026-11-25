import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveStartupPlan } from "@/lib/startups.functions";
import { AD_THEMES, euro, type AdDesign, type Costing } from "@/lib/startup-plan";

// The founder's ad, from the workbook's «Διαφήμιση» pages: a poster, an
// Instagram post or a story, drawn on a canvas so it can be downloaded as a
// picture or printed in colour. Visitors see the saved ad on the startup page.

type AdInfo = { name: string; emoji: string; imageUrl: string | null; costing?: Costing; usp?: string };

const SIZES: Record<AdDesign["format"], { w: number; h: number; label: string; hint: string }> = {
  poster: { w: 1080, h: 1528, label: "Αφίσα", hint: "Για τον τοίχο του σχολείου ή της γειτονιάς (A4)" },
  post: { w: 1080, h: 1080, label: "Post", hint: "Τετράγωνο, για Instagram ή Facebook" },
  story: { w: 1080, h: 1920, label: "Story", hint: "Όρθιο, για stories και WhatsApp" },
};

const CTA_IDEAS = ["Παράγγειλε τώρα!", "Έλα να δοκιμάσεις!", "Κλείσε ραντεβού!", "Στείλε μου μήνυμα!"];

export function defaultAd(info: AdInfo): AdDesign {
  return {
    format: "poster",
    headline: info.name,
    text: (info.usp ?? "").slice(0, 140),
    cta: CTA_IDEAS[0],
    where: "",
    showPrice: Boolean(info.costing?.price),
    showImage: Boolean(info.imageUrl),
    theme: 0,
  };
}

function priceText(c?: Costing) {
  if (!c?.price) return "";
  return euro(c.price) + (c.unit ? ` / ${c.unit}` : "");
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    return cut;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function drawAd(canvas: HTMLCanvasElement, d: AdDesign, info: AdInfo, img: HTMLImageElement | null) {
  const { w: W, h: H } = SIZES[d.format];
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const t = AD_THEMES[d.theme] ?? AD_THEMES[0];
  const pad = 80;
  const inner = W - pad * 2;

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Top band: emoji and company name
  const bandH = 170;
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, t.band[0]);
  g.addColorStop(1, t.band[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, bandH);
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = `64px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(info.emoji, pad, bandH / 2);
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText(wrap(ctx, info.name, inner - 110, 1)[0] ?? "", pad + 100, bandH / 2 + 2);

  // Measure the text blocks first, so the drawing gets the space left over.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const big = d.format === "post" ? 84 : 100;
  ctx.font = `900 ${big}px ${FONT}`;
  const head = wrap(ctx, d.headline, inner, 3);
  ctx.font = `500 46px ${FONT}`;
  const body = wrap(ctx, d.text, inner, d.format === "post" ? 2 : 4);
  const price = d.showPrice ? priceText(info.costing) : "";

  const headH = head.length * big * 1.1;
  const bodyH = body.length * 60;
  const priceH = price ? 130 : 0;
  const ctaH = d.cta ? 130 : 0;
  const whereH = d.where ? 70 : 0;
  const footH = 70;
  const used = bandH + 70 + headH + 30 + bodyH + 40 + priceH + ctaH + whereH + footH;
  const imgH = d.showImage && img ? Math.max(0, Math.min(H - used - 40, inner * 0.85)) : 0;
  // Centre the blocks in the space under the band.
  const total = headH + 30 + (imgH > 120 ? imgH + 56 : 0) + bodyH + 40 + priceH + ctaH + whereH;
  let y = bandH + Math.max(70, (H - bandH - footH - total) / 2);

  ctx.fillStyle = t.ink;
  ctx.font = `900 ${big}px ${FONT}`;
  for (const l of head) {
    y += big;
    ctx.fillText(l, W / 2, y);
    y += big * 0.1;
  }
  y += 30;

  if (imgH > 120 && img) {
    const ratio = img.naturalWidth / img.naturalHeight || 4 / 3;
    let iw = Math.min(inner, imgH * ratio);
    let ih = iw / ratio;
    if (ih > imgH) {
      ih = imgH;
      iw = ih * ratio;
    }
    const ix = (W - iw) / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.15)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, ix - 16, y - 16, iw + 32, ih + 32, 32);
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, ix, y, iw, ih, 20);
    ctx.clip();
    ctx.drawImage(img, ix, y, iw, ih);
    ctx.restore();
    y += ih + 56;
  }

  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.85;
  ctx.font = `500 46px ${FONT}`;
  for (const l of body) {
    y += 52;
    ctx.fillText(l, W / 2, y);
    y += 8;
  }
  ctx.globalAlpha = 1;
  y += 40;

  if (price) {
    ctx.font = `900 64px ${FONT}`;
    const pw = Math.min(inner, ctx.measureText(price).width + 90);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 8;
    roundRect(ctx, (W - pw) / 2, y, pw, 104, 52);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t.accent;
    ctx.textBaseline = "middle";
    ctx.fillText(price, W / 2, y + 54);
    ctx.textBaseline = "alphabetic";
    y += priceH;
  }

  if (d.cta) {
    ctx.font = `800 56px ${FONT}`;
    const cw = Math.min(inner, ctx.measureText(d.cta).width + 120);
    ctx.fillStyle = t.accent;
    roundRect(ctx, (W - cw) / 2, y, cw, 104, 52);
    ctx.fill();
    ctx.fillStyle = d.theme === 5 ? "#1d1b2e" : "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(d.cta, W / 2, y + 54);
    ctx.textBaseline = "alphabetic";
    y += ctaH;
  }

  if (d.where) {
    ctx.fillStyle = t.ink;
    ctx.font = `700 42px ${FONT}`;
    ctx.fillText(wrap(ctx, `📍 ${d.where}`, inner, 1)[0] ?? "", W / 2, y + 40);
  }

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = t.ink;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("Φτιαγμένο στο Kids in Business", W / 2, H - 40);
  ctx.globalAlpha = 1;
}

// Loads the product drawing so it can be drawn (and still downloaded).
function useImage(url: string | null, wanted: boolean) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url || !wanted) {
      setImg(null);
      return;
    }
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.onerror = () => setImg(null);
    i.src = url;
  }, [url, wanted]);
  return img;
}

function AdCanvas({ design, info, className }: { design: AdDesign; info: AdInfo; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const img = useImage(info.imageUrl, design.showImage);
  useEffect(() => {
    if (ref.current) drawAd(ref.current, design, info, img);
  }, [design, info, img]);
  return <canvas ref={ref} className={className} aria-label={`Διαφήμιση: ${design.headline}`} />;
}

function exportPng(canvas: HTMLCanvasElement | null) {
  try {
    return canvas?.toDataURL("image/png") ?? null;
  } catch {
    return null;
  }
}

function printAd(dataUrl: string, format: AdDesign["format"]) {
  const w = window.open("", "_blank", "width=800,height=1000");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="el"><head><meta charset="utf-8"><title>Διαφήμιση</title>
<style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4 portrait;margin:10mm}
body{margin:0;display:flex;justify-content:center}img{max-width:100%;max-height:${format === "post" ? "190mm" : "275mm"}}</style>
</head><body><img src="${dataUrl}" alt="Διαφήμιση"><script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

// Visitors: the saved ad.
export function AdPreview({ design, info }: { design: AdDesign; info: AdInfo }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">📣 Η διαφήμιση</h3>
      <AdCanvas design={design} info={info} className="mx-auto block max-h-[560px] w-auto max-w-full rounded-xl shadow-md" />
    </div>
  );
}

export function StartupAd({
  startupId,
  info,
  initial,
  onSaved,
}: {
  startupId: string;
  info: AdInfo;
  initial?: AdDesign;
  onSaved: (d: AdDesign) => void;
}) {
  const [d, setD] = useState<AdDesign>(initial ?? defaultAd(info));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof AdDesign>(k: K, v: AdDesign[K]) => setD((x) => ({ ...x, [k]: v }));
  const hasPrice = Boolean(info.costing?.price);

  const canvasNow = () => wrapRef.current?.querySelector("canvas") ?? null;

  const download = () => {
    const url = exportPng(canvasNow());
    if (!url) {
      setMsg({ ok: false, text: "Δεν έγινε η λήψη. Δοκίμασε χωρίς τη ζωγραφιά ή με εκτύπωση." });
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `${info.name.replace(/[^\p{L}\p{N}]+/gu, "-") || "diafimisi"}.png`;
    a.click();
  };
  const print = () => {
    const url = exportPng(canvasNow());
    if (url) printAd(url, d.format);
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const clean: AdDesign = { ...d, headline: d.headline.trim(), text: d.text.trim(), cta: d.cta.trim(), where: d.where.trim() };
    try {
      const res = await saveStartupPlan({ data: { startupId, part: "ad", value: clean } });
      if (res.ok) {
        onSaved(clean);
        setMsg({ ok: true, text: "Αποθηκεύτηκε! Η διαφήμιση φαίνεται τώρα στη σελίδα της εταιρείας σου." });
      } else {
        setMsg({ ok: false, text: res.reason === "bad_words" ? "Ας κρατήσουμε τα κείμενα ευγενικά 😊" : "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
      }
    } catch {
      setMsg({ ok: false, text: "Δεν αποθηκεύτηκε. Δοκίμασε ξανά." });
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-xl border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[oklch(0.57_0.23_292)]";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-2xl font-black">📣 Η διαφήμισή σου</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ένα καταπληκτικό προϊόν δεν πουλάει αν δεν το ξέρει κανείς. Φτιάξε μια αφίσα ή ένα post που λέει σε λίγες λέξεις γιατί να το αγοράσουν.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold">Μορφή</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SIZES) as AdDesign["format"][]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set("format", f)}
                  className={`rounded-xl border-2 px-2 py-2 text-sm font-black ${d.format === f ? "border-[oklch(0.57_0.23_292)] bg-[oklch(0.97_0.03_292)]" : "border-border"}`}
                >
                  {SIZES[f].label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{SIZES[d.format].hint}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold">Χρώματα</p>
            <div className="flex flex-wrap gap-2">
              {AD_THEMES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => set("theme", i)}
                  title={t.name}
                  aria-label={`Χρώματα: ${t.name}`}
                  className={`h-10 w-10 rounded-full border-4 ${d.theme === i ? "border-foreground" : "border-transparent"}`}
                  style={{ background: `linear-gradient(135deg, ${t.band[0]}, ${t.band[1]})` }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Σύνθημα (μεγάλα γράμματα)</label>
            <input className={input} value={d.headline} maxLength={50} onChange={(e) => set("headline", e.target.value)} placeholder="π.χ. Το πιο γλυκό διάλειμμα!" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Γιατί να το αγοράσουν (το USP σου)</label>
            <textarea className={`${input} min-h-[80px] resize-none`} value={d.text} maxLength={140} onChange={(e) => set("text", e.target.value)} />
            <p className="text-right text-xs text-muted-foreground">{d.text.length}/140</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Τι να κάνει ο πελάτης</label>
            <input className={input} value={d.cta} maxLength={30} onChange={(e) => set("cta", e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CTA_IDEAS.map((c) => (
                <button key={c} type="button" onClick={() => set("cta", c)} className="rounded-full bg-muted px-3 py-1 text-xs font-bold hover:bg-muted/70">
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Πού θα σε βρουν</label>
            <input className={input} value={d.where} maxLength={60} onChange={(e) => set("where", e.target.value)} placeholder="π.χ. Γιορτή του σχολείου, Σάββατο 10:00" />
          </div>

          <label className={`flex items-center gap-3 text-sm font-bold ${hasPrice ? "" : "opacity-50"}`}>
            <input type="checkbox" disabled={!hasPrice} checked={d.showPrice && hasPrice} onChange={(e) => set("showPrice", e.target.checked)} className="h-4 w-4" />
            Δείξε την τιμή {hasPrice ? `(${priceText(info.costing)})` : "(κάνε πρώτα την κοστολόγηση)"}
          </label>
          <label className={`flex items-center gap-3 text-sm font-bold ${info.imageUrl ? "" : "opacity-50"}`}>
            <input type="checkbox" disabled={!info.imageUrl} checked={d.showImage && Boolean(info.imageUrl)} onChange={(e) => set("showImage", e.target.checked)} className="h-4 w-4" />
            Βάλε τη ζωγραφιά του προϊόντος {info.imageUrl ? "" : "(ζωγράφισέ το πρώτα)"}
          </label>
        </div>

        {/* Preview */}
        <div>
          <div ref={wrapRef} className="rounded-2xl bg-muted/40 p-4">
            <AdCanvas design={d} info={info} className="mx-auto block max-h-[620px] w-auto max-w-full rounded-xl shadow-lg" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-full" onClick={download}>
              <Download size={16} /> Κατέβασέ τη
            </Button>
            <Button variant="outline" className="rounded-full" onClick={print}>
              <Printer size={16} /> Εκτύπωση
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[oklch(0.97_0.03_80)] p-4 text-sm">
        <p className="font-black">Πού θα τη δείξεις;</p>
        <p className="mt-1 text-muted-foreground">
          Στον πίνακα ανακοινώσεων του σχολείου, στο μαγαζί της γειτονιάς (ρώτα πρώτα), στους φίλους και στην οικογένεια, ή στα social media με τη
          βοήθεια ενός γονιού. Δες και πώς διαφημίζουν άλλες επιχειρήσεις παρόμοια προϊόντα: τι σου τράβηξε την προσοχή;
        </p>
      </div>

      {msg && (
        <p className={`rounded-xl p-3 text-sm font-bold ${msg.ok ? "bg-[oklch(0.93_0.06_173)] text-[oklch(0.3_0.1_173)]" : "bg-destructive/10 text-destructive"}`}>
          {msg.text}
        </p>
      )}
      <Button onClick={save} disabled={saving || !d.headline.trim()} className="h-12 w-full rounded-full font-black">
        {saving ? "Αποθήκευση…" : "💾 Αποθήκευσε τη διαφήμιση"}
      </Button>
    </div>
  );
}
