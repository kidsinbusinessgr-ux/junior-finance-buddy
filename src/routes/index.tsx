import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Pause } from "lucide-react";
import heroKid from "@/assets/bright-card-kid.jpg";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids in Business β€” Ξ§ΟΞ·ΞΌΞ±Ο„ΞΏΞΏΞΉΞΊΞΏΞ½ΞΏΞΌΞΉΞΊΞ® Ο€Ξ±ΞΉΞ΄ΞµΞ―Ξ± Ξ³ΞΉΞ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬" },
      { name: "description", content: "Ξ— ΞµΟ†Ξ±ΟΞΌΞΏΞ³Ξ® Ο€ΞΏΟ… Ξ΄ΞΉΞ΄Ξ¬ΟƒΞΊΞµΞΉ ΟƒΟ„Ξ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬ Ξ·Ξ»ΞΉΞΊΞ―Ξ±Ο‚ 12β€“17 Ο‡ΟΟΞ½Ο‰Ξ½ Ο€ΟΟ‚ Ξ½Ξ± ΞΊΞµΟΞ΄Ξ―Ξ¶ΞΏΟ…Ξ½, Ξ±Ο€ΞΏΟ„Ξ±ΞΌΞΉΞµΟΞΏΟ…Ξ½ ΞΊΞ±ΞΉ ΞµΟ€ΞµΞ½Ξ΄ΟΞΏΟ…Ξ½ ΞΌΞµ Ξ­ΞΎΟ…Ο€Ξ½ΞΏ Ο„ΟΟΟ€ΞΏ." },
      { property: "og:title", content: "Kids in Business β€” Ξ§ΟΞ·ΞΌΞ±Ο„ΞΏΞΏΞΉΞΊΞΏΞ½ΞΏΞΌΞΉΞΊΞ® Ο€Ξ±ΞΉΞ΄ΞµΞ―Ξ± Ξ³ΞΉΞ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬" },
      { property: "og:description", content: "Ξ— ΞµΟ†Ξ±ΟΞΌΞΏΞ³Ξ® Ο€ΞΏΟ… Ξ΄ΞΉΞ΄Ξ¬ΟƒΞΊΞµΞΉ ΟƒΟ„Ξ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬ Ξ·Ξ»ΞΉΞΊΞ―Ξ±Ο‚ 12β€“17 Ο‡ΟΟΞ½Ο‰Ξ½ Ο€ΟΟ‚ Ξ½Ξ± ΞΊΞµΟΞ΄Ξ―Ξ¶ΞΏΟ…Ξ½, Ξ±Ο€ΞΏΟ„Ξ±ΞΌΞΉΞµΟΞΏΟ…Ξ½ ΞΊΞ±ΞΉ ΞµΟ€ΞµΞ½Ξ΄ΟΞΏΟ…Ξ½ ΞΌΞµ Ξ­ΞΎΟ…Ο€Ξ½ΞΏ Ο„ΟΟΟ€ΞΏ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = [
    ["Ξ§Ο„Ξ―Ξ¶ΞΏΟ…ΞΌΞµ Ξ±Ο…Ο„ΞΏΟ€ΞµΟ€ΞΏΞ―ΞΈΞ·ΟƒΞ· Ξ³ΟΟΟ‰ Ξ±Ο€Ο Ο„Ξ± Ο‡ΟΞ®ΞΌΞ±Ο„Ξ±", "Ξ¤Ξ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬ ΞΌΞ±ΞΈΞ±Ξ―Ξ½ΞΏΟ…Ξ½ Ξ½Ξ± ΞΊΞµΟΞ΄Ξ―Ξ¶ΞΏΟ…Ξ½, Ξ½Ξ± Ξ±Ο€ΞΏΟ„Ξ±ΞΌΞΉΞµΟΞΏΟ…Ξ½ ΞΊΞ±ΞΉ Ξ½Ξ± ΞΎΞΏΞ΄ΞµΟΞΏΟ…Ξ½ ΞΌΞµ ΟƒΟΞ½ΞµΟƒΞ·."],
    ["Ξ— ΞµΟ†Ξ±ΟΞΌΞΏΞ³Ξ® Ο€ΞΏΟ… Ο„Ξ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬ ΞΈΞ± Ξ±Ξ³Ξ±Ο€Ξ®ΟƒΞΏΟ…Ξ½", "ΞΞΉΞΊΟΞ­Ο‚ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚ ΟƒΞ®ΞΌΞµΟΞ± Ξ³Ξ―Ξ½ΞΏΞ½Ο„Ξ±ΞΉ Ξ­ΞΎΟ…Ο€Ξ½ΞµΟ‚ ΟƒΟ…Ξ½Ξ®ΞΈΞµΞΉΞµΟ‚ Ξ±ΟΟΞΉΞΏ."],
    ["ΞΞ¬ΞΈΞ·ΟƒΞ· Ξ±Ο€Ξ»Ξ® ΞΊΞ±ΞΉ Ξ΄ΞΉΞ±ΟƒΞΊΞµΞ΄Ξ±ΟƒΟ„ΞΉΞΊΞ®", "ΞΞ­ΟƒΞµ ΟƒΟ„ΟΟ‡ΞΏΟ…Ο‚, ΞΊΞ­ΟΞ΄ΞΉΟƒΞµ Ξ±Ξ½Ο„Ξ±ΞΌΞΏΞΉΞ²Ξ­Ο‚ ΞΊΞ±ΞΉ Ο€ΟΟΞΏΞ΄ΞΏΟ‚ ΞΌΞ±Ξ¶Ξ―."],
  ];
  const currentTitle = slides[slide]?.[0] ?? "";
  const currentCopy = slides[slide]?.[1] ?? "";
  const advance = (direction: number) => setSlide((slide + direction + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => advance(1), 4000);
    return () => clearInterval(timer);
  }, [slide, paused]);

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative min-h-[770px] overflow-hidden bg-[oklch(0.57_0.23_292)] text-primary-foreground lg:min-h-[850px]">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,oklch(0.52_0.24_290),oklch(0.65_0.19_295))]" />
        <div className="relative mx-auto max-w-[1440px] px-6 pb-14 pt-5 lg:px-16">
          <BrightlyNav />

          <div id="top" className="grid items-center gap-4 pb-12 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:pt-28">
            <div className="relative z-10 max-w-[620px]">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.91_0.07_292)]">Ξ“ΞΉΞ± Ξ·Ξ»ΞΉΞΊΞ―ΞµΟ‚ 12β€“17</p>
              <h1 className="text-5xl font-black leading-[0.99] tracking-tight sm:text-6xl lg:text-7xl">{currentTitle}</h1>
              <p className="mt-7 max-w-xl text-xl leading-relaxed text-[oklch(0.96_0.02_292)] lg:text-2xl">{currentCopy}</p>
              <Link to="/signup">
                <Button className="mt-9 h-14 rounded-full bg-primary px-10 text-base text-primary-foreground hover:bg-primary/90">ΞΞµΞΊΞ―Ξ½Ξ± Ξ΄Ο‰ΟΞµΞ¬Ξ½</Button>
              </Link>
            </div>
            <div className="relative mx-auto mt-7 aspect-square w-full max-w-[610px] lg:mt-0">
              <div className="hero-orb absolute inset-[8%] rounded-full" />
              <div className="hero-ring absolute bottom-[3%] right-[5%] h-[39%] w-[39%] rounded-full" />
              <div className="drift absolute left-[2%] top-[40%] h-12 w-28 rotate-[-18deg] rounded-full border-[12px] border-[oklch(0.76_0.21_182)] border-r-transparent" />
              <div className="float-slow absolute right-[11%] top-[6%] h-7 w-18 rotate-[-12deg] rounded-full bg-[oklch(0.74_0.21_318)]" />
              <img src={heroKid} width={1200} height={1200} alt="Ξ Ξ±ΞΉΞ΄Ξ― ΞΌΞµ ΞΊΞ¬ΟΟ„Ξ± ΞΊΞ±ΞΉ ΞΊΞΉΞ½Ξ·Ο„Ο" className="relative z-10 h-full w-full rounded-full object-cover mix-blend-normal" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setPaused(!paused)}
                variant="ghost"
                size="icon"
                className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]"
                aria-label={paused ? "Ξ‘Ξ½Ξ±Ο€Ξ±ΟΞ±Ξ³Ο‰Ξ³Ξ®" : "Ξ Ξ±ΟΟƒΞ·"}
              >
                {paused ? <ArrowRight size={20} /> : <Pause size={18} />}
              </Button>
              <div className="flex gap-2 rounded-full bg-[oklch(0.79_0.11_292)] px-5 py-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Ξ”ΞΉΞ±Ο†Ξ¬Ξ½ΞµΞΉΞ± ${index + 1}`}
                    onClick={() => setSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${slide === index ? 'w-7 bg-primary' : 'w-2.5 bg-[oklch(0.55_0.1_292)]'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => advance(-1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Ξ ΟΞΏΞ·Ξ³ΞΏΟΞΌΞµΞ½Ξ· Ξ΄ΞΉΞ±Ο†Ξ¬Ξ½ΞµΞΉΞ±"><ArrowLeft /></Button>
              <Button onClick={() => advance(1)} variant="ghost" size="icon" className="rounded-full bg-[oklch(0.79_0.11_292)] text-primary hover:bg-[oklch(0.88_0.08_292)]" aria-label="Ξ•Ο€ΟΞΌΞµΞ½Ξ· Ξ΄ΞΉΞ±Ο†Ξ¬Ξ½ΞµΞΉΞ±"><ArrowRight /></Button>
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-5xl px-6 pb-8 pt-8 text-center">
          <p className="text-3xl font-black leading-tight sm:text-4xl">Ξ•Ο€ΞΉΟ‡ΞµΞΉΟΞ·ΞΌΞ±Ο„ΞΉΞΊΟΟ„Ξ·Ο„Ξ± ΞΊΞ±ΞΉ Ο‡ΟΞ·ΞΌΞ±Ο„ΞΏΞΏΞΉΞΊΞΏΞ½ΞΏΞΌΞΉΞΊΞ® Ο€Ξ±ΞΉΞ΄ΞµΞ―Ξ± Ξ³ΞΉΞ± Ξ½Ξ­ΞΏΟ…Ο‚ Ξ·Ξ»ΞΉΞΊΞ―Ξ±Ο‚ 12β€“17</p>
          <p className="mt-3 text-xs text-[oklch(0.89_0.06_292)]">ΞΞ±ΞΈΞ±Ξ―Ξ½ΞΏΟ…ΞΌΞµ Ο„Ξ± Ο€Ξ±ΞΉΞ΄ΞΉΞ¬ Ξ½Ξ± ΟƒΞΊΞ­Ο†Ο„ΞΏΞ½Ο„Ξ±ΞΉ ΟƒΞ±Ξ½ ΞµΟ€ΞΉΟ‡ΞµΞΉΟΞ·ΞΌΞ±Ο„Ξ―ΞµΟ‚</p>
        </div>
      </section>

      {/* Feature cards */}
      <section id="discover" className="bg-[oklch(0.985_0.015_91)] px-6 py-20 text-foreground lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.15em] text-[oklch(0.56_0.15_35)]">Ξ¦Ο„ΞΉΞ±Ξ³ΞΌΞ­Ξ½ΞΏ Ξ³ΞΉΞ± Ο„Ξ·Ξ½ ΞΊΞ±ΞΈΞ·ΞΌΞµΟΞΉΞ½Ξ® Ξ¶Ο‰Ξ®</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">ΞΞΉΞΊΟΞ¬ Ξ²Ξ®ΞΌΞ±Ο„Ξ±. ΞΞµΞ³Ξ¬Ξ»ΞµΟ‚ Ξ΄Ο…Ξ½Ξ±Ο„ΟΟ„Ξ·Ο„ΞµΟ‚.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["ΞΞ­ΟΞ΄ΞΉΟƒΞµ", "ΞΞµΟ„Ξ¬Ο„ΟΞµΟΞµ Ο„ΞΉΟ‚ Ξ΄ΞΏΟ…Ξ»ΞµΞΉΞ­Ο‚ ΟƒΞµ Ξ±ΞΎΞ―Ξ± ΞΊΞ±ΞΉ Ο…Ο€ΞµΟΞ·Ο†Ξ¬Ξ½ΞµΞΉΞ±.", "/earn"],
              ["Ξ‘Ο€ΞΏΟ„Ξ±ΞΌΞ―ΞµΟ…ΟƒΞµ", "Ξ¦Ξ­ΟΞµ Ο„ΞΏΟ…Ο‚ ΟƒΟ„ΟΟ‡ΞΏΟ…Ο‚ ΟƒΞΏΟ… Ο€ΞΉΞΏ ΞΊΞΏΞ½Ο„Ξ¬, Ξ­Ξ½Ξ± Ξ²Ξ®ΞΌΞ± Ο„Ξ· Ο†ΞΏΟΞ¬.", "/save"],
              ["ΞΟΞ΄ΞµΟΞµ", "Ξ•ΞΎΞ¬ΟƒΞΊΞ·ΟƒΞµ Ο„ΞΉΟ‚ ΞµΟ€ΞΉΞ»ΞΏΞ³Ξ­Ο‚ ΟƒΞΏΟ… ΞΌΞµ Ξ±ΟƒΟ†Ξ¬Ξ»ΞµΞΉΞ±.", "/spend"],
            ].map(([title, copy, to], index) => (
              <Link
                key={title}
                to={to as "/earn" | "/save" | "/spend"}
                className="rounded-lg bg-card p-6 shadow-sm transition-transform hover:-translate-y-1"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-lg font-black">{index + 1}</span>
                <h3 className="mt-6 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Parents section */}
      <section className="bg-[oklch(0.75_0.18_173)] px-6 py-16 text-accent-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em]">Ξ¦Ο„ΞΉΞ±Ξ³ΞΌΞ­Ξ½ΞΏ ΞΌΞµ Ξ³ΞΏΞ½ΞµΞ―Ο‚</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Ξ ΞµΟΞΉΟƒΟƒΟΟ„ΞµΟΞ· Ξ±Ο…Ο„ΞΏΟ€ΞµΟ€ΞΏΞ―ΞΈΞ·ΟƒΞ·, ΞΊΞ¬ΞΈΞµ ΞΌΞ­ΟΞ±.</h2>
          </div>
          <ul className="grid gap-3 text-lg">
            {[
              'Ξ”ΞµΟ‚ Ο„Ξ· Ξ΄ΟΞ±ΟƒΟ„Ξ·ΟΞΉΟΟ„Ξ·Ο„Ξ± ΞΌΞµ ΞΌΞΉΞ± ΞΌΞ±Ο„ΞΉΞ¬',
              'ΞΟΞΉΟƒΞµ ΞµΟ…Ξ­Ξ»ΞΉΞΊΟ„ΞΏΟ…Ο‚ ΞΊΞ±Ξ½ΟΞ½ΞµΟ‚ Ξ΄Ξ±Ο€Ξ±Ξ½ΟΞ½',
              'Ξ“ΞΉΟΟΟ„Ξ±ΟƒΞµ Ο„ΞΉΟ‚ Ο…Ξ³ΞΉΞµΞ―Ο‚ ΟƒΟ…Ξ½Ξ®ΞΈΞµΞΉΞµΟ‚',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5" />{item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-background px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">ΞΟ„ΞΏΞΉΞΌΞΏΟ‚ Ξ½Ξ± ΞΎΞµΞΊΞΉΞ½Ξ®ΟƒΞµΞΉΟ‚;</h2>
          <p className="mt-4 text-lg text-muted-foreground">Ξ•Ξ³Ξ³ΟΞ¬ΟΞΏΟ… Ξ΄Ο‰ΟΞµΞ¬Ξ½ ΞΊΞ±ΞΉ ΞΎΞµΞΊΞ―Ξ½Ξ± Ξ½Ξ± Ο‡Ο„Ξ―Ξ¶ΞµΞΉΟ‚ ΞΏΞΉΞΊΞΏΞ½ΞΏΞΌΞΉΞΊΞ­Ο‚ Ξ΄ΞµΞΎΞΉΟΟ„Ξ·Ο„ΞµΟ‚ ΞΌΞµ Ο„ΞΏ Ο€Ξ±ΞΉΞ΄Ξ― ΟƒΞΏΟ… ΟƒΞ®ΞΌΞµΟΞ±.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button className="h-14 rounded-full px-10 text-base">Ξ•Ξ³Ξ³ΟΞ±Ο†Ξ® Ξ΄Ο‰ΟΞµΞ¬Ξ½</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="h-14 rounded-full px-10 text-base">ΞΟ‡Ο‰ Ξ®Ξ΄Ξ· Ξ»ΞΏΞ³Ξ±ΟΞΉΞ±ΟƒΞΌΟ</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

