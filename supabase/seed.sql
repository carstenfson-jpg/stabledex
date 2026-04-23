-- Stabledex seed data
-- Run this AFTER schema.sql in your Supabase SQL editor

-- Riders
insert into riders (id, name, country, fei_id) values
  ('r01', 'Peder Fredricson', 'Sweden', '10003570'),
  ('r02', 'Henrik von Eckermann', 'Sweden', '10008800'),
  ('r03', 'Malin Baryard-Johnsson', 'Sweden', '10003245'),
  ('r04', 'Marcus Ehning', 'Germany', '10000003'),
  ('r05', 'Daniel Deusser', 'Germany', '10001268'),
  ('r06', 'Harrie Smolders', 'Netherlands', '10000530'),
  ('r07', 'Maikel van der Vleuten', 'Netherlands', '10007541'),
  ('r08', 'Kevin Staut', 'France', '10000603'),
  ('r09', 'Gregory Wathelet', 'Belgium', '10001343'),
  ('r10', 'Olivier Philippaerts', 'Belgium', '10011415'),
  ('r11', 'Scott Brash', 'Great Britain', '10015978'),
  ('r12', 'Ben Maher', 'Great Britain', '10001430'),
  ('r13', 'Bertram Allen', 'Ireland', '10019006'),
  ('r14', 'Shane Sweetnam', 'Ireland', '10014461'),
  ('r15', 'Isabell Werth', 'Germany', '10000082'),
  ('r16', 'Charlotte Dujardin', 'Great Britain', '10013145'),
  ('r17', 'Jessica von Bredow-Werndl', 'Germany', '10009784'),
  ('r18', 'Carl Hester', 'Great Britain', '10000080'),
  ('r19', 'Laura Graves', 'Sweden', '10075101'),
  ('r20', 'Ingrid Klimke', 'Germany', '10001175');

-- Horses (Show Jumping)
insert into horses (id, name, breed, studbook_number, date_of_birth, gender, sire, dam, country, owner, current_rider_id) values
  ('h01', 'All In', 'KWPN', 'KWPN-104MA57', '2008-04-12', 'Stallion', 'Exodus', 'Ramona', 'Netherlands', 'Van Olst Horses BV', 'r02'),
  ('h02', 'Catch Me Not S', 'SWB', 'SWB-105WN89', '2010-06-03', 'Mare', 'Casall', 'Celine', 'Sweden', 'Stable Fredricson AB', 'r01'),
  ('h03', 'King Edward', 'KWPN', 'KWPN-107AB33', '2015-03-18', 'Gelding', 'Comme Il Faut', 'Ulien de Kalvarie', 'Netherlands', 'Blue Hors Stud', 'r02'),
  ('h04', 'Parga Karaat', 'KWPN', 'KWPN-104YZ12', '2009-05-22', 'Mare', 'Verdi TN', 'Greta', 'Netherlands', 'Stable Brash', 'r11'),
  ('h05', 'Hello Senator', 'Hanoverian', 'HAN-106CD78', '2012-07-09', 'Stallion', 'Hessian', 'Calona', 'Germany', 'Marcus Ehning GmbH', 'r04'),
  ('h06', 'Tobago Z', 'BWBS', 'BWBS-103QR44', '2007-09-14', 'Gelding', 'Tangelo van de Zuuthoeve', 'Pamela Z', 'Belgium', 'Wathelet Stables', 'r09'),
  ('h07', 'Explosion W', 'KWPN', 'KWPN-107TU90', '2014-02-28', 'Stallion', 'Mr. Blue', 'Electra', 'Netherlands', 'Ben Maher Racing', 'r12'),
  ('h08', 'Chacco-Blue II', 'Oldenburg', 'OLD-105PQ67', '2011-11-05', 'Stallion', 'Chacco-Blue', 'Fortuna', 'Germany', 'Deusser Partners', 'r05'),
  ('h09', 'Antigua', 'SWB', 'SWB-106BC22', '2012-03-30', 'Mare', 'Action Breaker', 'Ballerina', 'Sweden', 'Stable Baryard', 'r03'),
  ('h10', 'Dominator 2000 Z', 'BWBS', 'BWBS-104HI88', '2008-08-17', 'Stallion', 'Diamant de Semilly', 'Ornella Mail', 'Belgium', 'Philippaerts Family', 'r10'),
  ('h11', 'Ermitage Kalone', 'SWB', 'SWB-107UV33', '2015-01-14', 'Mare', 'Emerald van het Ruytershof', 'Kalone', 'Sweden', 'Malin Baryard Racing', 'r03'),
  ('h12', 'Gunder', 'SWB', 'SWB-105LM55', '2010-04-06', 'Gelding', 'Guidam', 'Una', 'Sweden', 'Fredricson Family', 'r01'),
  ('h13', 'Loewe Silver', 'Hanoverian', 'HAN-106DE44', '2012-05-19', 'Stallion', 'Lord Loxley I', 'Silberrose', 'Germany', 'Stable Ehning', 'r04'),
  ('h14', 'Hello Guvnor', 'KWPN', 'KWPN-108AB11', '2016-02-03', 'Gelding', 'Hello Senator', 'Gouverneur', 'Netherlands', 'Smolders NV', 'r06'),
  ('h15', 'Vigo d Arsouilles', 'BWP', 'BWP-104RS66', '2009-07-25', 'Stallion', 'Nabab de Reve', 'Fedora d Arsouilles', 'Belgium', 'Wathelet Racing', 'r09'),
  ('h16', 'Killer Queen VDM', 'KWPN', 'KWPN-108CD55', '2015-04-11', 'Mare', 'Eldorado van den Dael', 'Quick Star', 'Netherlands', 'Van der Vleuten Stud', 'r07'),
  ('h17', 'Monaco', 'Hanoverian', 'HAN-105EF77', '2011-06-28', 'Gelding', 'Montender', 'Arabella', 'Germany', 'Deusser GmbH', 'r05'),
  ('h18', 'Stargold', 'KWPN', 'KWPN-106GH44', '2013-03-07', 'Stallion', 'Totilas', 'Gold Star', 'Netherlands', 'Blue Hors International', 'r06'),
  ('h19', 'Neptune Brecourt', 'SBS', 'SBS-105IJ33', '2010-09-16', 'Stallion', 'Nabab de Reve', 'Helene Brecourt', 'Belgium', 'Staut Racing', 'r08'),
  ('h20', 'Cornet du Lys', 'SWB', 'SWB-107KL22', '2014-08-21', 'Stallion', 'Cornet Obolensky', 'Orante du Lys', 'Sweden', 'Sweetnam Stables', 'r14'),
  ('h21', 'Penelope', 'KWPN', 'KWPN-106MN99', '2012-01-30', 'Mare', 'Bustique', 'Rafaella', 'Netherlands', 'Allen Racing', 'r13'),
  ('h22', 'Fireworks', 'Holsteiner', 'HOL-104OP88', '2008-10-03', 'Stallion', 'Ferragamo', 'Wicky', 'Germany', 'Ehning Stables', 'r04'),
  ('h23', 'Tornesch', 'Hanoverian', 'HAN-105QR55', '2011-02-14', 'Gelding', 'Toulon', 'Rondella', 'Germany', 'Staut International', 'r08'),
  ('h24', 'Confu', 'Oldenburg', 'OLD-106ST44', '2013-07-07', 'Stallion', 'Conthargos', 'Futura', 'Germany', 'Smolders Racing', 'r06'),
  ('h25', 'Balia du Fleury', 'SF', 'SF-105UV33', '2011-05-18', 'Mare', 'Baloubet du Rouet', 'Florienne du Fleury', 'France', 'Staut Ecuries', 'r08');

-- Horses (Dressage)
insert into horses (id, name, breed, studbook_number, date_of_birth, gender, sire, dam, country, owner, current_rider_id) values
  ('h26', 'Weihegold OLD', 'Oldenburg', 'OLD-104WX11', '2009-03-22', 'Mare', 'Don Schufro', 'Weinkoenigin', 'Germany', 'Madeleine Winter-Schulze', 'r15'),
  ('h27', 'Dalera BB', 'Hanoverian', 'HAN-106YZ00', '2013-04-17', 'Mare', 'Easy Game', 'Delara', 'Germany', 'Therese Vifian', 'r17'),
  ('h28', 'Quantaz', 'KWPN', 'KWPN-107AB22', '2014-06-08', 'Stallion', 'Quaback', 'Kantana', 'Netherlands', 'Isabell Werth GmbH', 'r15'),
  ('h29', 'Valegro', 'KWPN', 'KWPN-103CD44', '2006-07-03', 'Gelding', 'Negro', 'Varike', 'Netherlands', 'Carl Hester & Roly Luard', 'r16'),
  ('h30', 'Escapado FRH', 'Hanoverian', 'HAN-104EF55', '2007-08-29', 'Stallion', 'Estobar NRW', 'Polly', 'Germany', 'Team Werth', 'r15'),
  ('h31', 'Glamourdale', 'KWPN', 'KWPN-107GH66', '2014-02-14', 'Stallion', 'Lord Leatherdale', 'Florette', 'Netherlands', 'Charlotte Fry', 'r16'),
  ('h32', 'Total US', 'Hanoverian', 'HAN-106IJ77', '2013-09-05', 'Stallion', 'Totilas', 'Urama', 'Germany', 'Ann-Kathrin Linsenhoff', 'r17'),
  ('h33', 'Hawtins Delicato', 'KWPN', 'KWPN-105KL88', '2011-03-19', 'Gelding', 'Dimaggio', 'Loretta', 'Netherlands', 'Carl Hester', 'r18'),
  ('h34', 'Dono di Maggio', 'Oldenburg', 'OLD-106MN99', '2012-05-24', 'Stallion', 'Dimaggio', 'Dorella', 'Germany', 'Hester Partnership', 'r18'),
  ('h35', 'Belantis', 'Hanoverian', 'HAN-107OP00', '2015-01-11', 'Stallion', 'Belissimo M', 'Caramba', 'Germany', 'Werndl Family', 'r17');

-- Horses (Eventing)
insert into horses (id, name, breed, studbook_number, date_of_birth, gender, sire, dam, country, owner, current_rider_id) values
  ('h36', 'SAP Hale Bob OLD', 'Oldenburg', 'OLD-105PQ11', '2010-04-09', 'Stallion', 'Hale Bob', 'Schlossblume', 'Germany', 'Klimke Partners', 'r20'),
  ('h37', 'Equistros Siena Just Do It', 'Hanoverian', 'HAN-106RS22', '2013-07-15', 'Mare', 'Siena Plus', 'Jubilae', 'Germany', 'Team Klimke', 'r20'),
  ('h38', 'Chap II', 'Irish Sport Horse', 'ISH-104TU33', '2008-06-01', 'Gelding', 'Champs Elysees', 'Poesia', 'Ireland', 'Allen Partners', 'r13'),
  ('h39', 'Kilpatrick Knight', 'Irish Sport Horse', 'ISH-105VW44', '2010-09-22', 'Gelding', 'Knight Errant', 'Kilpatrick Miss', 'Ireland', 'Sweetnam Racing', 'r14'),
  ('h40', 'Vitiki', 'KWPN', 'KWPN-106XY55', '2012-03-08', 'Gelding', 'Vivaldi', 'Tatika', 'Netherlands', 'Smolders Eventing', 'r06');

-- Horses (more show jumping)
insert into horses (id, name, breed, studbook_number, date_of_birth, gender, sire, dam, country, owner, current_rider_id) values
  ('h41', 'Cristallo I', 'KWPN', 'KWPN-106ZA11', '2012-11-14', 'Stallion', 'Cardento', 'Isabella', 'Netherlands', 'Maher Holdings', 'r12'),
  ('h42', 'Cassinja S', 'SWB', 'SWB-107BC22', '2015-05-30', 'Mare', 'Cassini I', 'Ninja', 'Sweden', 'Baryard Racing', 'r03'),
  ('h43', 'Vancouver K', 'Hanoverian', 'HAN-105DE33', '2011-08-17', 'Gelding', 'Van Gogh', 'Katinka', 'Germany', 'Deusser International', 'r05'),
  ('h44', 'Echo van t Spieveld', 'BWP', 'BWP-107EF44', '2014-04-25', 'Stallion', 'Echo de Muze', 'Spieveld', 'Belgium', 'Philippaerts NV', 'r10'),
  ('h45', 'Clooney 51', 'Oldenburg', 'OLD-106GH55', '2013-06-12', 'Stallion', 'Cloney', 'Fiona 51', 'Germany', 'Stable Ehning', 'r04'),
  ('h46', 'Querly Chin HB', 'SF', 'SF-104IJ66', '2009-10-08', 'Mare', 'Quick Star', 'Chin', 'France', 'Staut Racing', 'r08'),
  ('h47', 'Farrel', 'KWPN', 'KWPN-108KL77', '2015-09-01', 'Stallion', 'Fermour', 'Arelie', 'Netherlands', 'Fredricson Equestrian', 'r01'),
  ('h48', 'Primetime', 'SWB', 'SWB-106MN88', '2013-02-19', 'Gelding', 'Principal', 'Timeless', 'Sweden', 'Swedish Equestrian AB', 'r02'),
  ('h49', 'Calevo 2', 'Holsteiner', 'HOL-105OP99', '2010-07-11', 'Stallion', 'Calato', 'Evona', 'Germany', 'Smolders Racing', 'r06'),
  ('h50', 'Electra van het Neerenbosch', 'BWP', 'BWP-108QR00', '2016-03-26', 'Mare', 'Emerald van het Ruytershof', 'Lacra', 'Belgium', 'Wathelet NV', 'r09');

-- Competitions
insert into competitions (id, name, level, discipline, date, location, country) values
  ('c01', 'CHIO Aachen', 'CSI5*', 'Show Jumping', '2025-07-01', 'Aachen', 'Germany'),
  ('c02', 'Gothenburg Horse Show', 'CSI5*', 'Show Jumping', '2025-02-26', 'Gothenburg', 'Sweden'),
  ('c03', 'Brussels Stephex Masters', 'CSI5*', 'Show Jumping', '2024-11-08', 'Brussels', 'Belgium'),
  ('c04', 'Amsterdam Horse Show', 'CSI5*', 'Show Jumping', '2025-01-23', 'Amsterdam', 'Netherlands'),
  ('c05', 'CHI Geneva', 'CSI5*', 'Show Jumping', '2024-12-12', 'Geneva', 'Switzerland'),
  ('c06', 'Lyon Masters', 'CSI5*', 'Show Jumping', '2024-11-01', 'Lyon', 'France'),
  ('c07', 'CSIO5* Rotterdam', 'CSI5*', 'Show Jumping', '2025-06-19', 'Rotterdam', 'Netherlands'),
  ('c08', 'CSI4* Kronenberg', 'CSI4*', 'Show Jumping', '2025-04-10', 'Kronenberg', 'Netherlands'),
  ('c09', 'CSI3* Linkoping', 'CSI3*', 'Show Jumping', '2025-05-15', 'Linkoping', 'Sweden'),
  ('c10', 'CSI2* Wiesbaden Spring', 'CSI2*', 'Show Jumping', '2025-04-25', 'Wiesbaden', 'Germany'),
  ('c11', 'CDI5* Gothenburg', 'CDI5*', 'Dressage', '2025-02-26', 'Gothenburg', 'Sweden'),
  ('c12', 'CDI5* Aachen CDIO', 'CDIO5*', 'Dressage', '2025-07-01', 'Aachen', 'Germany'),
  ('c13', 'CDI3* Falsterbo', 'CDI3*', 'Dressage', '2025-07-15', 'Falsterbo', 'Sweden'),
  ('c14', 'CCI4*-L Burghley', 'CCI4*', 'Eventing', '2024-09-05', 'Stamford', 'Great Britain'),
  ('c15', 'CCI4*-L Badminton', 'CCI4*', 'Eventing', '2025-05-07', 'Badminton', 'Great Britain');

-- Results: Show Jumping & Eventing (placement, faults, time — no score)
insert into results (horse_id, rider_id, competition_id, placement, faults, time, class_name) values
  -- CHIO Aachen 2025
  ('h02', 'r01', 'c01', 1, 0, 62.45, 'Grand Prix'),
  ('h07', 'r12', 'c01', 2, 0, 63.12, 'Grand Prix'),
  ('h04', 'r11', 'c01', 3, 0, 63.88, 'Grand Prix'),
  ('h08', 'r05', 'c01', 4, 4, 61.20, 'Grand Prix'),
  ('h06', 'r09', 'c01', 5, 4, 62.30, 'Grand Prix'),
  ('h01', 'r02', 'c01', 6, 4, 62.55, 'Grand Prix'),
  ('h14', 'r06', 'c01', 7, 8, 61.80, 'Grand Prix'),
  ('h13', 'r04', 'c01', 8, 8, 62.40, 'Grand Prix'),
  -- Gothenburg 2025
  ('h01', 'r02', 'c02', 1, 0, 58.33, 'Grand Prix'),
  ('h02', 'r01', 'c02', 2, 0, 59.14, 'Grand Prix'),
  ('h11', 'r03', 'c02', 3, 0, 59.87, 'Grand Prix'),
  ('h09', 'r03', 'c02', 4, 4, 57.90, 'Grand Prix'),
  ('h16', 'r07', 'c02', 5, 4, 58.44, 'Grand Prix'),
  ('h17', 'r05', 'c02', 6, 4, 58.77, 'Grand Prix'),
  ('h18', 'r06', 'c02', 7, 8, 57.20, 'Grand Prix'),
  ('h15', 'r09', 'c02', 8, 8, 57.55, 'Grand Prix'),
  ('h48', 'r02', 'c02', 9, 8, 57.88, 'Grand Prix'),
  -- Brussels 2024
  ('h07', 'r12', 'c03', 1, 0, 55.22, 'Grand Prix'),
  ('h10', 'r10', 'c03', 2, 0, 56.01, 'Grand Prix'),
  ('h06', 'r09', 'c03', 3, 0, 56.44, 'Grand Prix'),
  ('h08', 'r05', 'c03', 4, 4, 54.80, 'Grand Prix'),
  ('h05', 'r04', 'c03', 5, 4, 55.11, 'Grand Prix'),
  ('h41', 'r12', 'c03', 6, 4, 55.78, 'Grand Prix'),
  ('h44', 'r10', 'c03', 7, 4, 56.02, 'Grand Prix'),
  ('h50', 'r09', 'c03', 8, 8, 54.33, 'Grand Prix'),
  -- Amsterdam 2025
  ('h04', 'r11', 'c04', 1, 0, 60.11, 'Grand Prix'),
  ('h16', 'r07', 'c04', 2, 0, 60.88, 'Grand Prix'),
  ('h01', 'r02', 'c04', 3, 0, 61.44, 'Grand Prix'),
  ('h14', 'r06', 'c04', 4, 4, 59.90, 'Grand Prix'),
  ('h19', 'r08', 'c04', 5, 4, 60.22, 'Grand Prix'),
  ('h23', 'r08', 'c04', 6, 4, 60.55, 'Grand Prix'),
  ('h24', 'r06', 'c04', 7, 8, 59.44, 'Grand Prix'),
  ('h47', 'r01', 'c04', 8, 8, 59.77, 'Grand Prix'),
  -- Geneva 2024
  ('h02', 'r01', 'c05', 1, 0, 63.00, 'Grand Prix'),
  ('h07', 'r12', 'c05', 2, 0, 63.55, 'Grand Prix'),
  ('h06', 'r09', 'c05', 3, 4, 62.40, 'Grand Prix'),
  ('h08', 'r05', 'c05', 4, 4, 62.80, 'Grand Prix'),
  ('h21', 'r13', 'c05', 5, 4, 63.10, 'Grand Prix'),
  ('h20', 'r14', 'c05', 6, 4, 63.44, 'Grand Prix'),
  ('h22', 'r04', 'c05', 7, 8, 61.55, 'Grand Prix'),
  ('h46', 'r08', 'c05', 8, 8, 61.88, 'Grand Prix'),
  -- Lyon 2024
  ('h10', 'r10', 'c06', 1, 0, 57.33, 'Grand Prix'),
  ('h04', 'r11', 'c06', 2, 0, 57.88, 'Grand Prix'),
  ('h15', 'r09', 'c06', 3, 0, 58.22, 'Grand Prix'),
  ('h25', 'r08', 'c06', 4, 4, 56.90, 'Grand Prix'),
  ('h43', 'r05', 'c06', 5, 4, 57.11, 'Grand Prix'),
  ('h45', 'r04', 'c06', 6, 4, 57.44, 'Grand Prix'),
  ('h42', 'r03', 'c06', 7, 8, 56.22, 'Grand Prix'),
  -- Rotterdam 2025
  ('h01', 'r02', 'c07', 1, 0, 59.88, 'Nations Cup'),
  ('h11', 'r03', 'c07', 2, 0, 60.33, 'Nations Cup'),
  ('h02', 'r01', 'c07', 3, 0, 60.77, 'Nations Cup'),
  ('h12', 'r01', 'c07', 4, 4, 58.99, 'Nations Cup'),
  ('h09', 'r03', 'c07', 5, 4, 59.22, 'Nations Cup'),
  ('h48', 'r02', 'c07', 6, 4, 59.55, 'Nations Cup'),
  ('h03', 'r02', 'c07', 7, 0, 61.10, 'Grand Prix'),
  ('h47', 'r01', 'c07', 8, 4, 60.40, 'Grand Prix'),
  -- CSI4* Kronenberg 2025
  ('h16', 'r07', 'c08', 1, 0, 65.22, 'Grand Prix'),
  ('h14', 'r06', 'c08', 2, 0, 65.88, 'Grand Prix'),
  ('h18', 'r06', 'c08', 3, 0, 66.11, 'Grand Prix'),
  ('h49', 'r06', 'c08', 4, 4, 64.77, 'Grand Prix'),
  ('h24', 'r06', 'c08', 5, 4, 65.00, 'Grand Prix'),
  ('h43', 'r05', 'c08', 6, 4, 65.44, 'Grand Prix'),
  ('h17', 'r05', 'c08', 7, 8, 64.22, 'Grand Prix'),
  -- CSI3* Linkoping 2025
  ('h12', 'r01', 'c09', 1, 0, 68.44, 'Grand Prix'),
  ('h09', 'r03', 'c09', 2, 0, 68.99, 'Grand Prix'),
  ('h11', 'r03', 'c09', 3, 4, 67.80, 'Grand Prix'),
  ('h42', 'r03', 'c09', 4, 4, 68.11, 'Grand Prix'),
  ('h47', 'r01', 'c09', 5, 4, 68.55, 'Grand Prix'),
  ('h48', 'r02', 'c09', 6, 4, 68.88, 'Grand Prix'),
  ('h03', 'r02', 'c09', 7, 0, 70.00, '1.45m'),
  -- CSI2* Wiesbaden 2025
  ('h45', 'r04', 'c10', 1, 0, 72.33, 'Grand Prix'),
  ('h22', 'r04', 'c10', 2, 0, 72.88, 'Grand Prix'),
  ('h05', 'r04', 'c10', 3, 4, 71.55, 'Grand Prix'),
  ('h43', 'r05', 'c10', 4, 4, 71.88, 'Grand Prix'),
  ('h13', 'r04', 'c10', 5, 4, 72.11, 'Grand Prix'),
  ('h40', 'r06', 'c10', 6, 8, 70.99, 'Grand Prix'),
  -- CCI4* Burghley 2024
  ('h36', 'r20', 'c14', 1, 0, 490.80, 'CCI4*-L'),
  ('h37', 'r20', 'c14', 2, 0, 495.20, 'CCI4*-L'),
  ('h38', 'r13', 'c14', 3, 4, 488.60, 'CCI4*-L'),
  ('h39', 'r14', 'c14', 4, 4, 492.10, 'CCI4*-L'),
  ('h40', 'r06', 'c14', 5, 8, 486.40, 'CCI4*-L'),
  -- CCI4* Badminton 2025
  ('h37', 'r20', 'c15', 1, 0, 488.30, 'CCI4*-L'),
  ('h36', 'r20', 'c15', 2, 4, 492.55, 'CCI4*-L'),
  ('h38', 'r13', 'c15', 3, 4, 494.80, 'CCI4*-L'),
  ('h39', 'r14', 'c15', 4, 8, 491.20, 'CCI4*-L'),
  ('h40', 'r06', 'c15', 5, 12, 489.00, 'CCI4*-L');

-- ============================================================
-- PEDER FREDRICSON — 7 Real FEI Horses (2025-2026 season)
-- ============================================================

-- Real competitions from FEI screenshots
insert into competitions (id, name, level, discipline, date, location, country) values
  ('c16', 'Global Champions Tour Gassin', 'CSI5*', 'Show Jumping', '2025-04-25', 'Gassin-St Tropez', 'France'),
  ('c17', 'CHI Geneva 2025', 'CSI5*', 'Show Jumping', '2025-12-11', 'Geneva', 'Switzerland'),
  ('c18', 'Gothenburg Horse Show 2026', 'CSI5*', 'Show Jumping', '2026-02-25', 'Gothenburg', 'Sweden'),
  ('c19', 'CSI5* Praha', 'CSI5*', 'Show Jumping', '2025-09-04', 'Praha', 'Czech Republic'),
  ('c20', 'Stuttgart German Masters', 'CSI5*', 'Show Jumping', '2025-11-13', 'Stuttgart', 'Germany'),
  ('c21', 'CSI4* Rabat', 'CSI4*', 'Show Jumping', '2025-05-22', 'Rabat', 'Morocco'),
  ('c22', 'CSI5* Wien-Schönbrunn', 'CSI5*', 'Show Jumping', '2025-06-27', 'Vienna', 'Austria'),
  ('c23', 'CSI4* Riesenbeck', 'CSI4*', 'Show Jumping', '2025-08-14', 'Riesenbeck', 'Germany'),
  ('c24', 'Global Champions Tour London', 'CSI5*', 'Show Jumping', '2025-05-15', 'London', 'Great Britain'),
  ('c25', 'CSI4* Falsterbo', 'CSI4*', 'Show Jumping', '2025-07-17', 'Falsterbo', 'Sweden'),
  ('c26', 'CSI5* La Baule', 'CSI5*', 'Show Jumping', '2025-05-08', 'La Baule', 'France'),
  ('c27', 'CSI4* Hamburg', 'CSI4*', 'Show Jumping', '2025-05-01', 'Hamburg', 'Germany'),
  ('c28', 'CSI4* Windsor', 'CSI4*', 'Show Jumping', '2025-05-29', 'Windsor', 'Great Britain');

-- 7 real horses (h51-h57) with FEI IDs
insert into horses (id, name, breed, studbook_number, date_of_birth, gender, sire, dam, country, owner, current_rider_id) values
  ('h51', 'Alcapone des Carmille', 'SF', '105CS11', '2010-03-14', 'Stallion', 'Balou du Rouet', 'Quiteria des Carmille', 'France', 'Stable Fredricson AB', 'r01'),
  ('h52', 'SV Vroom de la Pomme Z', 'BWBS', '106ME48', '2012-07-08', 'Stallion', 'Vigo d Arsouilles', 'Nabine de la Pomme', 'Belgium', 'Stable Fredricson AB', 'r01'),
  ('h53', 'Qurious HS', 'SWB', '108CT78', '2016-04-21', 'Mare', 'Quite Easy', 'Lavinia HS', 'Sweden', 'Stable Fredricson AB', 'r01'),
  ('h54', 'Code Black', 'KWPN', '109AO35', '2017-05-09', 'Stallion', 'Comme Il Faut', 'Rafaella Z', 'Netherlands', 'Stable Fredricson AB', 'r01'),
  ('h55', 'Balou Blue', 'Holsteiner', '106HN39', '2013-02-17', 'Gelding', 'Balou du Rouet', 'Blue Pleasure', 'Germany', 'Stable Fredricson AB', 'r01'),
  ('h56', 'Colonello', 'Hanoverian', '107EI75', '2014-06-03', 'Stallion', 'Colman', 'Felicitas', 'Germany', 'Stable Fredricson AB', 'r01'),
  ('h57', 'Iggy', 'SWB', '108XK81', '2016-08-12', 'Gelding', 'Irco Mena', 'Goldy', 'Sweden', 'Stable Fredricson AB', 'r01');

-- Real results from FEI data — Peder Fredricson
insert into results (horse_id, rider_id, competition_id, placement, faults, time, class_name) values
  -- Alcapone des Carmille (h51) — main 5* horse
  ('h51', 'r01', 'c16', 3,  0,  61.44, 'Grand Prix'),
  ('h51', 'r01', 'c16', 7,  4,  59.80, '1.50m Special'),
  ('h51', 'r01', 'c24', 2,  0,  63.12, 'Grand Prix'),
  ('h51', 'r01', 'c26', 1,  0,  60.88, 'Grand Prix'),
  ('h51', 'r01', 'c22', 4,  4,  62.30, 'Grand Prix'),
  ('h51', 'r01', 'c01', 5,  4,  61.90, 'Grand Prix'),
  ('h51', 'r01', 'c19', 1,  0,  64.55, 'Grand Prix'),
  ('h51', 'r01', 'c20', 2,  0,  66.11, 'Grand Prix'),
  ('h51', 'r01', 'c17', 3,  0,  63.77, 'Grand Prix'),

  -- SV Vroom de la Pomme Z (h52) — 4*/5* level
  ('h52', 'r01', 'c21', 1,  0,  67.22, 'Grand Prix'),
  ('h52', 'r01', 'c27', 2,  0,  65.44, 'Grand Prix'),
  ('h52', 'r01', 'c28', 1,  0,  68.88, 'Grand Prix'),
  ('h52', 'r01', 'c25', 3,  0,  69.33, 'Grand Prix'),
  ('h52', 'r01', 'c23', 4,  4,  66.90, 'Grand Prix'),
  ('h52', 'r01', 'c07', 2,  0,  60.22, 'Nations Cup'),
  ('h52', 'r01', 'c19', 6,  4,  63.80, '1.50m'),

  -- Qurious HS (h53) — rising 4* horse
  ('h53', 'r01', 'c25', 1,  0,  70.44, '1.45m'),
  ('h53', 'r01', 'c09', 2,  0,  69.11, 'Grand Prix'),
  ('h53', 'r01', 'c23', 3,  0,  71.88, '1.45m'),
  ('h53', 'r01', 'c08', 5,  4,  66.55, 'Grand Prix'),
  ('h53', 'r01', 'c18', 4,  0,  60.22, '1.45m'),

  -- Code Black (h54) — young 3*/4* horse
  ('h54', 'r01', 'c09', 1,  0,  68.77, 'Grand Prix'),
  ('h54', 'r01', 'c10', 2,  0,  72.00, 'Grand Prix'),
  ('h54', 'r01', 'c08', 3,  0,  67.33, '1.45m'),
  ('h54', 'r01', 'c25', 7,  4,  70.11, '1.45m'),
  ('h54', 'r01', 'c18', 3,  0,  61.44, '1.45m'),

  -- Balou Blue (h55) — 4* level
  ('h55', 'r01', 'c27', 1,  0,  65.88, 'Grand Prix'),
  ('h55', 'r01', 'c23', 2,  0,  70.22, 'Grand Prix'),
  ('h55', 'r01', 'c21', 3,  0,  67.55, 'Grand Prix'),
  ('h55', 'r01', 'c08', 2,  0,  66.44, 'Grand Prix'),
  ('h55', 'r01', 'c28', 4,  4,  69.00, 'Grand Prix'),
  ('h55', 'r01', 'c25', 2,  0,  69.88, 'Grand Prix'),

  -- Colonello (h56) — 4*/5* capable
  ('h56', 'r01', 'c22', 2,  0,  63.55, 'Grand Prix'),
  ('h56', 'r01', 'c07', 1,  0,  59.33, 'Grand Prix'),
  ('h56', 'r01', 'c26', 3,  4,  61.22, 'Grand Prix'),
  ('h56', 'r01', 'c20', 4,  4,  65.77, 'Grand Prix'),
  ('h56', 'r01', 'c17', 5,  4,  64.00, 'Grand Prix'),
  ('h56', 'r01', 'c19', 3,  0,  64.88, 'Grand Prix'),
  ('h56', 'r01', 'c18', 2,  0,  59.77, 'Grand Prix'),

  -- Iggy (h57) — young 3*/4* horse
  ('h57', 'r01', 'c09', 3,  0,  69.55, 'Grand Prix'),
  ('h57', 'r01', 'c10', 1,  0,  71.88, 'Grand Prix'),
  ('h57', 'r01', 'c25', 4,  4,  70.77, '1.45m'),
  ('h57', 'r01', 'c23', 5,  4,  71.22, '1.45m'),
  ('h57', 'r01', 'c08', 4,  4,  67.11, '1.45m');

-- Results: Dressage (includes score column)
insert into results (horse_id, rider_id, competition_id, placement, faults, time, class_name, score) values
  -- CDI5* Gothenburg 2025
  ('h27', 'r17', 'c11', 1, null, null, 'Grand Prix Special', 88.431),
  ('h26', 'r15', 'c11', 2, null, null, 'Grand Prix Special', 87.115),
  ('h28', 'r15', 'c11', 3, null, null, 'Grand Prix', 85.900),
  ('h31', 'r16', 'c11', 4, null, null, 'Grand Prix Special', 84.720),
  ('h32', 'r17', 'c11', 5, null, null, 'Grand Prix', 83.445),
  ('h33', 'r18', 'c11', 6, null, null, 'Grand Prix', 82.110),
  ('h35', 'r17', 'c11', 7, null, null, 'Grand Prix', 81.880),
  -- CDIO5* Aachen 2025
  ('h27', 'r17', 'c12', 1, null, null, 'Grand Prix Freestyle', 90.111),
  ('h26', 'r15', 'c12', 2, null, null, 'Grand Prix Freestyle', 88.445),
  ('h29', 'r16', 'c12', 3, null, null, 'Grand Prix Special', 87.220),
  ('h31', 'r16', 'c12', 4, null, null, 'Grand Prix Freestyle', 86.990),
  ('h28', 'r15', 'c12', 5, null, null, 'Grand Prix', 85.334),
  ('h34', 'r18', 'c12', 6, null, null, 'Grand Prix', 84.110),
  -- CDI3* Falsterbo 2025
  ('h30', 'r15', 'c13', 1, null, null, 'Grand Prix Special', 82.445),
  ('h33', 'r18', 'c13', 2, null, null, 'Grand Prix', 81.220),
  ('h34', 'r18', 'c13', 3, null, null, 'Grand Prix Freestyle', 80.990),
  ('h35', 'r17', 'c13', 4, null, null, 'Grand Prix', 79.880);
