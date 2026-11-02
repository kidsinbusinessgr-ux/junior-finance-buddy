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
    title: "Πώς σκέφτεται ένας founder",
    emoji: "💡",
    xp: 200,
    color: "oklch(0.57_0.23_292)",
    slides: [
      {
        heading: "Βλέπεις πρόβλημα ή ευκαιρία;",
        body: "Το 2008, ο Travis Kalanick δεν μπορούσε να βρει ταξί στο Παρίσι μια χιονισμένη νύχτα. Οι περισσότεροι θύμωσαν και ξέχασαν. Αυτός σκέφτηκε: «Τι θα γινόταν αν μπορούσες να παραγγέλνεις αμάξι από το κινητό σου;» — Και έφτιαξε το Uber. Ο founder βλέπει ευκαιρία εκεί που οι άλλοι βλέπουν μόνο πρόβλημα.",
        emoji: "🚖",
      },
      {
        heading: "Σκέψου σαν τον πελάτη σου",
        body: "Πριν φτιάξεις οτιδήποτε, η πρώτη ερώτηση ενός founder είναι: «Ποιος έχει αυτό το πρόβλημα;» Αυτό λέγεται empathy — μπαίνεις στη θέση του άλλου και καταλαβαίνεις τι τον πονάει. Δεν φτιάχνεις αυτό που σου αρέσει εσένα. Φτιάχνεις αυτό που χρειάζεται ο πελάτης σου.",
        emoji: "🧠",
      },
      {
        heading: "Η αποτυχία = Δωρεάν μάθημα",
        body: "Ο James Dyson έφτιαξε 5.127 πρωτότυπα ηλεκτρικής σκούπας πριν βρει αυτό που δούλευε. Είπε: «Κάθε αποτυχία με έφερνε πιο κοντά στην απάντηση.» Οι founders δεν αποφεύγουν την αποτυχία — τη χρησιμοποιούν. Κάθε λάθος τους λέει κάτι που δεν ήξεραν.",
        emoji: "💪",
      },
    ],
    questions: [
      {
        q: "Πώς έφτιαξε ο Travis Kalanick το Uber;",
        options: [
          "Είχε ήδη μια μεγάλη εταιρεία ταξί",
          "Έφτιαξε το Uber για να λύσει το πρόβλημα που ο ίδιος βίωσε",
          "Αντέγραψε μια άλλη εφαρμογή",
          "Κέρδισε κάποιο διαγωνισμό",
        ],
        correct: 1,
        explain: "Ακριβώς! Η καλύτερη ιδέα επιχείρησης ξεκινά συχνά από ένα πρόβλημα που βίωσες ο ίδιος — γιατί το καταλαβαίνεις καλύτερα από οποιονδήποτε άλλο.",
      },
      {
        q: "Ποια είναι η ΠΡΩΤΗ ερώτηση που κάνει ένας founder πριν φτιάξει κάτι;",
        options: [
          "Πόσα χρήματα θα κερδίσω;",
          "Ποιος έχει αυτό το πρόβλημα;",
          "Τι app να φτιάξω;",
          "Πότε μπορώ να ανοίξω κατάστημα;",
        ],
        correct: 1,
        explain: "Σωστά! Πρώτα καταλαβαίνεις τον πελάτη και το πρόβλημά του. Μετά σκέφτεσαι λύση — όχι αντίστροφα.",
      },
      {
        q: "Τι μάθαμε από τον James Dyson και τις 5.127 αποτυχίες του;",
        options: [
          "Δεν πρέπει να επιμένουμε αν αποτύχουμε",
          "Η αποτυχία είναι μέρος της επιτυχίας — κάθε λάθος σε διδάσκει",
          "Οι καλές ιδέες βγαίνουν τέλειες από την αρχή",
          "Χρειάζεσαι πολλά χρήματα για να πετύχεις",
        ],
        correct: 1,
        explain: "Μπράβο! Κάθε πρωτότυπο που «απέτυχε» ήταν στην πραγματικότητα πληροφορία. Έτσι βρήκε την τέλεια λύση.",
      },
    ],
  },
  "2": {
    id: 2,
    title: "Το Business Model σε 1 σελίδα",
    emoji: "🧩",
    xp: 250,
    color: "oklch(0.55_0.17_173)",
    slides: [
      {
        heading: "Μια επιχείρηση σε 9 κουτιά",
        body: "Το Business Model Canvas (BMC) είναι ένα εργαλείο που σου επιτρέπει να δεις ολόκληρη την επιχείρησή σου σε μία σελίδα. Δημιουργήθηκε από τον Alexander Osterwalder και χρησιμοποιείται από startups όπως Airbnb, Spotify και Apple. Τα 9 κουτιά: Πελάτες, Αξία που προσφέρεις, Κανάλια, Σχέσεις με πελάτες, Έσοδα, Πόροι, Δραστηριότητες, Εταίροι, Κόστος.",
        emoji: "🗂️",
      },
      {
        heading: "Value Proposition, Customers, Revenue",
        body: "Τα 3 πιο κρίσιμα κουτιά: Value Proposition — γιατί ο πελάτης σε επιλέγει εσένα και όχι κάποιον άλλο; Customer Segments — ποιος ακριβώς είναι ο πελάτης σου; Revenue Streams — πώς κερδίζεις χρήματα; Παράδειγμα Spotify: VP = πρόσβαση σε εκατομμύρια τραγούδια χωρίς να αγοράζεις κάθε ένα χωριστά. Revenue = €10/μήνα subscription.",
        emoji: "🎵",
      },
      {
        heading: "Case: Tutoring app στο σχολείο",
        body: "Φαντάσου ότι φτιάχνεις μια υπηρεσία ιδιαίτερων στο σχολείο σου. BMC σε 30 δευτερόλεπτα: VP = βοηθάς συμμαθητές που δυσκολεύονται στα μαθηματικά. Πελάτες = μαθητές Γ΄ Γυμνασίου πριν τις εξετάσεις. Revenue = €5/ώρα × 3 μαθητές × 4 εβδομάδες = €60/μήνα. Τώρα έχεις επιχείρηση — όχι απλώς ιδέα.",
        emoji: "📚",
      },
    ],
    questions: [
      {
        q: "Τι δείχνει το Business Model Canvas (BMC);",
        options: [
          "Μόνο τα έσοδα της επιχείρησης",
          "Πώς μια επιχείρηση δημιουργεί και κερδίζει αξία σε 1 σελίδα",
          "Ένα σχέδιο για διαφήμιση",
          "Τον αριθμό υπαλλήλων που χρειάζεσαι",
        ],
        correct: 1,
        explain: "Ακριβώς! Το BMC σε βοηθά να δεις ολόκληρη την επιχείρησή σου με μία ματιά — από πελάτες και αξία μέχρι κόστος και έσοδα.",
      },
      {
        q: "Ποια είναι η Value Proposition του Spotify;",
        options: [
          "Να πουλάει CDs μουσικής",
          "Να δίνει πρόσβαση σε εκατομμύρια τραγούδια οπουδήποτε με €10/μήνα",
          "Να οργανώνει συναυλίες",
          "Να διδάσκει μουσική",
        ],
        correct: 1,
        explain: "Σωστά! Το Spotify δεν πουλάει τραγούδια — πουλάει πρόσβαση. Αυτή είναι η αξία που δεν μπορείς να βρεις αλλού τόσο εύκολα.",
      },
      {
        q: "Στο παράδειγμα tutoring: €5/ώρα × 3 μαθητές × 4 εβδομάδες = ;",
        options: ["€45/μήνα", "€50/μήνα", "€60/μήνα", "€20/μήνα"],
        correct: 2,
        explain: "Μπράβο! €5 × 3 × 4 = €60. Μικρές επιχειρήσεις ξεκινούν με απλά μαθηματικά — και αυτό είναι αρκετό για να ξεκινήσεις.",
      },
    ],
  },
  "3": {
    id: 3,
    title: "Validation με 0 ευρώ",
    emoji: "🔥",
    xp: 300,
    color: "oklch(0.57_0.2_28)",
    slides: [
      {
        heading: "Μην υποθέτεις — απόδειξε",
        body: "Το 2007, ο Drew Houston ήθελε να φτιάξει το Dropbox. Αντί να ξοδέψει χρόνια κτίζοντάς το, έφτιαξε ένα απλό βίντεο 3 λεπτών που έδειχνε πώς θα λειτουργούσε. Αποτέλεσμα; 75.000 εγγραφές σε μία νύχτα. Απέδειξε ότι υπήρχε ζήτηση πριν γράψει ούτε μία γραμμή κώδικα. Αυτό είναι validation.",
        emoji: "📹",
      },
      {
        heading: "3 τρόποι validation με 0€",
        body: "Pre-sell: «Πληρώστε €X τώρα και παίρνετε το προϊόν πρώτοι» — αν αγοράζουν, έχεις ζήτηση. Survey: 20 ερωτήσεις σε Google Forms, στείλτο σε 50 άτομα. Landing page: φτιάξε σελίδα σε Canva/Carrd που περιγράφει το προϊόν και ζήτα email — αν εγγράφονται, ενδιαφέρονται. Κανένα από αυτά δεν κοστίζει χρήματα — μόνο χρόνο.",
        emoji: "💸",
      },
      {
        heading: "Ο κανόνας των 100 συνομιλιών",
        body: "Πριν φτιάξεις οτιδήποτε, μίλα με 100 πιθανούς πελάτες. Όχι «τι σου αρέσει;» — αλλά «πότε ήταν η τελευταία φορά που αντιμετώπισες αυτό το πρόβλημα; Πώς το έλυσες;» Αν 30+ από τους 100 έχουν το ίδιο πρόβλημα και το λύνουν με ατελείς τρόπους — έχεις ευκαιρία.",
        emoji: "🗣️",
      },
    ],
    questions: [
      {
        q: "Πώς «επικύρωσε» ο Drew Houston το Dropbox πριν το φτιάξει;",
        options: [
          "Ρώτησε τους φίλους του αν τους αρέσει η ιδέα",
          "Έφτιαξε ένα βίντεο 3 λεπτών που έφερε 75.000 εγγραφές",
          "Ξόδεψε €1 εκ. σε διαφήμιση",
          "Πούλησε μετοχές της εταιρείας",
        ],
        correct: 1,
        explain: "Σωστά! Ένα απλό βίντεο αποδείκνυε ζήτηση χωρίς να έχει γραφεί ούτε μία γραμμή κώδικα. Αυτό είναι validation.",
      },
      {
        q: "Ποιο από αυτά ΔΕΝ είναι validation με 0€;",
        options: [
          "Landing page με φόρμα email",
          "Google Forms survey σε 50 άτομα",
          "Κατασκευή ολόκληρης εφαρμογής",
          "Pre-sell με €5 deposit",
        ],
        correct: 2,
        explain: "Ακριβώς! Η κατασκευή ολόκληρης εφαρμογής κοστίζει χρόνο και χρήμα — και γίνεται ΜΕΤΑ την επικύρωση, όχι πριν.",
      },
      {
        q: "Μίλησες με 20 άτομα και μόνο 3 έχουν το πρόβλημα που θέλεις να λύσεις. Τι κάνεις;",
        options: [
          "Επανεξετάζεις — το 15% δεν είναι αρκετή ζήτηση για να συνεχίσεις",
          "Ξεκινάς αμέσως να κτίζεις",
          "Ρωτάς μόνο τους 3 που είπαν ναι",
          "Αλλάζεις εντελώς κλάδο",
        ],
        correct: 0,
        explain: "Σωστά! Αν μόνο 15% έχει το πρόβλημα, η αγορά είναι μικρή. Επανεξέτασε την ιδέα ή βρες διαφορετικό κοινό πριν επενδύσεις περαιτέρω.",
      },
    ],
  },
  "4": {
    id: 4,
    title: "Ποιος είναι ο πελάτης σου;",
    emoji: "🎯",
    xp: 300,
    color: "oklch(0.57_0.23_292)",
    slides: [
      {
        heading: "«Ο πελάτης μου είναι όλοι» = καταστροφή",
        body: "Αν πουλάς σε όλους, δεν πουλάς σε κανέναν. Η Nike δεν πουλάει παπούτσια σε «ανθρώπους». Πουλάει σε αθλητές που θέλουν απόδοση. Η Apple δεν πουλάει κινητά σε «ανθρώπους». Πουλάει σε ανθρώπους που εκτιμούν design και status. Όσο πιο συγκεκριμένος είναι ο πελάτης σου, τόσο πιο αποτελεσματικά μπορείς να τον πείσεις.",
        emoji: "🎯",
      },
      {
        heading: "Customer Persona σε 5 λεπτά",
        body: "Ένα Customer Persona είναι μια λεπτομερής περιγραφή του ιδανικού πελάτη σου. Παράδειγμα: Μαρία, 15 ετών, Γ΄ Γυμνασίου, Αθήνα. Στόχος: να περάσει τις Πανελλήνιες. Φόβος: να μείνει πίσω στα μαθηματικά. Χρησιμοποιεί: TikTok, YouTube για μαθήματα. Πληρώνει: οι γονείς της για ιδιαίτερα. Αν ξέρεις αυτά, ξέρεις ακριβώς τι να πεις και πού.",
        emoji: "👩‍🎓",
      },
      {
        heading: "Jobs-To-Be-Done",
        body: "Ο Theodore Levitt είπε: «Οι άνθρωποι δεν αγοράζουν τρυπάνι — αγοράζουν μια τρύπα στον τοίχο.» Η McDonald's ανακάλυψε ότι οι άνθρωποι αγόραζαν milkshake το πρωί όχι γιατί ήταν νόστιμο, αλλά γιατί τους κρατούσε σύντροφο στο μεγάλο οδικό ταξίδι. Jobs-To-Be-Done: ποια «δουλειά» προσλαμβάνει ο πελάτης το προϊόν σου για να κάνει;",
        emoji: "🔧",
      },
    ],
    questions: [
      {
        q: "Γιατί είναι λάθος να λες «ο πελάτης μου είναι όλοι»;",
        options: [
          "Γιατί τότε πρέπει να κάνεις πολλά διαφορετικά προϊόντα",
          "Γιατί δεν μπορείς να επικοινωνήσεις αποτελεσματικά όταν μιλάς σε όλους ταυτόχρονα",
          "Γιατί δεν επιτρέπεται από το νόμο",
          "Γιατί οι μεγάλες εταιρείες δεν το κάνουν",
        ],
        correct: 1,
        explain: "Ακριβώς! Ένα μήνυμα που απευθύνεται σε όλους δεν συγκινεί κανέναν. Όσο πιο εστιασμένος είσαι, τόσο πιο δυνατό το μήνυμά σου.",
      },
      {
        q: "Τι είναι ένα Customer Persona;",
        options: [
          "Ένα logo για την επιχείρησή σου",
          "Μια λεπτομερής περιγραφή του ιδανικού πελάτη σου με στόχους, φόβους και συνήθειες",
          "Μια λίστα τιμών",
          "Ένας νόμιμος τίτλος εταιρείας",
        ],
        correct: 1,
        explain: "Σωστά! Το Persona σε βοηθά να «μπεις στο μυαλό» του πελάτη και να φτιάξεις ακριβώς αυτό που χρειάζεται.",
      },
      {
        q: "Κάποιος αγοράζει μάθημα κιθάρας. Ποιο είναι το Jobs-To-Be-Done;",
        options: [
          "Να αγοράσει μια κιθάρα",
          "Να μάθει νότες",
          "Την αίσθηση δημιουργικότητας και αυτοέκφρασης — να εντυπωσιάζει φίλους ή να εκφράζει συναισθήματα",
          "Να πάρει πτυχίο μουσικής",
        ],
        correct: 2,
        explain: "Ακριβώς! Κανείς δεν αγοράζει μάθημα κιθάρας για τις νότες. Αγοράζει το αίσθημα της δημιουργίας και της έκφρασης. Αυτό πρέπει να πουλάς.",
      },
    ],
  },
  "5": {
    id: 5,
    title: "MVP: Πούλα πρώτα, φτιάξε μετά",
    emoji: "📦",
    xp: 350,
    color: "oklch(0.55_0.17_173)",
    slides: [
      {
        heading: "Minimum Viable Product",
        body: "Το Twitter ξεκίνησε ως εσωτερικό εργαλείο της εταιρείας Odeo — απλές δημόσιες ανακοινώσεις 140 χαρακτήρων. Το Airbnb ξεκίνησε όταν οι ιδρυτές νοίκιασαν τον δικό τους χώρο με 3 αερόστρωματα και μια φωτογραφία. MVP = η απλούστερη έκδοση του προϊόντος σου που λύνει το πρόβλημα και σου δίνει πραγματικά δεδομένα από πραγματικούς πελάτες.",
        emoji: "🚀",
      },
      {
        heading: "Pre-orders και Dropshipping",
        body: "Η Tesla ζήτησε €1.000 deposit για το Model 3 πριν φτιαχτεί το πρώτο αυτοκίνητο. Αποτέλεσμα; 400.000 pre-orders = €400.000.000 σε μία εβδομάδα. Η ιδέα: αν οι άνθρωποι πληρώνουν για κάτι που δεν υπάρχει ακόμα, έχεις αποδείξει ζήτηση. Dropshipping: πουλάς προϊόν που δεν έχεις — παραγγέλνεις μετά την πληρωμή του πελάτη.",
        emoji: "💰",
      },
      {
        heading: "Το MVP σου αύριο",
        body: "Δεν χρειάζεσαι εταιρεία, site ή κεφάλαιο. Digital products: template στο Canva, ebook, preset για φωτογραφίες — πουλάς στο Etsy ή Gumroad από €3. Υπηρεσίες: ιδιαίτερα, social media για τοπικές επιχειρήσεις, video editing. Handmade: κοσμήματα, stickers, τσάντες — Etsy + Instagram. Σε 24 ώρες μπορείς να έχεις τον πρώτο σου «πελάτη».",
        emoji: "⚡",
      },
    ],
    questions: [
      {
        q: "Τι σημαίνει MVP;",
        options: [
          "Most Valuable Player — ο καλύτερος παίκτης",
          "Minimum Viable Product — η απλούστερη έκδοση που λύνει το πρόβλημα",
          "Maximum Value Profit — το μέγιστο κέρδος",
          "Market Value Price — η τιμή αγοράς",
        ],
        correct: 1,
        explain: "Ακριβώς! MVP είναι η ελάχιστη έκδοση που χρειάζεται ο πελάτης για να λύσει το πρόβλημά του — και σου δίνει αληθινά δεδομένα.",
      },
      {
        q: "Με τι ξεκίνησε το Airbnb;",
        options: [
          "Με 100 σπίτια σε 10 χώρες",
          "Με μια μεγάλη επένδυση από τράπεζα",
          "Με 3 αερόστρωματα στο σαλόνι των ιδρυτών και μια φωτογραφία",
          "Με μια εφαρμογή που ανέπτυξαν για χρόνια",
        ],
        correct: 2,
        explain: "Σωστά! Το Airbnb δεν ξεκίνησε με εκατομμύρια — ξεκίνησε με 3 αερόστρωματα. Το MVP δοκιμάζει αν η ιδέα λειτουργεί πριν επενδύσεις.",
      },
      {
        q: "Ποιο από αυτά είναι ένα καλό MVP για ένα παιδί 14 ετών;",
        options: [
          "Να χτίσει μια πλήρη εφαρμογή επί 6 μήνες",
          "Να ανοίξει φυσικό κατάστημα",
          "Ένα Canva template που πουλάει στο Etsy για €3",
          "Να κάνει αίτηση σε τράπεζα για δάνειο",
        ],
        correct: 2,
        explain: "Μπράβο! Ένα digital product στο Etsy κοστίζει €0 να φτιαχτεί και €0,20 να ανεβάσεις. Αν πουλήσεις 10 — έχεις αποδείξει ζήτηση!",
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
  const hasNext = nextLessonId <= 5;

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
