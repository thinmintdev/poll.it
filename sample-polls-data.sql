-- SQL for resetting and populating polls and choices tables

-- 1. First delete all existing poll data (choices must be deleted first due to foreign key constraints)
DELETE FROM choices;
DELETE FROM polls;

-- 2. Reset the sequences if needed
ALTER SEQUENCE polls_id_seq RESTART WITH 1;
ALTER SEQUENCE choices_id_seq RESTART WITH 1;

-- 3. Insert sample polls with entertaining questions
INSERT INTO polls (question, category_id, user_id, visibility, created_at, updated_at, max_choices) 
VALUES
  ('What''s the most absurd conspiracy theory you''ve ever heard?', 
   (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 
   (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 
   'public', 
   NOW(), 
   NOW(), 
   1),
   
  ('If animals could talk, which species would be the rudest?', 
   (SELECT id FROM categories WHERE name = 'Animals' LIMIT 1), 
   (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 
   'public', 
   NOW(), 
   NOW(), 
   1),
   
  ('Which fictional character would make the worst roommate?', 
   (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 
   (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 
   'public', 
   NOW(), 
   NOW(), 
   1),
   
  ('What''s a completely useless talent you have?', 
   (SELECT id FROM categories WHERE name = 'Lifestyle' LIMIT 1), 
   (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 
   'public', 
   NOW(), 
   NOW(), 
   1),
   
  ('What would be the most inconvenient superpower?', 
   (SELECT id FROM categories WHERE name = 'Entertainment' LIMIT 1), 
   (SELECT id FROM profiles ORDER BY created_at LIMIT 1), 
   'public', 
   NOW(), 
   NOW(), 
   1);

-- 4. Add choices for each poll
-- For "What's the most absurd conspiracy theory you've ever heard?"
INSERT INTO choices (poll_id, text, created_at, updated_at)
VALUES
  (1, 'The Earth is flat', NOW(), NOW()),
  (1, 'Birds aren''t real, they''re government drones', NOW(), NOW()),
  (1, 'The moon landing was faked', NOW(), NOW()),
  (1, 'Lizard people run the government', NOW(), NOW()),
  (1, 'Finland doesn''t actually exist', NOW(), NOW());

-- For "If animals could talk, which species would be the rudest?"
INSERT INTO choices (poll_id, text, created_at, updated_at)
VALUES
  (2, 'Cats', NOW(), NOW()),
  (2, 'Geese', NOW(), NOW()),
  (2, 'Raccoons', NOW(), NOW()),
  (2, 'Honey Badgers', NOW(), NOW()),
  (2, 'Seagulls', NOW(), NOW());

-- For "Which fictional character would make the worst roommate?"
INSERT INTO choices (poll_id, text, created_at, updated_at)
VALUES
  (3, 'The Joker', NOW(), NOW()),
  (3, 'Sheldon Cooper', NOW(), NOW()),
  (3, 'Homer Simpson', NOW(), NOW()),
  (3, 'Gollum', NOW(), NOW()),
  (3, 'Hannibal Lecter', NOW(), NOW());

-- For "What's a completely useless talent you have?"
INSERT INTO choices (poll_id, text, created_at, updated_at)
VALUES
  (4, 'Ability to recite movie quotes at the perfect moment', NOW(), NOW()),
  (4, 'Can flip anything with my toes', NOW(), NOW()),
  (4, 'Knowing obscure trivia about everything', NOW(), NOW()),
  (4, 'Making sounds like a dolphin', NOW(), NOW()),
  (4, 'Perfectly mimicking accents and voices', NOW(), NOW());

-- For "What would be the most inconvenient superpower?"
INSERT INTO choices (poll_id, text, created_at, updated_at)
VALUES
  (5, 'Always telling the truth even when you don''t want to', NOW(), NOW()),
  (5, 'Floating slightly above the ground but unable to control it', NOW(), NOW()),
  (5, 'Turning invisible but only when no one is looking', NOW(), NOW()),
  (5, 'Mind reading but you can''t turn it off', NOW(), NOW()),
  (5, 'Super strength but only in your pinky finger', NOW(), NOW());
