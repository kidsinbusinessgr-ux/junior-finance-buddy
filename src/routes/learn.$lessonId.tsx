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
        heading: "Πριν τα χρήματα: το χάος του αντιπραγματισμού",
        body: "Φαντάσου: θέλεις να φας ψωμί αλλά έχεις μόνο κοτόπουλο. Έπρεπε να βρεις κάποιον που να θέλει κοτόπουλο ΚΑΙ να έχει ψωμί. Τι γινόταν αν ήσουν γιατρός και ήθελες φαγητό; Να βρεις άρρωστο αγρότη! Αυτό είναι ο αντιπραγματισμός — και ήταν εφιάλτης.",
        emoji: "🐔🍞❌",
      },
      {
        heading: "Τα 3 πράγματα που κάνουν τα χρήματα",
        body: "Τα χρήματα λύνουν το πρόβλημα με 3 λειτουργίες: 1) Μέσο ανταλλαγής — πληρώνεις με αυτά οτιδήποτε. 2) Μέτρο αξίας — ξέρεις ότι ένα γεύμα κοστίζει €8. 3) Αποθήκη αξίας — μπορείς να τα κρατήσεις για αύριο. Χωρίς αυτές τις 3 λειτουργίες, κάτι ΔΕΝ είναι χρήμα.",
        emoji: "🔄📏🏦",
      },
      {
        heading: "Ψηφιακά, κρυπτο, και το μέλλον",
        body: "Σήμερα τα χρήματα μπορεί να μην τα αγγίζεις ποτέ — κάρτα, Apple Pay, Revolut. Το Bitcoin είναι επίσης «χρήμα» για εκατομμύρια ανθρώπους. Το ερώτημα δεν είναι «τι μοιάζει με χρήμα» αλλά «τι αποδέχεται ο κόσμος ως αξία».",
        emoji: "📱💳₿",
      },
    ],
    questions: [
      {
        q: "Ποιο ήταν το βασικό πρόβλημα του αντιπραγματισμού;",
        options: [
          "Δεν υπήρχαν αρκετά προϊόντα",
          "Χρειαζόσουν να βρεις κάποιον που να θέλει ΚΑΙ ό,τι έχεις ΚΑΙ να έχει ό,τι θέλεις",
          "Τα νομίσματα ήταν βαριά",
          "Οι άνθρωποι δεν εμπιστεύονταν ο ένας τον άλλον",
        ],
        correct: 1,
        explain: "Η «διπλή σύμπτωση επιθυμιών» ήταν το κύριο πρόβλημα — έπρεπε ΚΑΙ οι δύο να θέλουν αυτό που έχει ο άλλος, ταυτόχρονα.",
      },
      {
        q: "Ποια λειτουργία των χρημάτων σε βοηθά να ξέρεις ότι ένα γεύμα κοστίζει €8;",
        options: [
          "Μέσο ανταλλαγής",
          "Αποθήκη αξίας",
          "Μέτρο αξίας",
          "Ψηφιακή λειτουργία",
        ],
        correct: 2,
        explain: "Το «μέτρο αξίας» σημαίνει ότι τα χρήματα μας δίνουν μια κοινή γλώσσα τιμών — ξέρουμε τι κοστίζει κάτι σε σύγκριση με άλλα.",
      },
      {
        q: "Είναι το Bitcoin «χρήμα»;",
        options: [
          "Ναι, γιατί εκατομμύρια άνθρωποι το αποδέχονται ως αξία",
          "Όχι, γιατί δεν το εκδίδει κράτος",
          "Μόνο αν το εγκρίνει η ΕΚΤ",
          "Ναι, αλλά μόνο για αγορές online",
        ],
        correct: 0,
        explain: "Η ουσία του χρήματος είναι η κοινή αποδοχή αξίας. Το Bitcoin το αποδέχονται εκατομμύρια — άρα λειτουργεί ως χρήμα για αυτούς, ακόμα κι αν δεν το εκδίδει κράτος.",
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
        heading: "Η παγίδα του FOMO spending",
        body: "«Όλοι έχουν τα νέα Nike, πρέπει κι εγώ να τα έχω.» FOMO = Fear Of Missing Out. Είναι η νούμερο 1 αιτία που οι έφηβοι ξοδεύουν χωρίς λόγο. Το marketing το ξέρει αυτό και το εκμεταλλεύεται — limited edition, «μόνο 3 απομένουν», countdown timers.",
        emoji: "👟📱😰",
      },
      {
        heading: "Ανάγκη ή επιθυμία; Το τεστ",
        body: "Πριν αγοράσεις κάτι, κάνε 3 ερωτήσεις: 1) Τι συμβαίνει αν ΔΕΝ το αγοράσω; 2) Το χρειάζομαι ή απλώς το θέλω; 3) Μπορώ να επιβιώσω χωρίς αυτό; Αν η απάντηση είναι «τίποτα δεν αλλάζει», είναι επιθυμία — όχι ανάγκη.",
        emoji: "🤔✅❓",
      },
      {
        heading: "Η μέθοδος 24 ωρών",
        body: "Για κάθε αγορά πάνω από €10, περίμενε 24 ώρες. Αν την επόμενη μέρα ακόμα το θέλεις, τότε σκέψου αν έχεις τα χρήματα. Έρευνες δείχνουν ότι το 60% των impulse purchases δεν γίνονται αν περιμένεις λίγο.",
        emoji: "⏰🛑💭",
      },
    ],
    questions: [
      {
        q: "Αγοράζεις hoodie €50 επειδή το φόρεσε ο αγαπημένος σου influencer. Αυτό είναι...",
        options: [
          "Ανάγκη, γιατί κρυώνεις",
          "Επιθυμία λόγω FOMO",
          "Ανάγκη, γιατί δεν έχεις ρούχα",
          "Επένδυση στην εμφάνισή σου",
        ],
        correct: 1,
        explain: "Αγοράζεις λόγω FOMO — φοβάσαι να μείνεις εκτός τάσης. Δεν είναι ανάγκη επιβίωσης, είναι κοινωνική πίεση.",
      },
      {
        q: "Τι σημαίνει η μέθοδος «24 ωρών»;",
        options: [
          "Ψωνίζεις μόνο 24 ώρες πριν τα γενέθλιά σου",
          "Κοιμάσαι πάνω στην απόφαση αγοράς",
          "Συγκρίνεις τιμές για 24 ώρες",
          "Περιμένεις 24 ώρες πριν αγορές πάνω από €10",
        ],
        correct: 3,
        explain: "Η μέθοδος 24 ωρών σε βάζει να περιμένεις πριν αγορές πάνω από €10 — αυτό εξαλείφει τις αγορές παρορμητισμού.",
      },
      {
        q: "Ποιο από αυτά είναι ΣΙΓΟΥΡΑ ανάγκη;",
        options: [
          "Νέο smartphone γιατί το παλιό «είναι αργό»",
          "Σχολικά βιβλία για το νέο εξάμηνο",
          "Gaming headset για καλύτερο ήχο",
          "Branded μπλούζα για να φορέσεις στη βόλτα",
        ],
        correct: 1,
        explain: "Τα σχολικά βιβλία είναι ανάγκη — χωρίς αυτά δεν μπορείς να παρακολουθήσεις τα μαθήματα. Τα υπόλοιπα είναι επιθυμίες.",
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
        heading: "Ο κανόνας των 72 — η μαγεία του χρόνου",
        body: "Πώς ξέρεις πόσο γρήγορα διπλασιάζονται τα χρήματά σου; 72 ÷ επιτόκιο = χρόνια. Αν κερδίζεις 6% ετησίως, 72÷6=12 χρόνια για διπλασιασμό. Ο Warren Buffett ξεκίνησε να επενδύει στα 11. Αν είσαι 15, έχεις πλεονέκτημα έναντι κάποιου που ξεκινά στα 25.",
        emoji: "🧮💸📈",
      },
      {
        heading: "Η μέθοδος «Pay Yourself First»",
        body: "Οι περισσότεροι σκέφτονται: «Θα αποταμιεύσω ό,τι περισσέψει.» Λάθος! Πάντα περισσεύουν €0. Η σωστή σειρά: μόλις πάρεις χρήματα (τσέπη, δώρο), βάλε αμέσως 20% σε αποταμίευση — ΠΡΙΝ ξοδέψεις. Μετά ξόδεψε ό,τι έχει μείνει.",
        emoji: "👆🐷✅",
      },
      {
        heading: "Βάλε στόχο: το SMART σύστημα",
        body: "Αποταμιεύεις για κάτι συγκεκριμένο! SMART = Specific (τι;), Measurable (πόσο;), Achievable (εφικτό;), Relevant (σημαντικό για σένα;), Time-bound (πότε;). Παράδειγμα: «Θέλω να αγοράσω ποδήλατο €80 σε 4 μήνες, βάζοντας €5/εβδομάδα.»",
        emoji: "🎯🚲📅",
      },
    ],
    questions: [
      {
        q: "Με τον κανόνα των 72, αν κερδίζεις 8% ετησίως, σε πόσα χρόνια διπλασιάζονται τα χρήματά σου;",
        options: [
          "6 χρόνια",
          "8 χρόνια",
          "9 χρόνια",
          "12 χρόνια",
        ],
        correct: 2,
        explain: "72 ÷ 8 = 9 χρόνια. Ο κανόνας των 72 είναι γρήγορος τρόπος να υπολογίσεις πόσο χρειάζεται για διπλασιασμό.",
      },
      {
        q: "Τι σημαίνει «Pay Yourself First»;",
        options: [
          "Αγοράζεις πρώτα αυτό που θέλεις",
          "Αποταμιεύεις ΠΡΙΝ ξοδέψεις, μόλις πάρεις χρήματα",
          "Πληρώνεις τα έξοδά σου πριν τους άλλους",
          "Κρατάς τα χρήματα κάτω από το στρώμα",
        ],
        correct: 1,
        explain: "Pay Yourself First = αποταμίευση πριν από οποιοδήποτε έξοδο. Έτσι δεν ξοδεύεις τα πάντα και πάντα μένει κάτι.",
      },
      {
        q: "Ποιος είναι SMART στόχος αποταμίευσης;",
        options: [
          "«Θέλω να έχω πολλά χρήματα κάποια μέρα»",
          "«€5 εβδομαδιαία για ποδήλατο €80 σε 16 εβδομάδες»",
          "«Θα αποταμιεύω ό,τι περισσέψει»",
          "«Θέλω να αγοράσω κάτι ακριβό»",
        ],
        correct: 1,
        explain: "Ο SMART στόχος έχει συγκεκριμένο ποσό (€80), μέτρο (€5/εβδομάδα), εφικτό χρονοδιάγραμμα (16 εβδομάδες) και σαφή σκοπό (ποδήλατο).",
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
        heading: "Budget = Χάρτης για τα χρήματά σου",
        body: "Χωρίς budget, τα χρήματα «εξαφανίζονται» χωρίς να ξέρεις πού πήγαν. Με budget, αποφασίζεις ΕΣΥΕΚ ΠΡΙΝ τα ξοδέψεις. Δεν είναι περιορισμός — είναι ελευθερία. Ξέρεις ακριβώς τι μπορείς να αγοράσεις χωρίς τύψεις.",
        emoji: "🗺️💰📋",
      },
      {
        heading: "Το budget ενός τυπικού Έλληνα έφηβου",
        body: "Παράδειγμα: Εβδομαδιαία τσέπη €25. Έξοδα: κυλικείο €8, transport €5, frappé με φίλους €6. Σύνολο: €19. Μένουν €6. Τι κάνεις με τα €6; Αν δεν υπάρχει plan, θα τα ξοδέψεις σε κάτι τυχαίο. Αν έχεις plan, πας κατευθείαν στην αποταμίευση.",
        emoji: "🧾☕🎮",
      },
      {
        heading: "Η μέθοδος «Φακελάκια»",
        body: "Μοίρασε τα χρήματά σου σε 4 κατηγορίες από την αρχή: 🍕 30% Βασικές ανάγκες (φαγητό, transport) · 🎮 30% Διασκέδαση · 👟 20% Επιθυμίες (ρούχα, gaming) · 🐷 20% Αποταμίευση. Μόλις ένα φακελάκι αδειάσει — σταμάτα να ξοδεύεις σε αυτή την κατηγορία.",
        emoji: "✉️✉️✉️✉️",
      },
    ],
    questions: [
      {
        q: "Έχεις €25 εβδομαδιαία. Ξόδεψες €10 φαγητό, €8 transport, €6 καφέδες. Ποιο είναι το αποτέλεσμα;",
        options: [
          "Πλεόνασμα €1",
          "Έλλειμμα €1",
          "Μηδέν — ισοσκελισμένο",
          "Πλεόνασμα €5",
        ],
        correct: 0,
        explain: "€25 − €10 − €8 − €6 = €1 πλεόνασμα. Μικρό, αλλά αν αποταμιεύεις €1 κάθε εβδομάδα, σε ένα χρόνο είναι €52!",
      },
      {
        q: "Στη μέθοδο Φακελάκια, αν η εβδομαδιαία τσέπη σου είναι €20, πόσα πας στην αποταμίευση;",
        options: [
          "€2",
          "€4",
          "€6",
          "€8",
        ],
        correct: 1,
        explain: "20% × €20 = €4. Μικρό ποσό εβδομαδιαία, αλλά σε ένα χρόνο = €208!",
      },
      {
        q: "Σε ποια κατηγορία Φακελάκια ανήκει η συνδρομή Spotify Premium;",
        options: [
          "Βασικές ανάγκες",
          "Αποταμίευση",
          "Διασκέδαση/Επιθυμίες",
          "Transport",
        ],
        correct: 2,
        explain: "Η μουσική streaming είναι διασκέδαση — δεν είναι ανάγκη επιβίωσης. Ανήκει στο «Διασκέδαση/Επιθυμίες» φακελάκι.",
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
        heading: "Επιχείρηση = Λύση σε πρόβλημα",
        body: "Κάθε επιτυχημένη επιχείρηση ξεκίνησε από ένα πρόβλημα. Skroutz: «Δεν ξέρω πού να βρω τη φθηνότερη τιμή online.» Wolt: «Δεν έχω χρόνο να πάω να φάω ή να μαγειρέψω.» Beat: «Τα ταξί είναι ακριβά και αναξιόπιστα.» Πρόβλημα → Λύση → Επιχείρηση.",
        emoji: "💡🔍✅",
      },
      {
        heading: "Τα 3 πράγματα κάθε επιχείρησης",
        body: "1) Προϊόν/Υπηρεσία: τι προσφέρεις. 2) Πελάτες: ποιος πληρώνει. 3) Κέρδος: η διαφορά εσόδων μείον κόστους. Παράδειγμα: Φτιάχνεις κοσμήματα (κόστος €3 υλικά), τα πουλάς €10. Κέρδος = €7 ανά κόσμημα. Χωρίς κέρδος, δεν είναι επιχείρηση — είναι χόμπι.",
        emoji: "🛍️👥💰",
      },
      {
        heading: "Startup vs Παραδοσιακή επιχείρηση",
        body: "Παραδοσιακή: κουρείο, εστιατόριο — κερδίζεις ανάλογα με πόσους πελάτες εξυπηρετείς. Startup: app, πλατφόρμα — μπορεί να εξυπηρετεί 10 ή 10 εκατομμύρια χρήστες με το ίδιο κόστος. Αυτό λέγεται κλιμάκωση. Το Instagram είχε 13 υπαλλήλους όταν το αγόρασε το Facebook για $1 δισ.",
        emoji: "🏪⚡🚀",
      },
    ],
    questions: [
      {
        q: "Τι πρόβλημα έλυσε το Skroutz;",
        options: [
          "Η έλλειψη ελληνικών e-shops",
          "Η δυσκολία σύγκρισης τιμών online σε ένα μέρος",
          "Η αδυναμία αγοράς με κάρτα",
          "Η αργή παράδοση προϊόντων",
        ],
        correct: 1,
        explain: "Skroutz έλυσε το πρόβλημα «πού βρίσκω τη φθηνότερη τιμή;» — συγκεντρώνει τιμές από εκατοντάδες e-shops σε ένα μέρος.",
      },
      {
        q: "Φτιάχνεις κοσμήματα με κόστος €3 και τα πουλάς €10. Ποιο είναι το κέρδος ανά κόσμημα;",
        options: [
          "€3",
          "€7",
          "€10",
          "€13",
        ],
        correct: 1,
        explain: "Κέρδος = Τιμή πώλησης − Κόστος = €10 − €3 = €7. Αυτό λέγεται μικτό κέρδος (gross profit).",
      },
      {
        q: "Ποια είναι η βασική διαφορά μιας startup από μια παραδοσιακή επιχείρηση;",
        options: [
          "Η startup έχει πάντα περισσότερους υπαλλήλους",
          "Η startup μπορεί να κλιμακωθεί γρήγορα χωρίς ανάλογη αύξηση κόστους",
          "Η παραδοσιακή επιχείρηση κερδίζει περισσότερα χρήματα",
          "Η startup δεν χρειάζεται να κερδίζει χρήματα",
        ],
        correct: 1,
        explain: "Η κλιμάκωση (scalability) είναι το μυστικό των startup — μπορούν να εξυπηρετούν εκατομμύρια χρήστες με ελάχιστη αύξηση κόστους.",
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
        heading: "Τι λέει η επιστήμη για χρήματα και ευτυχία",
        body: "Έρευνα του Princeton University: η ευτυχία αυξάνεται με το εισόδημα μέχρι ένα σημείο (~€60-80K/χρόνο). Πέρα από αυτό, περισσότερα χρήματα δεν φέρνουν αναλογικά περισσότερη ευτυχία. Άρα το «θα είμαι ευτυχισμένος όταν γίνω πλούσιος» δεν ισχύει απόλυτα.",
        emoji: "🔬📊😊",
      },
      {
        heading: "Εμπειρίες > Πράγματα",
        body: "Έρευνα Harvard: τα χρήματα που ξοδεύεις σε εμπειρίες (ταξίδια, συναυλίες, μαθήματα) φέρνουν περισσότερη και πιο διαρκή ευτυχία από αυτά που ξοδεύεις σε αντικείμενα. Το νέο iPhone χαροποιεί για λίγες μέρες. Ένα ταξίδι με φίλους — για πάντα.",
        emoji: "✈️🎸😄",
      },
      {
        heading: "Δαπανώ για άλλους = περισσότερη ευτυχία",
        body: "Πείραμα: Ομάδα Α ξοδεύει €20 για τον εαυτό της. Ομάδα Β ξοδεύει €20 σε άλλους (δώρα, φιλοξενία). Αποτέλεσμα: Ομάδα Β πολύ πιο ευτυχισμένη! Το να δίνεις ενεργοποιεί το κέντρο ανταμοιβής του εγκεφάλου — περισσότερο από το να παίρνεις.",
        emoji: "🎁❤️🤝",
      },
    ],
    questions: [
      {
        q: "Σύμφωνα με την έρευνα Princeton, τι συμβαίνει στην ευτυχία όταν το εισόδημα ξεπεράσει τα ~€70K/χρόνο;",
        options: [
          "Συνεχίζει να αυξάνεται γρήγορα",
          "Μειώνεται — τα πολλά χρήματα φέρνουν άγχος",
          "Σταματά να αυξάνεται αναλογικά",
          "Παραμένει ίδια από την αρχή",
        ],
        correct: 2,
        explain: "Η σχέση χρημάτων-ευτυχίας δεν είναι γραμμική. Μέχρι ένα σημείο βοηθά, μετά η επιπλέον ευτυχία από κάθε επιπλέον ευρώ μειώνεται.",
      },
      {
        q: "Σύμφωνα με τις έρευνες, τι φέρνει περισσότερη ευτυχία;",
        options: [
          "Αγορά νέου smartphone",
          "Ταξίδι με φίλους",
          "Branded ρούχα",
          "Μεγάλη επίπλωση σπιτιού",
        ],
        correct: 1,
        explain: "Εμπειρίες > Αντικείμενα. Το ταξίδι δημιουργεί αναμνήσεις και σχέσεις — αυτά διαρκούν. Τα αντικείμενα χάνουν γρήγορα την «λάμψη» τους.",
      },
      {
        q: "Ποια ομάδα ήταν πιο ευτυχισμένη στο πείραμα με τα €20;",
        options: [
          "Αυτή που αγόρασε κάτι για τον εαυτό της",
          "Αυτή που έσωσε τα χρήματα",
          "Αυτή που τα ξόδεψε σε άλλους",
          "Και οι δύο ήταν εξίσου ευτυχισμένες",
        ],
        correct: 2,
        explain: "Η ομάδα που ξόδεψε σε άλλους ήταν πιο ευτυχισμένη. Το να δίνεις ενεργοποιεί το κέντρο ανταμοιβής του εγκεφάλου!",
      },
    ],
  },
  "7": {
    id: 7,
    title: "Brainstorming: Βρες την ιδέα σου",
    emoji: "💡",
    xp: 200,
    color: "oklch(0.57_0.23_292)",
    slides: [
      { heading: "Το πρόβλημα είναι η ιδέα", body: "Κάθε επιτυχημένη επιχείρηση λύνει ένα πρόβλημα. Η Airbnb είδε ότι τα ξενοδοχεία ήταν ακριβά. Η Uber είδε ότι δεν υπήρχε εύκολο ταξί. Ρώτα τον εαυτό σου: «Τι με εκνευρίζει; Τι λείπει από τη ζωή μου;» Εκεί κρύβεται η ιδέα.", emoji: "🔍" },
      { heading: "Τεχνικές brainstorming", body: "3 τρόποι για να βρεις ιδέες: 1) Mind map — γράψε ένα πρόβλημα στη μέση και βάλε γύρω λύσεις. 2) «Τι θα έκανε ο...» — σκέψου πώς θα έλυνε το πρόβλημα ο Elon Musk ή ο Steve Jobs. 3) Παρατήρηση — κάθισε σε ένα σημείο 1 ώρα και γράψε ό,τι παρατηρείς που δεν δουλεύει καλά.", emoji: "🧠" },
      { heading: "Πώς επιλέγεις την καλύτερη ιδέα", body: "Από 10 ιδέες, επέλεξε με 3 ερωτήσεις: Α) Υπάρχουν ήδη άνθρωποι που έχουν αυτό το πρόβλημα; Β) Θα πλήρωναν για να λυθεί; Γ) Μπορώ εγώ να το κάνω με τα μέσα που έχω; Η ιδέα που απαντά ΝΑΙ και στις 3 — αυτή πας μπροστά.", emoji: "✅" },
    ],
    questions: [
      { q: "Ποιο είναι το πρώτο βήμα για να βρεις μια επιχειρηματική ιδέα;", options: ["Να νοικιάσεις γραφείο", "Να εντοπίσεις ένα πρόβλημα που υπάρχει", "Να φτιάξεις logo", "Να βρεις χρηματοδότη"], correct: 1, explain: "Σωστά! Κάθε επιτυχημένη επιχείρηση ξεκινά από ένα πρόβλημα που κάποιος θέλει να λύσει — και πληρώνει για αυτό." },
      { q: "Έχεις 10 ιδέες. Ποια κρατάς;", options: ["Αυτή που σου αρέσει περισσότερο αισθητικά", "Αυτή που έχει ήδη ανταγωνισμό οπότε αποδεδειγμένα δουλεύει", "Αυτή για την οποία υπάρχει πρόβλημα, κόσμος που πληρώνει, και μπορείς να υλοποιήσεις", "Αυτή με το πιο cool όνομα"], correct: 2, explain: "Ακριβώς! Η ιδέα που απαντά ΝΑΙ και στις 3 ερωτήσεις (πρόβλημα, πληρωμή, υλοποίηση) είναι αυτή που προχωράς." },
      { q: "Η Uber ξεκίνησε γιατί οι ιδρυτές της:", options: ["Ήθελαν να γίνουν πλούσιοι γρήγορα", "Δεν μπορούσαν να βρουν ταξί εύκολα μια βροχερή νύχτα", "Είχαν ήδη κεφάλαιο και αναζητούσαν ιδέα", "Αντέγραψαν μια ευρωπαϊκή εταιρία"], correct: 1, explain: "Σωστά! Το πραγματικό πρόβλημα της καθημερινής ζωής έγινε δισεκατομμυριούχα εταιρία. Τα καλύτερα startups ξεκινούν έτσι." },
    ],
  },
  "8": {
    id: 8, title: "Business Model Canvas", emoji: "🗺️", xp: 250, color: "oklch(0.55_0.17_173)",
    slides: [
      { heading: "Ένα σχέδιο σε 1 σελίδα", body: "Το Business Model Canvas (BMC) είναι ένας χάρτης που δείχνει ολόκληρη την επιχείρησή σου σε 9 κουτιά. Αντί να γράφεις business plan 50 σελίδων, το BMC σε αναγκάζει να σκεφτείς τα βασικά σε 30 λεπτά. Το χρησιμοποιούν Airbnb, Spotify, Apple.", emoji: "📋" },
      { heading: "Τα 9 κουτιά", body: "1) Πελάτες — ποιοι είναι; 2) Αξία — τι τους δίνεις; 3) Κανάλια — πώς τους φτάνεις; 4) Σχέση — πώς τους κρατάς; 5) Έσοδα — πώς πληρώνεσαι; 6) Πόροι — τι χρειάζεσαι; 7) Δραστηριότητες — τι κάνεις κάθε μέρα; 8) Συνεργάτες — ποιοι σε βοηθούν; 9) Κόστος — τι πληρώνεις.", emoji: "🔲" },
      { heading: "Παράδειγμα: Spotify", body: "Πελάτες: ακροατές + καλλιτέχνες. Αξία: μουσική παντού χωρίς να αγοράζεις. Κανάλια: app. Έσοδα: συνδρομή €10/μήνα + διαφήμιση για δωρεάν χρήστες. Κόστος: άδειες μουσικής. Αυτά τα 9 κουτιά εξηγούν μια εταιρία €90 δισ. Τώρα σκέψου: ποιο είναι το δικό σου BMC;", emoji: "🎵" },
    ],
    questions: [
      { q: "Ποιο κουτί του BMC απαντά στο «Πώς κερδίζω χρήματα;»", options: ["Κανάλια", "Έσοδα", "Πόροι", "Σχέση με πελάτες"], correct: 1, explain: "Σωστά! Το κουτί «Έσοδα» (Revenue Streams) δείχνει όλους τους τρόπους που η επιχείρηση παράγει χρήμα." },
      { q: "Γιατί είναι χρήσιμο το BMC αντί για business plan 50 σελίδων;", options: ["Γιατί είναι πιο εντυπωσιακό οπτικά", "Γιατί αναγκάζει να σκεφτείς τα βασικά γρήγορα και να τα δεις όλα μαζί", "Γιατί το ζητούν οι τράπεζες", "Γιατί δεν χρειάζεται να σκεφτείς πολύ"], correct: 1, explain: "Ακριβώς! Το BMC δίνει μια ολοκληρωμένη εικόνα της επιχείρησης σε 1 σελίδα — ιδανικό για να ελέγξεις αν η ιδέα σου έχει νόημα." },
      { q: "Στο BMC της Spotify, ποιο είναι το κουτί «Αξία» για τους ακροατές;", options: ["Η συνδρομή €10/μήνα", "Μουσική παντού χωρίς να αγοράζεις κάθε τραγούδι", "Το app στο κινητό", "Οι διαφημίσεις"], correct: 1, explain: "Σωστά! Η «αξία» είναι αυτό που λύνει το πρόβλημα του πελάτη. Το Spotify λύνει το «θέλω μουσική παντού, φθηνά»." },
    ],
  },
  "9": {
    id: 9, title: "Marketing & Branding", emoji: "📣", xp: 250, color: "oklch(0.57_0.2_28)",
    slides: [
      { heading: "Ποιος είναι ο πελάτης σου;", body: "Πριν κάνεις οτιδήποτε, πρέπει να ξέρεις ΑΚΡΙΒΩΣ σε ποιον μιλάς. Όχι «όλοι» — αυτό σημαίνει κανείς. Π.χ.: «Κορίτσια 13-16 που αγαπούν τη μόδα, ζουν στην πόλη, έχουν χαρτζιλίκι €20/εβδομάδα, και ακολουθούν influencers στο TikTok.» Όσο πιο συγκεκριμένος ο πελάτης, τόσο πιο εύκολο το marketing.", emoji: "🎯" },
      { heading: "Πώς χτίζεις brand", body: "Brand δεν είναι το logo — είναι η αίσθηση που αφήνεις. 3 ερωτήσεις: Α) Ποιες αξίες εκπροσωπεί η επιχείρησή σου; Β) Αν ήταν άνθρωπος, πώς θα μιλούσε; Γ) Ποιο πρόβλημα λύνει και πώς κάνει τον πελάτη να νιώθει μετά; Η Apple δεν πουλά τηλέφωνα — πουλά το «εγώ είμαι δημιουργικός».", emoji: "✨" },
      { heading: "Marketing για teens: social media", body: "Δεν χρειάζεσαι budget. Χρειάζεσαι στρατηγική: 1) TikTok/Reels — δείξε τη διαδικασία, όχι μόνο το αποτέλεσμα. 2) Before/after — δείξε το πρόβλημα και τη λύση σου. 3) Testimonials — ζήτα από τους πρώτους πελάτες να μιλήσουν. 4) Consistency — 3 posts/εβδομάδα είναι καλύτερα από 10 posts μια φορά και μετά τίποτα.", emoji: "📱" },
    ],
    questions: [
      { q: "Ποιος είναι ο σωστός τρόπος να ορίσεις τον πελάτη σου;", options: ["«Όλοι οι άνθρωποι»", "«Νέοι 15-25»", "«Κορίτσια 14-17 που αγαπούν τη μόδα, έχουν TikTok, χαρτζιλίκι €15-25/εβδομάδα»", "«Οποιος θέλει να αγοράσει»"], correct: 2, explain: "Ακριβώς! Όσο πιο συγκεκριμένος ο πελάτης, τόσο πιο αποτελεσματικό το μήνυμά σου." },
      { q: "Τι πουλά στην ουσία η Apple με τη διαφήμισή της;", options: ["Τεχνικές προδιαγραφές", "Φθηνές τιμές", "Την αίσθηση ότι είσαι δημιουργικός και διαφορετικός", "Εξυπηρέτηση πελατών"], correct: 2, explain: "Σωστά! Το brand marketing πουλά συναίσθημα και ταυτότητα, όχι χαρακτηριστικά." },
      { q: "Ποια στρατηγική social media είναι πιο αποτελεσματική για νέα επιχείρηση με μηδέν budget;", options: ["Να πληρώσεις για διαφήμιση αμέσως", "3 συνεπή posts/εβδομάδα που δείχνουν τη διαδικασία και το before/after", "Να ανεβάσεις 50 posts μια μέρα", "Να περιμένεις να σε βρουν οι πελάτες μόνοι τους"], correct: 1, explain: "Μπράβο! Η συνέπεια κτίζει κοινό." },
    ],
  },
  "10": {
    id: 10, title: "Pricing & Break-even", emoji: "💹", xp: 300, color: "oklch(0.57_0.23_292)",
    slides: [
      { heading: "Πώς ορίζεις τιμή", body: "3 τρόποι: Α) Cost-plus — υπολογίζεις κόστος + κέρδος (π.χ. κόστος €3, θες 50% κέρδος = τιμή €4,50). Β) Ανταγωνισμός — κοιτάς τι χρεώνουν οι άλλοι. Γ) Αξία — χρεώνεις βάσει του τι αξίζει για τον πελάτη. Π.χ. αν εξοικονομεί €100, μπορείς να χρεώσεις €30 άνετα.", emoji: "💰" },
      { heading: "Το Break-even point", body: "Break-even = το σημείο που δεν χάνεις αλλά δεν κερδίζεις. Τύπος: Break-even = Σταθερό κόστος ÷ (Τιμή − Μεταβλητό κόστος/unit). Π.χ.: Σταθερό κόστος €200/μήνα, πουλάς €10, κόστος ανά προϊόν €4. Break-even = 200 ÷ (10−4) = 34 πωλήσεις.", emoji: "📊" },
      { heading: "Στρατηγικές τιμολόγησης", body: "Freemium: δώσε κάτι δωρεάν, χρέωσε για premium (Spotify). Subscription: μηνιαία χρέωση (Netflix). Bundle: πούλα 3 μαζί φθηνότερα. Anchoring: βάλε μια ακριβή επιλογή δίπλα στη μέση για να φαίνεται φθηνή.", emoji: "🧩" },
    ],
    questions: [
      { q: "Κόστος παραγωγής €5, θες 60% κέρδος. Ποια η τιμή πώλησης;", options: ["€7", "€8", "€8,50", "€10"], correct: 1, explain: "Σωστά! Cost-plus: €5 × 1,60 = €8." },
      { q: "Σταθερό κόστος €150/μήνα. Πουλάς €5/unit, κόστος ανά unit €2. Πόσα πρέπει να πουλήσεις για break-even;", options: ["30 units", "50 units", "75 units", "150 units"], correct: 1, explain: "Σωστά! Break-even = 150 ÷ (5−2) = 50 units." },
      { q: "Ποια στρατηγική χρησιμοποιεί το Spotify;", options: ["Bundle", "Anchoring", "Freemium", "Cost-plus"], correct: 2, explain: "Ακριβώς! Freemium = δίνεις βασική υπηρεσία δωρεάν, χρεώνεις για premium." },
    ],
  },
  "11": {
    id: 11, title: "Pitch: Πούλησε την ιδέα σου", emoji: "🎤", xp: 300, color: "oklch(0.55_0.17_173)",
    slides: [
      { heading: "Τι είναι ένα pitch", body: "Pitch είναι η παρουσίαση της ιδέας σου σε κάποιον που μπορεί να επενδύσει ή να αγοράσει. Έχεις 2 λεπτά ή 10 διαφάνειες. Στόχος δεν είναι να εξηγήσεις τα πάντα — στόχος είναι να τους κάνεις να πουν «θέλω να μάθω περισσότερα». Ο Airbnb pitch του 2009 ήταν 10 διαφάνειες και πήρε $600.000.", emoji: "🚀" },
      { heading: "Η δομή του pitch (10 slides)", body: "1) Πρόβλημα 2) Λύση 3) Αγορά 4) Προϊόν 5) Business model 6) Ανταγωνισμός 7) Marketing 8) Ομάδα 9) Αριθμοί 10) Αίτημα", emoji: "📑" },
      { heading: "Τι κάνει ένα pitch δυνατό", body: "3 μυστικά: Α) Ξεκίνα με ιστορία. Β) Δείξε, μην πεις — demo ή mockup. Γ) Να ξέρεις τους αριθμούς. Ο επενδυτής αγοράζει εσένα — την ικανότητά σου να το υλοποιήσεις.", emoji: "💪" },
    ],
    questions: [
      { q: "Ποιος είναι ο ΚΥΡΙΟΣ στόχος ενός pitch;", options: ["Να εξηγήσεις κάθε λεπτομέρεια", "Να κάνεις τον επενδυτή να πει «θέλω να μάθω περισσότερα»", "Να δείξεις ότι ξέρεις πολλά πράγματα", "Να διαβάσεις τις διαφάνειές σου"], correct: 1, explain: "Σωστά! Το pitch είναι «άνοιγμα πόρτας»." },
      { q: "Ποια διαφάνεια έρχεται ΠΡΩΤΗ;", options: ["Οι αριθμοί", "Η ομάδα", "Το πρόβλημα που λύνεις", "Το αίτημα χρηματοδότησης"], correct: 2, explain: "Ακριβώς! Πρώτα δείχνεις ότι υπάρχει πραγματικό πρόβλημα." },
      { q: "Ποιο είναι το πιο δυνατό άνοιγμα;", options: ["«Η εταιρία μας ιδρύθηκε το 2024...»", "«Φανταστείτε ότι είστε 14 χρονών και δεν μπορείτε να βρείτε...»", "«Έχω 47 διαφάνειες»", "«Το προϊόν μας έχει 15 χαρακτηριστικά»"], correct: 1, explain: "Μπράβο! Η ιστορία που βάζει τον ακροατή στο πρόβλημα είναι το πιο δυνατό άνοιγμα." },
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
          <div className="flex items-center gap-3">
            {lesson.slides.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= slideIdx ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{slideIdx + 1} / {lesson.slides.length}</p>
          <div className="mt-8 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="text-center text-6xl">{slide.emoji}</div>
            <h2 className="mt-6 text-2xl font-black">{slide.heading}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{slide.body}</p>
          </div>
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
          <div className="flex items-center gap-3">
            {lesson.questions.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < questionIdx ? "bg-primary" : i === questionIdx ? "bg-primary/50" : "bg-border"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-muted-foreground">Ερώτηση {questionIdx + 1} από {totalQuestions}</p>
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
  const hasNext = nextLessonId <= 11;

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
        <div className="mx-auto mt-8 max-w-xs rounded-2xl bg-[oklch(0.88_0.1_55)] px-6 py-5">
          <p className="text-sm font-black uppercase tracking-widest text-[oklch(0.45_0.13_50)]">Κέρδισες</p>
          <p className="mt-1 text-5xl font-black text-[oklch(0.35_0.12_35)]">+{earnedXP} XP</p>
          <p className="mt-1 text-xs text-[oklch(0.5_0.12_45)]">από {lesson.xp} δυνατά</p>
        </div>
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
