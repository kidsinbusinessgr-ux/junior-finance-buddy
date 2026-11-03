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
