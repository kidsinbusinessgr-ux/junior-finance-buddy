-- Spelling, following the school grammar (Γραμματική Νέας Ελληνικής Γλώσσας,
-- Γυμνασίου): «εταιρεία», not «εταιρία».
update public.jfb_achievements
set description_gr = regexp_replace(description_gr, 'εταιρί(α|ας|ες|ών)', 'εταιρεί\1', 'g')
where description_gr ~ 'εταιρί';
