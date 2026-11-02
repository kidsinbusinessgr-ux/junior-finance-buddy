import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Star, XCircle } from "lucide-react";
import { BrightlyNav } from "@/components/brightly-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/learn/$lessonId")({
  component: LessonPage,
});

// ─── Lesson data ────────────────────────────────────────────────────────────

type Slide = { heading: string; body: string; emoji: string };
type Question = { q: string; options: string[]; correct: number; explain: string };
type Lesson = {
  id: number;
  title: string;
  emoji: string;
  xp: number;
  color: string;
  slides: Slide[];
  questions: Question[];
};

const lessons: Record<string, Lesson> = {
  "1": {
    id: 1,
    title: "Τι είναι τα χρήματα;",
    emoji: "💰",
    xp: 100,
    color: "oklch(0.57_0.23_292)",
    slides: [
      {
        heading: "Πριν τα χρήματα…",
        body: "Φαντάσου να θέλεις ψωμί αλλά να έχεις μόνο ψάρια. Έπρεπε να βρεις κάποιον που να θέλει ψάρια ΚΑΙ να έχει ψωμί. Αυτό λέγεται αντιπραγματισμός — και ήταν πολύ δύσκολο!",
        emoji: "🐟🍞",
      },
      {
        heading: "Ήρθαν τα νομίσματα",
        body: "Οι άνθρωποι σκέφτηκαν: «Ας χρησιμοποιήσουμε κάτι που ΟΛΟΙ αποδέχονται — νομίσματα από μέταλλο.» Έτσι γεννήθηκαν τα χρήματα πριν από περίπου 3.000 χρόνια!",
        emoji: "🪙",
      },
      {
        heading: "Σήμερα: ψηφιακά χρήματα",
        body: "Σήμερα τα χρήματα μπορούν να είναι νομίσματα, χαρτονομίσματα ή ψηφιακά — στο κινητό ή στην κάρτα σου. Αλλά η λειτουργία είναι η ίδια: μέσο ανταλλαγής για αγαθά και υπηρεσίες.",
        emoji: "📱💳",
      },
    ],
    questions: [
      {
        q: "Πώς άλλαζαν αγαθά οι άνθρωποι ΠΡΙΝ τα χρήματα;",
        options: ["Με αντιπραγματισμό (ανταλλαγή)", "Με τραπεζικές κάρτες", "Με κρυπτονομίσματα", "Δεν άλλαζαν τίποτα"],
        correct: 0,
        explain: "Σωστά! Ο αντιπραγματισμός ήταν η ανταλλαγή αγαθών χωρίς χρήματα — π.χ. ψάρια για ψωμί.",
      },
      {
        q: "Ποιο από αυτά ΔΕΝ είναι αποδεκτή μορφή χρήματος;",
        options: ["Κέρμα €1", "Χαρτονόμισμα €10", "Τυχαία πέτρα από τον κήπο", "Κάρτα debit"],
        correct: 2,
        explain: "Ακριβώς! Τα χρήματα πρέπει να γίνονται αποδεκτά από ΟΛΟΥΣ. Μια πέτρα δεν έχει αξία από μόνη της.",
      },
      {
        q: "Τι σημαίνει ότι τα χρήματα είναι «μέσο ανταλλαγής»;",
        options: ["Τα ανταλλάσσουμε μόνο με φίλους", "Τα χρησιμοποιούμε για να αγοράζουμε και να πουλάμε", "Τα φυλάμε κάτω από το μαξιλάρι", "Τα δίνουμε δωρεάν"],
        correct: 1,
        explain: "Μπράβο! Τα χρήματα μας επιτρέπουν να ανταλλάσσουμε εύκολα αγαθά και υπηρεσίες με οποιονδήποτε.",
      },
    ],
  },
  "2": {
    id: 2,
    title: "Ανάγκες vs Επιθυμίες",
    emoji: "🛒",
    xp: 150,
    color: "oklch(0.55_0.17_173)",
    slides: [
      {
        heading: "Τι είναι ανάγκη;",
        body: "Ανάγκη είναι κάτι που χρειαζόμαστε για να ζούμε και να μαθαίνουμε: φαγητό, νερό, ρούχα, στέγη, σχολικά. Χωρίς αυτά δεν μπορούμε να λειτουργήσουμε.",
        emoji: "🏠🍎📚",
      },
      {
        heading: "Τι είναι επιθυμία;",
        body: "Επιθυμία είναι κάτι που θέλουμε αλλά δεν χρειαζόμαστε απαραίτητα. Νέο παιχνίδι, αυτοκόλλητα, bubble tea — ωραία πράγματα, αλλά ζούμε και χωρίς αυτά!",
        emoji: "🎮🧋✨",
      },
      {
        heading: "Γιατί έχει σημασία;",
        body: "Όταν έχεις λίγα χρήματα, πρέπει πρώτα να καλύψεις τις ΑΝΑΓΚΕΣ σου. Μετά, αν περισσεύουν χρήματα, μπορείς να σκεφτείς τις επιθυμίες σου — ή να τα αποταμιεύσεις!",
        emoji: "⚖️",
      },
    ],
    questions: [
      {
        q: "Ποιο από αυτά είναι ΑΝΑΓΚΗ;",
        options: ["Νέο PlayStation 5", "Φαγητό για μεσημεριανό", "Αυτοκόλλητα για το notebook", "Candy από το κυλικείο"],
        correct: 1,
        explain: "Σωστά! Το φαγητό είναι βασική ανάγκη — χρειαζόμαστε ενέργεια για να λειτουργούμε.",
      },
      {
        q: "Ποιο από αυτά είναι ΕΠΙΘΥΜΙΑ;",
        options: ["Παπούτσια για το σχολείο", "Νερό", "3ο ζευγάρι sneakers", "Σχολική τσάντα"],
        correct: 2,
        explain: "Ακριβώς! Αν έχεις ήδη παπούτσια, ένα 3ο ζευγάρι είναι επιθυμία — όχι ανάγκη.",
      },
      {
        q: "Έχεις €5 μόνο αυτή την εβδομάδα. Τι αγοράζεις ΠΡΩΤΑ;",
        options: ["Bubble tea €4", "Sandwich για μεσημεριανό €3", "Αυτοκόλλητα €2", "Κόμικς €4,50"],
        correct: 1,
        explain: "Μπράβο! Το φαγητό είναι ανάγκη. Μετά, αν περισσεύει κάτι, σκέψου τις επιθυμίες σου.",
      },
    ],
  },
  "3": {
    id: 3,
    title: "Πώς λειτουργεί η αποταμίευση",
    emoji: "🐷",
    xp: 150,
    color: "oklch(0.57_0.2_28)",
    slides: [
      {
        heading: "Μικρά ποσά, μεγάλα αποτελέσματα",
        body: "Αν βάζεις €2 κάθε εβδομάδα στο κουμπαρά σου, σε έναν χρόνο έχεις €104! Η αποταμίευση δεν χρειάζεται μεγάλα ποσά — χρειάζεται συνέπεια.",
        emoji: "🐷💸",
      },
      {
        heading: "Ο κανόνας του 50-30-20",
        body: "Μια ιδέα: από κάθε €10 που παίρνεις, βάλε €5 για ανάγκες, €3 για επιθυμίες, και €2 για αποταμίευση. Ακόμα και €1-2 την εβδομάδα φτιάχνουν έναν στόχο!",
        emoji: "📊",
      },
      {
        heading: "Βάλε στόχο!",
        body: "Η αποταμίευση είναι πιο εύκολη όταν έχεις ΣΥΓΚΕΚΡΙΜΕΝΟ στόχο. Θες ποδήλατο €50; Αν αποταμιεύεις €5 την εβδομάδα, σε 10 εβδομάδες το έχεις!",
        emoji: "🎯🚲",
      },
    ],
    questions: [
      {
        q: "Αποταμιεύεις €3 κάθε εβδομάδα. Πόσα έχεις σε 4 εβδομάδες;",
        options: ["€3", "€7", "€12", "€20"],
        correct: 2,
        explain: "Σωστά! €3 × 4 εβδομάδες = €12. Μικρά ποσά μαζεύονται γρήγορα!",
      },
      {
        q: "Ποιος είναι ο καλύτερος λόγος για να αποταμιεύεις;",
        options: ["Για να μην ξοδεύεις ποτέ", "Για να φτάσεις έναν στόχο που θέλεις", "Γιατί το λένε οι γονείς", "Για να έχεις ψιλά στην τσέπη"],
        correct: 1,
        explain: "Ακριβώς! Ένας συγκεκριμένος στόχος σε κρατά κινητοποιημένο — π.χ. ποδήλατο, παιχνίδι, εκδρομή.",
      },
      {
        q: "Θες να αγοράσεις ένα παιχνίδι €30. Αποταμιεύεις €5/εβδομάδα. Σε πόσες εβδομάδες το αγοράζεις;",
        options: ["3 εβδομάδες", "6 εβδομάδες", "10 εβδομάδες", "30 εβδομάδες"],
        correct: 1,
        explain: "Μπράβο! €30 ÷ €5 = 6 εβδομάδες. Ο σχεδιασμός κάνει τους στόχους εφικτούς!",
      },
    ],
  },
  "4": {
    id: 4,
    title: "Το πρώτο μου budget",
    emoji: "📊",
    xp: 200,
    color: "oklch(0.57_0.23_292)",
    slides: [
      {
        heading: "Τι είναι budget;",
        body: "Budget (προϋπολογισμός) σημαίνει να ξέρεις πόσα χρήματα μπαίνουν (έσοδα) και πόσα βγαίνουν (έξοδα). Αν τα έξοδα είναι μεγαλύτερα από τα έσοδα — πρόβλημα!",
        emoji: "📝",
      },
      {
        heading: "Έσοδα vs Έξοδα",
        body: "Έσοδα: χαρτζιλίκι, δώρα, εξτρα δουλειές. Έξοδα: σνακ, μεταφορά, χόμπι. Το budget σου βοηθά να δεις αν «βγαίνεις» ή αν ξοδεύεις πιο πολλά από όσα έχεις.",
        emoji: "💰📉",
      },
      {
        heading: "Φτιάξε το δικό σου!",
        body: "Πάρε χαρτί ή ένα app. Γράψε τι παίρνεις κάθε εβδομάδα και τι ξοδεύεις. Αν περισσεύουν χρήματα = αποταμίευση. Αν λείπουν = κόψε κάποιες επιθυμίες.",
        emoji: "✏️📓",
      },
    ],
    questions: [
      {
        q: "Αν έχεις €10 έσοδα και €14 έξοδα, τι έχεις;",
        options: ["Κέρδος €4", "Έλλειμμα −€4", "Ισοζύγιο €0", "Αποταμίευση €4"],
        correct: 1,
        explain: "Σωστά! Ξοδεύεις €4 παραπάνω από ό,τι έχεις — αυτό λέγεται έλλειμμα και πρέπει να το αποφύγεις.",
      },
      {
        q: "Ποιο από αυτά είναι ΕΣΟΔΟ;",
        options: ["Σνακ από κυλικείο", "Χαρτζιλίκι €5", "Λεωφορείο €0,90", "Βιβλίο €8"],
        correct: 1,
        explain: "Ακριβώς! Έσοδο είναι χρήματα που ΠΑΙΡΝΕΙΣ — χαρτζιλίκι, δώρα, αμοιβή από εξτρα δουλειές.",
      },
      {
        q: "Τι κάνεις αν τα έξοδά σου είναι πολύ μεγάλα;",
        options: ["Ζητάς περισσότερο χαρτζιλίκι αμέσως", "Βλέπεις ποιες επιθυμίες μπορείς να κόψεις", "Σταματάς να κάνεις budget", "Δανείζεσαι από φίλο"],
        correct: 1,
        explain: "Μπράβο! Το πρώτο βήμα είναι να ελέγξεις τις επιθυμίες — όχι απαραίτητα να ζητάς πιο πολλά.",
      },
    ],
  },
  "5": {
    id: 5,
    title: "Τι είναι επιχείρηση;",
    emoji: "🏪",
    xp: 200,
    color: "oklch(0.55_0.17_173)",
    slides: [
      {
        heading: "Από ιδέα σε προϊόν",
        body: "Μια επιχείρηση ξεκινά με μια ΙΔΕΑ: «Τι πρόβλημα μπορώ να λύσω για άλλους;» Αν κάποιος πληρώνει για να λυθεί αυτό το πρόβλημα — έχεις επιχείρηση!",
        emoji: "💡",
      },
      {
        heading: "Πώς κερδίζει μια επιχείρηση;",
        body: "Αγοράζεις υλικά (κόστος), φτιάχνεις προϊόν, και το πουλάς πιο ακριβά (τιμή). Η διαφορά είναι το κέρδος. Π.χ.: Αγοράζεις λεμόνια €1, φτιάχνεις λεμονάδα, πουλάς €3 → κέρδος €2!",
        emoji: "🍋💰",
      },
      {
        heading: "Τι χρειάζεσαι;",
        body: "Κάθε επιχείρηση χρειάζεται: προϊόν ή υπηρεσία, πελάτες που το θέλουν, τιμή που καλύπτει το κόστος, και εσένα — τον επιχειρηματία!",
        emoji: "🚀",
      },
    ],
    questions: [
      {
        q: "Αγοράζεις υλικά για €5 και πουλάς το προϊόν για €8. Ποιο είναι το κέρδος σου;",
        options: ["€5", "€8", "€3", "€13"],
        correct: 2,
        explain: "Σωστά! €8 (τιμή) − €5 (κόστος) = €3 κέρδος. Αυτό λέγεται περιθώριο κέρδους!",
      },
      {
        q: "Ποιο είναι το ΠΡΩΤΟ βήμα για μια επιχείρηση;",
        options: ["Να νοικιάσεις κατάστημα", "Να βρεις ιδέα που λύνει ένα πρόβλημα", "Να αγοράσεις διαφήμιση", "Να προσλάβεις υπαλλήλους"],
        correct: 1,
        explain: "Ακριβώς! Κάθε επιτυχημένη επιχείρηση ξεκινά από μια ιδέα που λύνει πραγματικό πρόβλημα.",
      },
      {
        q: "Ποιο από αυτά είναι παράδειγμα μικρής επιχείρησης για παιδί;",
        options: ["Αγορά αεροπλάνου", "Λεμονάδα στη γειτονιά", "Κατασκευή αυτοκινήτων", "Τράπεζα"],
        correct: 1,
        explain: "Μπράβο! Μια stand λεμονάδας είναι τέλεια για αρχή — μικρό κόστος, απλό προϊόν, άμεσοι πελάτες!",
      },
    ],
  },
  "6": {
    id: 6,
    title: "Χρήματα και ευτυχία",
    emoji: "😊",
    xp: 250,
    color: "oklch(0.57_0.23_292)",
    slides: [
      {
        heading: "Αγοράζουν τα χρήματα ευτυχία;",
        body: "Έρευνες δείχνουν ότι τα χρήματα βοηθούν μέχρι ένα σημείο — για να καλύπτεις τις ανάγκες σου και να νιώθεις ασφαλής. Πάνω από αυτό, η ευτυχία δεν αυξάνεται πολύ!",
        emoji: "😊💰",
      },
      {
        heading: "Εμπειρίες vs Πράγματα",
        body: "Μελέτες δείχνουν ότι ξοδεύοντας σε ΕΜΠΕΙΡΙΕΣ (ταξίδια, μαθήματα, βιώματα με φίλους) νιώθουμε πιο ευτυχισμένοι από το να αγοράζουμε πράγματα που γρήγορα βαριόμαστε.",
        emoji: "✈️🎭🎸",
      },
      {
        heading: "Η αληθινή αξία",
        body: "Τα χρήματα είναι ΕΡΓΑΛΕΙΟ — όχι στόχος. Μας δίνουν επιλογές, ελευθερία, και ασφάλεια. Αλλά ευτυχία φτιάχνουν οι σχέσεις, τα χόμπι, και το να βοηθάς άλλους.",
        emoji: "🤝❤️",
      },
    ],
    questions: [
      {
        q: "Σύμφωνα με έρευνες, τι φέρνει περισσότερη ευτυχία;",
        options: ["Να αγοράζεις πολλά παιχνίδια", "Να πας σε συναυλία με φίλους", "Να έχεις τα πιο ακριβά ρούχα", "Να μαζεύεις χρήματα χωρίς να τα ξοδεύεις ποτέ"],
        correct: 1,
        explain: "Σωστά! Εμπειρίες με ανθρώπους που αγαπάμε φέρνουν μεγαλύτερη ευτυχία από υλικά πράγματα.",
      },
      {
        q: "Ποια είναι η σωστή σχέση με τα χρήματα;",
        options: ["Τα χρήματα είναι ο πιο σημαντικός στόχος στη ζωή", "Τα χρήματα είναι εργαλείο για να ζούμε καλά", "Δεν χρειαζόμαστε χρήματα καθόλου", "Πρέπει να τα κρατάμε όλα και να μη δίνουμε τίποτα"],
        correct: 1,
        explain: "Ακριβώς! Τα χρήματα είναι εργαλείο — μας βοηθούν να επιτυγχάνουμε στόχους και να ζούμε με ασφάλεια.",
      },
      {
        q: "Αν έχεις €20, ποιο θα σου έδινε μεγαλύτερη ευτυχία μακροπρόθεσμα;",
        options: ["Ένα παιχνίδι που θα βαρεθείς σε μια εβδομάδα", "Μάθημα κιθάρας που θα παίζεις για χρόνια", "Candy για μια μέρα", "Τίποτα — να τα αποταμιεύσεις μόνο"],
        correct: 1,
        explain: "Μπράβο! Μια δεξιότητα που αναπτύσσεις (μουσική, αθλητισμός, τέχνη) φέρνει χαρά για χρόνια!",
      },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = "intro" | "theory" | "quiz" | "result";

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const lesson = lessons[lessonId];

  const [phase, setPhase] = useState<Phase>("intro");
  const [slideIdx, setSlideIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-background px-6 pt-20 text-center">
        <p className="text-xl font-bold">Το μάθημα δεν βρέθηκε.</p>
        <Link to="/learn" className="mt-4 inline-block text-primary underline">← Πίσω στα μαθήματα</Link>
      </main>
    );
  }

  const totalQuestions = lesson.questions.length;
  const currentQ = lesson.questions[questionIdx];
  const earnedXP = Math.round((score / totalQuestions) * lesson.xp);

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === currentQ.correct) {
      setScore((s) => s + 1);
    } else {
      setWrongAnswers((w) => [...w, questionIdx]);
    }
  }

  function nextQuestion() {
    if (questionIdx + 1 < totalQuestions) {
      setQuestionIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase("result");
    }
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <main className="min-h-screen bg-background">
        <section style={{ background: `oklch(${lesson.color})` }} className="px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <BrightlyNav active="learn" />
          </div>
        </section>
        <section className="mx-auto max-w-xl px-6 py-16 text-center">
          <div className="text-8xl">{lesson.emoji}</div>
          <h1 className="mt-6 text-4xl font-black">{lesson.title}</h1>
          <div className="mt-6 flex justify-center gap-6 text-sm font-bold">
            <span className="flex items-center gap-1 rounded-full bg-[oklch(0.88_0.1_55)] px-3 py-1.5 text-[oklch(0.35_0.12_35)]">
              <Star size={14} /> {lesson.xp} XP
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
              📖 {lesson.slides.length} διαφάνειες + {totalQuestions} ερωτήσεις
            </span>
          </div>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            Διάβασε τις διαφάνειες και μετά απάντησε σωστά στις ερωτήσεις για να κερδίσεις XP!
          </p>
          <Button onClick={() => setPhase("theory")} className="mt-10 h-14 w-full rounded-full text-lg font-black">
            Ξεκίνα μάθημα →
          </Button>
          <Link to="/learn" className="mt-4 block text-sm text-muted-foreground hover:underline">← Πίσω στα μαθήματα</Link>
        </section>
      </main>
    );
  }

  // ── Theory slides ──────────────────────────────────────────────────────────
  if (phase === "theory") {
    const slide = lesson.slides[slideIdx];
    return (
      <main className="min-h-screen bg-background">
        <section style={{ background: `oklch(${lesson.color})` }} className="px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <BrightlyNav active="learn" />
          </div>
        </section>
        <section className="mx-auto max-w-xl px-6 py-12">
          {/* Progress */}
          <div className="flex items-center gap-3">
            {lesson.slides.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= slideIdx ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{slideIdx + 1} / {lesson.slides.length}</p>

          {/* Slide content */}
          <div className="mt-8 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="text-center text-6xl">{slide.emoji}</div>
            <h2 className="mt-6 text-2xl font-black">{slide.heading}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{slide.body}</p>
          </div>

          {/* Nav */}
          <div className="mt-8 flex gap-4">
            {slideIdx > 0 ? (
              <Button variant="outline" onClick={() => setSlideIdx((i) => i - 1)} className="h-12 flex-1 rounded-full">
                <ArrowLeft size={18} /> Πίσω
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setPhase("intro")} className="h-12 flex-1 rounded-full">
                <ArrowLeft size={18} /> Intro
              </Button>
            )}
            {slideIdx + 1 < lesson.slides.length ? (
              <Button onClick={() => setSlideIdx((i) => i + 1)} className="h-12 flex-1 rounded-full">
                Επόμενο <ArrowRight size={18} />
              </Button>
            ) : (
              <Button onClick={() => setPhase("quiz")} className="h-12 flex-1 rounded-full font-black">
                Πάμε quiz! 🎯
              </Button>
            )}
          </div>
        </section>
      </main>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    return (
      <main className="min-h-screen bg-background">
        <section style={{ background: `oklch(${lesson.color})` }} className="px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <BrightlyNav active="learn" />
          </div>
        </section>
        <section className="mx-auto max-w-xl px-6 py-12">
          {/* Progress */}
          <div className="flex items-center gap-3">
            {lesson.questions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < questionIdx ? "bg-primary" : i === questionIdx ? "bg-primary/50" : "bg-border"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-muted-foreground">Ερώτηση {questionIdx + 1} από {totalQuestions}</p>

          {/* Question */}
          <div className="mt-6 rounded-2xl border bg-card p-7 shadow-sm">
            <p className="text-xl font-black leading-snug">{currentQ.q}</p>

            <div className="mt-6 grid gap-3">
              {currentQ.options.map((opt, i) => {
                let style = "border-border bg-background hover:border-primary hover:bg-secondary";
                if (answered) {
                  if (i === currentQ.correct) style = "border-[oklch(0.55_0.17_173)] bg-[oklch(0.93_0.06_173)] text-[oklch(0.2_0.08_173)]";
                  else if (i === selected && i !== currentQ.correct) style = "border-destructive bg-[oklch(0.95_0.04_25)] text-destructive";
                  else style = "border-border bg-background opacity-50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-bold transition-all ${style}`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-current text-xs font-black">
                      {answered && i === currentQ.correct ? <CheckCircle2 size={16} /> : answered && i === selected ? <XCircle size={16} /> : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {answered && (
              <div className={`mt-5 rounded-xl p-4 text-sm font-bold leading-relaxed ${selected === currentQ.correct ? "bg-[oklch(0.93_0.06_173)] text-[oklch(0.2_0.08_173)]" : "bg-[oklch(0.95_0.04_25)] text-destructive"}`}>
                {selected === currentQ.correct ? "✅ " : "❌ "}{currentQ.explain}
              </div>
            )}
          </div>

          {answered && (
            <Button onClick={nextQuestion} className="mt-6 h-12 w-full rounded-full font-black">
              {questionIdx + 1 < totalQuestions ? "Επόμενη ερώτηση →" : "Δες τα αποτελέσματα 🏆"}
            </Button>
          )}
        </section>
      </main>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  const perfect = score === totalQuestions;
  const nextLessonId = lesson.id + 1;
  const hasNext = nextLessonId <= 6;

  return (
    <main className="min-h-screen bg-background">
      <section style={{ background: `oklch(${lesson.color})` }} className="px-6 pb-20 pt-5 text-primary-foreground lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <BrightlyNav active="learn" />
        </div>
      </section>
      <section className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="text-7xl">{perfect ? "🏆" : score >= totalQuestions / 2 ? "⭐" : "💪"}</div>
        <h1 className="mt-5 text-4xl font-black">
          {perfect ? "Τέλειο!" : score >= totalQuestions / 2 ? "Καλή δουλειά!" : "Προσπάθησε ξανά!"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {score} / {totalQuestions} σωστές απαντήσεις
        </p>

        {/* XP */}
        <div className="mx-auto mt-8 max-w-xs rounded-2xl bg-[oklch(0.88_0.1_55)] px-6 py-5">
          <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.45_0.13_50)]">Κέρδισες</p>
          <p className="mt-1 text-5xl font-black text-[oklch(0.35_0.12_35)]">+{earnedXP} XP</p>
          <p className="mt-1 text-xs text-[oklch(0.5_0.12_45)]">από {lesson.xp} δυνατά</p>
        </div>

        {/* Score breakdown */}
        <div className="mt-8 rounded-xl border bg-card p-5 text-left">
          {lesson.questions.map((q, i) => (
            <div key={i} className={`flex items-start gap-3 py-2 ${i < lesson.questions.length - 1 ? "border-b" : ""}`}>
              {wrongAnswers.includes(i) ? <XCircle size={18} className="mt-0.5 shrink-0 text-destructive" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[oklch(0.55_0.17_173)]" />}
              <p className="text-sm">{q.q}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3">
          {!perfect && (
            <Button variant="outline" onClick={() => { setPhase("quiz"); setQuestionIdx(0); setSelected(null); setAnswered(false); setScore(0); setWrongAnswers([]); }} className="h-12 rounded-full">
              Επανάλαβε το quiz
            </Button>
          )}
          {hasNext && perfect && (
            <Button onClick={() => navigate({ to: "/learn/$lessonId", params: { lessonId: String(nextLessonId) } })} className="h-12 rounded-full font-black">
              Επόμενο μάθημα: {lessons[String(nextLessonId)]?.title} →
            </Button>
          )}
          <Link to="/learn" className="block">
            <Button variant={perfect ? "outline" : "default"} className="h-12 w-full rounded-full">
              <Award size={16} /> Όλα τα μαθήματα
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
