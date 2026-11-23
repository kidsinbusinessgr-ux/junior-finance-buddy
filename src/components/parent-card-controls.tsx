import { useCallback, useEffect, useState } from "react";
import { CreditCard, Gift, Lock, Trash2, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { JFBReward, ParentChild } from "@/hooks/useJFB";
import { KibCard } from "@/components/kib-card";
import { MonthlyStatement } from "@/components/monthly-statement";

// Parent side of the virtual card: lock it, set a weekly limit, see what the
// child paid with it, and keep the Shop's rewards (what the child can pay for).

type Payment = { id: string; amount: number; description: string; created_at: string | null };

function ChildCard({ child, onChanged }: { child: ParentChild; onChanged: () => void }) {
  const [limit, setLimit] = useState<string>(child.card_weekly_limit ? String(child.card_weekly_limit) : "");
  const [spent, setSpent] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showStatement, setShowStatement] = useState(false);

  const load = useCallback(async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.rpc("jfb_card_week_spent", { p_child_id: child.id }),
      supabase
        .from("jfb_transactions")
        .select("id, amount, description, created_at")
        .eq("child_id", child.id)
        .eq("type", "card")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    setSpent(typeof s === "number" ? s : 0);
    setPayments((p as Payment[]) ?? []);
  }, [child.id]);

  useEffect(() => { load(); }, [load, child.coins]);

  const save = async (locked: boolean, weekly: string) => {
    setBusy(true);
    setMsg(null);
    const n = parseInt(weekly, 10);
    const { error } = await supabase.rpc("jfb_parent_card_settings", {
      p_child_id: child.id,
      p_locked: locked,
      p_weekly_limit: Number.isFinite(n) && n > 0 ? n : null,
    });
    setBusy(false);
    if (error) {
      setMsg("Δεν αποθηκεύτηκε. Δοκίμασε ξανά.");
      return;
    }
    setMsg("Αποθηκεύτηκε.");
    onChanged();
  };

  const limitNum = child.card_weekly_limit;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <KibCard color={child.card_color} pattern={child.card_pattern} name={child.name} coins={child.coins} compact />
        <div className="space-y-3">
          <button
            disabled={busy}
            onClick={() => save(!child.card_parent_locked, limit)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${child.card_parent_locked ? "border-red-300 bg-red-50 text-red-700" : "border-[oklch(0.85_0.04_250)] text-[oklch(0.3_0.08_250)] hover:bg-[oklch(0.97_0.01_250)]"}`}
          >
            <span className="flex items-center gap-2">
              {child.card_parent_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 text-[oklch(0.55_0.17_173)]" />}
              {child.card_parent_locked ? "Κλειδωμένη από εσένα" : "Η κάρτα είναι ενεργή"}
            </span>
            <span className="font-bold">{child.card_parent_locked ? "Ξεκλείδωσε" : "Κλείδωσε"}</span>
          </button>
          {child.card_locked && !child.card_parent_locked && (
            <p className="text-xs text-[oklch(0.5_0.04_250)]">Το παιδί έχει κλειδώσει μόνο του την κάρτα του.</p>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-[oklch(0.35_0.08_250)]">Όριο ανά εβδομάδα (κέρματα)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Χωρίς όριο"
                className="w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-2.5 text-[oklch(0.3_0.08_250)]"
              />
              <button
                disabled={busy}
                onClick={() => save(child.card_parent_locked, limit)}
                className="rounded-xl bg-[oklch(0.55_0.18_250)] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Αποθήκευση
              </button>
            </div>
            <p className="mt-1 text-xs text-[oklch(0.5_0.04_250)]">
              Αυτή την εβδομάδα: {spent ?? "…"} κέρματα με την κάρτα{limitNum ? ` από ${limitNum}` : ""}. Άφησέ το κενό για να μην υπάρχει όριο.
            </p>
          </div>
          {msg && <p className="text-xs font-bold text-[oklch(0.45_0.12_250)]">{msg}</p>}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-[oklch(0.35_0.08_250)]">Τελευταίες πληρωμές με κάρτα</p>
        {payments.length === 0 ? (
          <p className="mt-1 text-sm text-[oklch(0.55_0.04_250)]">Καμία πληρωμή ακόμα.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[oklch(0.92_0.02_250)]">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-[oklch(0.3_0.08_250)]">{p.description.replace(/^Κάρτα: /, "")}</span>
                <span className="font-bold text-[oklch(0.5_0.15_25)]">
                  {p.amount} 🪙 · {p.created_at ? new Date(p.created_at).toLocaleDateString("el-GR", { day: "numeric", month: "short" }) : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => setShowStatement((v) => !v)}
        className="mt-4 w-full rounded-xl border border-[oklch(0.85_0.04_250)] py-2.5 text-sm font-bold text-[oklch(0.4_0.08_250)] hover:bg-[oklch(0.97_0.01_250)]"
      >
        {showStatement ? "Κλείσε τη μηνιαία κίνηση" : "Δες τη μηνιαία κίνηση"}
      </button>
      {showStatement && (
        <div className="mt-3">
          <MonthlyStatement childId={child.id} coins={child.coins} name={child.name} />
        </div>
      )}
    </div>
  );
}

export function ParentCardControls({ children, onChanged }: { children: ParentChild[]; onChanged: () => void }) {
  if (children.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-[oklch(0.35_0.08_250)]">
        <CreditCard className="h-5 w-5" /> Η κάρτα του παιδιού
      </h2>
      <p className="mb-3 text-sm text-[oklch(0.5_0.04_250)]">
        Εικονική κάρτα με τα κέρματα της εφαρμογής. Με αυτήν το παιδί πληρώνει τις ανταμοιβές του Καταστήματος.
      </p>
      <div className="flex flex-col gap-3">
        {children.map((c) => (
          <ChildCard key={c.id} child={c} onChanged={onChanged} />
        ))}
      </div>
    </section>
  );
}

export function ParentRewards({ parentId }: { parentId: string }) {
  const [rewards, setRewards] = useState<JFBReward[]>([]);
  const [name, setName] = useState("");
  const [cost, setCost] = useState<string>("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("jfb_rewards")
      .select("*")
      .eq("parent_id", parentId)
      .eq("active", true)
      .order("cost");
    setRewards(data ?? []);
  }, [parentId]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const n = parseInt(cost, 10);
    if (!name.trim() || !Number.isFinite(n) || n <= 0) {
      setError("Γράψε όνομα και κόστος σε κέρματα.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("jfb_rewards")
      .insert({ parent_id: parentId, name: name.trim().slice(0, 60), cost: Math.min(n, 100000), emoji: "🎁" });
    setBusy(false);
    if (err) {
      setError("Δεν προστέθηκε. Δοκίμασε ξανά.");
      return;
    }
    setName("");
    load();
  };

  // Hidden, not deleted, so past payments keep their reward.
  const remove = async (id: string) => {
    await supabase.from("jfb_rewards").update({ active: false }).eq("id", id);
    load();
  };

  return (
    <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-[oklch(0.35_0.08_250)]">
        <Gift className="h-5 w-5" /> Ανταμοιβές στο Κατάστημα
      </h2>
      <p className="mb-4 text-sm text-[oklch(0.5_0.04_250)]">
        Ό,τι βάλεις εδώ, το παιδί μπορεί να το «αγοράσει» με την κάρτα του. Π.χ. «1 ώρα παιχνίδι» για 30 κέρματα.
      </p>
      {rewards.length === 0 ? (
        <p className="mb-4 text-sm text-[oklch(0.55_0.04_250)]">Δεν έχεις βάλει ακόμα ανταμοιβές.</p>
      ) : (
        <ul className="mb-4 divide-y divide-[oklch(0.92_0.02_250)]">
          {rewards.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span className="text-[oklch(0.3_0.08_250)]">{r.name}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-bold text-[oklch(0.4_0.08_250)]">{r.cost} 🪙</span>
                <button onClick={() => remove(r.id)} aria-label={`Αφαίρεση: ${r.name}`} className="rounded-lg p-1.5 text-[oklch(0.55_0.15_25)] hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ανταμοιβή, π.χ. 1 ώρα παιχνίδι"
          className="w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-2.5 text-[oklch(0.3_0.08_250)]"
        />
        <input
          type="number"
          min={1}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full rounded-xl border border-[oklch(0.85_0.04_250)] p-2.5 text-[oklch(0.3_0.08_250)] sm:w-28"
          aria-label="Κόστος σε κέρματα"
        />
        <button
          disabled={busy}
          onClick={add}
          className="rounded-xl bg-[oklch(0.55_0.18_250)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          Προσθήκη
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </section>
  );
}
