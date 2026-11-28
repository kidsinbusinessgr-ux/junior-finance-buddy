-- "Startup" is feminine in Greek (η startup, like η εταιρεία). Fix the texts
-- the database writes: transaction descriptions in three functions, the
-- achievements, and the past rows that already say "το startup".

do $$
declare
  f record;
  def text;
begin
  for f in
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('jfb_invest_in_startup', 'jfb_sell_startup_stake', 'jfb_pay_startup_dividend')
  loop
    def := pg_get_functiondef(f.oid);
    def := replace(def, 'Επένδυση στο startup ', 'Επένδυση στη startup ');
    def := replace(def, 'Πώληση μεριδίου στο startup ', 'Πώληση μεριδίου στη startup ');
    def := replace(def, 'Μέρισμα από το startup ', 'Μέρισμα από τη startup ');
    execute def;
  end loop;
end $$;

update public.jfb_achievements set description_gr = replace(description_gr, 'Έφτιαξες το πρώτο σου startup', 'Έφτιαξες την πρώτη σου startup')
where description_gr like '%το πρώτο σου startup%';
update public.jfb_achievements set description_gr = replace(description_gr, 'Επένδυσες στο startup ενός φίλου', 'Επένδυσες στη startup ενός φίλου')
where description_gr like '%στο startup ενός φίλου%';
update public.jfb_achievements set description_gr = replace(description_gr, 'Το startup σου βγήκε πρώτο', 'Η startup σου βγήκε πρώτη')
where description_gr like '%Το startup σου βγήκε πρώτο%';
update public.jfb_achievements set description_gr = replace(description_gr, 'Το startup σου βγήκε', 'Η startup σου βγήκε')
where description_gr like '%Το startup σου βγήκε%';

update public.jfb_transactions set description = replace(replace(replace(replace(description,
  'Επένδυση στο startup ', 'Επένδυση στη startup '),
  'Πώληση μεριδίου στο startup ', 'Πώληση μεριδίου στη startup '),
  'Μέρισμα από το startup ', 'Μέρισμα από τη startup '),
  'στο δικό σου startup', 'στη δική σου startup')
where description like '%startup%';

update public.jfb_notifications set message = replace(message, 'τα startups των φίλων σου', 'τις startups των φίλων σου')
where message like '%τα startups των φίλων σου%';
