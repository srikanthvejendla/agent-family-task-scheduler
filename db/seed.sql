-- Seed system task templates
INSERT INTO task_templates (title, description, category, default_point_value, default_estimate_minutes, suggested_recurrence, household_id)
VALUES
  ('Do dishes', 'Wash, dry, and put away all dishes', 'chores', 15, 20, 'FREQ=DAILY', NULL),
  ('Clean room', 'Tidy up bedroom, make bed, put away clothes', 'chores', 20, 30, 'FREQ=WEEKLY;BYDAY=SA', NULL),
  ('Vacuum floors', 'Vacuum all carpeted areas', 'chores', 15, 25, 'FREQ=WEEKLY;BYDAY=SA', NULL),
  ('Feed pets', 'Feed and give water to pets', 'chores', 5, 5, 'FREQ=DAILY', NULL),
  ('Homework', 'Complete daily homework assignments', 'homework', 25, 60, 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', NULL),
  ('Practice instrument', 'Practice musical instrument', 'homework', 20, 30, 'FREQ=WEEKLY;BYDAY=MO,WE,FR', NULL),
  ('Water plants', 'Water indoor and outdoor plants', 'chores', 10, 15, 'FREQ=WEEKLY;BYDAY=WE,SA', NULL),
  ('Fold laundry', 'Fold and put away clean laundry', 'chores', 15, 20, 'FREQ=WEEKLY;BYDAY=SU', NULL),
  ('Set dinner table', 'Set table before dinner', 'chores', 5, 5, 'FREQ=DAILY', NULL)
ON CONFLICT DO NOTHING;
