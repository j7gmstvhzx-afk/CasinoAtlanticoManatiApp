-- Casino Atlántico Manatí — reconcile floor to 'Listing Mayo 31 2026'
-- Generated from 9fcca5b2-Listing_Mayo_31.xls, matched by machine asset id.
-- ONLY touches location, game, active (+ inserts new machines). NEVER edits
-- avg_coin_in / avg_win / period data already entered for existing machines.
-- Run ONCE in Supabase SQL Editor, AFTER 0006_fix_min_bets.sql.

begin;

-- ── 1. Relocations: 26 machines moved position ──
update public.machines set location = '35-05', updated_at = now() where id = '1023';  -- 27-03 -> 35-05
update public.machines set location = '48-01', updated_at = now() where id = '1024';  -- 30-01 -> 48-01
update public.machines set location = '48-02', updated_at = now() where id = '1025';  -- 30-02 -> 48-02
update public.machines set location = '48-03', updated_at = now() where id = '1028';  -- 30-03 -> 48-03
update public.machines set location = '48-04', updated_at = now() where id = '1030';  -- 30-04 -> 48-04
update public.machines set location = '48-05', updated_at = now() where id = '1031';  -- 30-05 -> 48-05
update public.machines set location = '48-06', updated_at = now() where id = '1032';  -- 30-06 -> 48-06
update public.machines set location = '35-07', updated_at = now() where id = '1033';  -- 30-07 -> 35-07
update public.machines set location = '35-06', updated_at = now() where id = '1034';  -- 27-02 -> 35-06
update public.machines set location = '26-01', updated_at = now() where id = '2018';  -- 26-07 -> 26-01
update public.machines set location = '26-02', updated_at = now() where id = '2019';  -- 26-08 -> 26-02
update public.machines set location = '26-03', updated_at = now() where id = '2020';  -- 26-09 -> 26-03
update public.machines set location = '26-08', updated_at = now() where id = '2021';  -- 26-10 -> 26-08
update public.machines set location = '26-09', updated_at = now() where id = '2022';  -- 26-11 -> 26-09
update public.machines set location = '26-10', updated_at = now() where id = '2023';  -- 26-12 -> 26-10
update public.machines set location = '35-08', updated_at = now() where id = '2145';  -- 30-08 -> 35-08
update public.machines set location = '46-04', updated_at = now() where id = '2199';  -- 47-02 -> 46-04
update public.machines set location = '26-06', updated_at = now() where id = '2200';  -- 47-05 -> 26-06
update public.machines set location = '46-03', updated_at = now() where id = '2202';  -- 47-01 -> 46-03
update public.machines set location = '26-04', updated_at = now() where id = '2203';  -- 47-03 -> 26-04
update public.machines set location = '26-05', updated_at = now() where id = '2210';  -- 47-04 -> 26-05
update public.machines set location = '26-07', updated_at = now() where id = '2211';  -- 47-06 -> 26-07
update public.machines set location = '27-01', updated_at = now() where id = '2212';  -- 35-05 -> 27-01
update public.machines set location = '27-02', updated_at = now() where id = '2215';  -- 35-08 -> 27-02
update public.machines set location = '27-03', updated_at = now() where id = '2216';  -- 49-01 -> 27-03
update public.machines set location = '27-04', updated_at = now() where id = '2217';  -- 49-02 -> 27-04

-- ── 2. Game changes: 17 machines re-themed ──
update public.machines set game = 'Dragon Celebration', updated_at = now() where id = '2065';  -- was 'Pride of Egypt'
update public.machines set game = 'China Shores Double Winnings', updated_at = now() where id = '2067';  -- was 'Pride of Egypt'
update public.machines set game = 'Buena Suerte', updated_at = now() where id = '2242';  -- was 'Super Charged 7s'
update public.machines set game = 'Mighty Panda', updated_at = now() where id = '2254';  -- was 'Masked Warrior AA'
update public.machines set game = 'Mighty Panda', updated_at = now() where id = '2256';  -- was 'Masked Warrior AA'
update public.machines set game = 'Multi Win 21', updated_at = now() where id = '2311';  -- was 'MW21'
update public.machines set game = 'San-Fa-PANDAS', updated_at = now() where id = '2320';  -- was 'SA FA-PANDAS'
update public.machines set game = 'San-Fa-TIGERS', updated_at = now() where id = '2321';  -- was 'SANFA-TIGERS'
update public.machines set game = 'San-Fa-DRAGONS', updated_at = now() where id = '2322';  -- was 'SAN-FA DRAGONS'
update public.machines set game = 'San-Fa-TIGERS', updated_at = now() where id = '2323';  -- was 'SANFA-TIGERS'
update public.machines set game = 'San-Fa-PANDAS', updated_at = now() where id = '2324';  -- was 'SA FA-PANDAS'
update public.machines set game = 'San-Fa-DRAGONS', updated_at = now() where id = '2325';  -- was 'SAN-FA DRAGONS'
update public.machines set game = 'Chili Fire Hot Rush RED', updated_at = now() where id = '2330';  -- was 'ChLLi Fire Hot Rush RED'
update public.machines set game = 'Chili Fire Hot Rush Green', updated_at = now() where id = '2331';  -- was 'Chilli Chilli Fire Hot Rush GR'
update public.machines set game = 'Chili Fire Hot Rush RED', updated_at = now() where id = '2332';  -- was 'ChLLi Fire Hot Rush RED'
update public.machines set game = 'Bingo Frenzy Stampede Shark', updated_at = now() where id = '2336';  -- was 'Bingo Frecy Stampede Shark'
update public.machines set game = 'Bingo Frenzy Stampede Shark', updated_at = now() where id = '2337';  -- was 'Bingo Frecy Stampede Shark'

-- ── 3. Retired / removed from floor: 16 machines (kept for history, coin-in/win preserved) ──
update public.machines set active = false, updated_at = now() where id = '1026';  -- 27-04 'Rhythms of Rio'
update public.machines set active = false, updated_at = now() where id = '1027';  -- 27-01 'Legion Warrior'
update public.machines set active = false, updated_at = now() where id = '2011';  -- 26-01 'Hu-Wang'
update public.machines set active = false, updated_at = now() where id = '2013';  -- 26-02 'Hu-Wang'
update public.machines set active = false, updated_at = now() where id = '2014';  -- 26-03 'FU-YANG'
update public.machines set active = false, updated_at = now() where id = '2015';  -- 26-04 'Hu-Wang'
update public.machines set active = false, updated_at = now() where id = '2016';  -- 26-05 'FU-YANG'
update public.machines set active = false, updated_at = now() where id = '2017';  -- 26-06 'Hu-Wang'
update public.machines set active = false, updated_at = now() where id = '2170';  -- 48-01 'Furtunes Ablaze'
update public.machines set active = false, updated_at = now() where id = '2171';  -- 48-03 'CHINA SHORES DW'
update public.machines set active = false, updated_at = now() where id = '2172';  -- 48-02 'Dynasty Riches'
update public.machines set active = false, updated_at = now() where id = '2173';  -- 48-05 'Flying Fortunes'
update public.machines set active = false, updated_at = now() where id = '2174';  -- 48-04 'Flying Fortunes'
update public.machines set active = false, updated_at = now() where id = '2175';  -- 48-06 'Dragon Celebration'
update public.machines set active = false, updated_at = now() where id = '2213';  -- 35-06 'Selexion Concerto MG'
update public.machines set active = false, updated_at = now() where id = '2214';  -- 35-07 'Selexion Concerto MG'

-- ── 4. New machines on floor (no coin-in/win yet — awaiting data entry): 16 ──
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2359', '30-01', 'Blue Prosperity', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2360', '30-02', 'Red Prosperity', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2361', '30-03', 'Blue Prosperity', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2362', '30-04', 'Red Prosperity', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2363', '30-05', 'Go-Ghost', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2364', '30-06', 'Yo Yeti', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2365', '30-07', 'Mo-Mummy', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2366', '30-08', 'Yo Yeti', 'Konami', 'Multi Line', 0.01, false, '0.01', 2.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2367', '47-01', 'Dragon Firecracker Jade', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2368', '47-08', 'Dragon Firecracker Jade', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2369', '47-07', 'Dragon Firecracker Ruby', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2370', '47-02', 'Dragon Firecracker Jade', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2371', '47-03', 'Lian Lian Fa Fortune Peach', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2372', '47-06', 'Lian Lian Fa Fortune Peach', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2373', '47-04', 'Lian Lian Fa Treasured Peach', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;
insert into public.machines (id, location, game, manufacturer, type, min_bet, multi_deno, denomination, max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active) values ('2374', '47-05', 'Lian Lian Fa Treasured Peach', 'Konami', 'Multi Line', 0.01, false, '0.01', 3.00, null, null, null, null, null, true) on conflict (id) do update set location = excluded.location, game = excluded.game, active = true;

-- ── 5. Auto change-log (Cambios tab) ──
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1023', 'reubicacion', 'Konami', null, null, '27-03', '35-05', '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1024', 'reubicacion', 'Konami', null, null, '30-01', '48-01', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1025', 'reubicacion', 'Konami', null, null, '30-02', '48-02', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1028', 'reubicacion', 'Konami', null, null, '30-03', '48-03', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1030', 'reubicacion', 'Konami', null, null, '30-04', '48-04', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1031', 'reubicacion', 'Konami', null, null, '30-05', '48-05', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1032', 'reubicacion', 'Konami', null, null, '30-06', '48-06', '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1033', 'reubicacion', 'Konami', null, null, '30-07', '35-07', '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1034', 'reubicacion', 'Konami', null, null, '27-02', '35-06', '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2018', 'reubicacion', 'Light & Wonder', null, null, '26-07', '26-01', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2019', 'reubicacion', 'Light & Wonder', null, null, '26-08', '26-02', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2020', 'reubicacion', 'Light & Wonder', null, null, '26-09', '26-03', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2021', 'reubicacion', 'Light & Wonder', null, null, '26-10', '26-08', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2022', 'reubicacion', 'Light & Wonder', null, null, '26-11', '26-09', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2023', 'reubicacion', 'Light & Wonder', null, null, '26-12', '26-10', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2145', 'reubicacion', 'Konami', null, null, '30-08', '35-08', '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2199', 'reubicacion', 'Konami', null, null, '47-02', '46-04', '46', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2200', 'reubicacion', 'Konami', null, null, '47-05', '26-06', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2202', 'reubicacion', 'Konami', null, null, '47-01', '46-03', '46', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2203', 'reubicacion', 'Konami', null, null, '47-03', '26-04', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2210', 'reubicacion', 'Konami', null, null, '47-04', '26-05', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2211', 'reubicacion', 'Konami', null, null, '47-06', '26-07', '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2212', 'reubicacion', 'Aristocrat', null, null, '35-05', '27-01', '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2215', 'reubicacion', 'Aristocrat', null, null, '35-08', '27-02', '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2216', 'reubicacion', 'Konami', null, null, '49-01', '27-03', '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2217', 'reubicacion', 'Konami', null, null, '49-02', '27-04', '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2065', 'cambio_juego', 'Konami', 'Pride of Egypt', 'Dragon Celebration', null, null, '32', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2067', 'cambio_juego', 'Konami', 'Pride of Egypt', 'China Shores Double Winnings', null, null, '32', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2242', 'cambio_juego', 'Ainsworth', 'Super Charged 7s', 'Buena Suerte', null, null, '22', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2254', 'cambio_juego', 'Konami', 'Masked Warrior AA', 'Mighty Panda', null, null, '10', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2256', 'cambio_juego', 'Konami', 'Masked Warrior AA', 'Mighty Panda', null, null, '10', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2311', 'cambio_juego', 'Ainsworth', 'MW21', 'Multi Win 21', null, null, '41', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2320', 'cambio_juego', 'Ainsworth', 'SA FA-PANDAS', 'San-Fa-PANDAS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2321', 'cambio_juego', 'Ainsworth', 'SANFA-TIGERS', 'San-Fa-TIGERS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2322', 'cambio_juego', 'Ainsworth', 'SAN-FA DRAGONS', 'San-Fa-DRAGONS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2323', 'cambio_juego', 'Ainsworth', 'SANFA-TIGERS', 'San-Fa-TIGERS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2324', 'cambio_juego', 'Ainsworth', 'SA FA-PANDAS', 'San-Fa-PANDAS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2325', 'cambio_juego', 'Ainsworth', 'SAN-FA DRAGONS', 'San-Fa-DRAGONS', null, null, '15', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2330', 'cambio_juego', 'Konami', 'ChLLi Fire Hot Rush RED', 'Chili Fire Hot Rush RED', null, null, '25', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2331', 'cambio_juego', 'Konami', 'Chilli Chilli Fire Hot Rush GR', 'Chili Fire Hot Rush Green', null, null, '25', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2332', 'cambio_juego', 'Konami', 'ChLLi Fire Hot Rush RED', 'Chili Fire Hot Rush RED', null, null, '25', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2336', 'cambio_juego', 'Konami', 'Bingo Frecy Stampede Shark', 'Bingo Frenzy Stampede Shark', null, null, '31', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2337', 'cambio_juego', 'Konami', 'Bingo Frecy Stampede Shark', 'Bingo Frenzy Stampede Shark', null, null, '31', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1026', 'removida', 'Konami', 'Rhythms of Rio', null, '27-04', null, '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('1027', 'removida', 'Konami', 'Legion Warrior', null, '27-01', null, '27', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2011', 'removida', 'Light & Wonder', 'Hu-Wang', null, '26-01', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2013', 'removida', 'Light & Wonder', 'Hu-Wang', null, '26-02', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2014', 'removida', 'Light & Wonder', 'FU-YANG', null, '26-03', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2015', 'removida', 'Light & Wonder', 'Hu-Wang', null, '26-04', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2016', 'removida', 'Light & Wonder', 'FU-YANG', null, '26-05', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2017', 'removida', 'Light & Wonder', 'Hu-Wang', null, '26-06', null, '26', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2170', 'removida', 'Konami', 'Furtunes Ablaze', null, '48-01', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2171', 'removida', 'Konami', 'CHINA SHORES DW', null, '48-03', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2172', 'removida', 'Konami', 'Dynasty Riches', null, '48-02', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2173', 'removida', 'Konami', 'Flying Fortunes', null, '48-05', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2174', 'removida', 'Konami', 'Flying Fortunes', null, '48-04', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2175', 'removida', 'Konami', 'Dragon Celebration', null, '48-06', null, '48', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2213', 'removida', 'Aristocrat', 'Selexion Concerto MG', null, '35-06', null, '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2214', 'removida', 'Aristocrat', 'Selexion Concerto MG', null, '35-07', null, '35', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2359', 'compra', 'Konami', null, 'Blue Prosperity', null, '30-01', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2360', 'compra', 'Konami', null, 'Red Prosperity', null, '30-02', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2361', 'compra', 'Konami', null, 'Blue Prosperity', null, '30-03', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2362', 'compra', 'Konami', null, 'Red Prosperity', null, '30-04', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2363', 'compra', 'Konami', null, 'Go-Ghost', null, '30-05', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2364', 'compra', 'Konami', null, 'Yo Yeti', null, '30-06', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2365', 'compra', 'Konami', null, 'Mo-Mummy', null, '30-07', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2366', 'compra', 'Konami', null, 'Yo Yeti', null, '30-08', '30', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2367', 'compra', 'Konami', null, 'Dragon Firecracker Jade', null, '47-01', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2368', 'compra', 'Konami', null, 'Dragon Firecracker Jade', null, '47-08', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2369', 'compra', 'Konami', null, 'Dragon Firecracker Ruby', null, '47-07', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2370', 'compra', 'Konami', null, 'Dragon Firecracker Jade', null, '47-02', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2371', 'compra', 'Konami', null, 'Lian Lian Fa Fortune Peach', null, '47-03', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2372', 'compra', 'Konami', null, 'Lian Lian Fa Fortune Peach', null, '47-06', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2373', 'compra', 'Konami', null, 'Lian Lian Fa Treasured Peach', null, '47-04', '47', now(), 'Mayo 31 2026');
insert into public.machine_changes (mc, type, manufacturer, game_2024, game_2025, location_2024, location_2025, bank, recorded_at, period_label) values ('2374', 'compra', 'Konami', null, 'Lian Lian Fa Treasured Peach', null, '47-05', '47', now(), 'Mayo 31 2026');

commit;
