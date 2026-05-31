DELETE FROM task_templates;
INSERT INTO task_templates (id, title, description, category, default_point_value, default_estimate_minutes, suggested_recurrence, household_id)
VALUES
('tpl-1', 'Take out trash', 'Empty all trash cans', 'chores', 10, 10, 'FREQ=WEEKLY;BYDAY=MO', NULL),
('tpl-2', 'Do dishes', 'Wash and dry dishes', 'chores', 15, 20, 'FREQ=DAILY', NULL),
('tpl-3', 'Clean room', 'Tidy bedroom', 'chores', 20, 30, 'FREQ=WEEKLY;BYDAY=SA', NULL),
('tpl-4', 'Vacuum floors', 'Vacuum carpets', 'chores', 15, 25, 'FREQ=WEEKLY;BYDAY=SA', NULL),
('tpl-5', 'Feed pets', 'Feed and water pets', 'chores', 5, 5, 'FREQ=DAILY', NULL),
('tpl-6', 'Homework', 'Complete homework', 'homework', 25, 60, 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', NULL),
('tpl-7', 'Practice instrument', 'Practice music', 'homework', 20, 30, 'FREQ=WEEKLY;BYDAY=MO,WE,FR', NULL),
('tpl-8', 'Water plants', 'Water plants', 'chores', 10, 15, 'FREQ=WEEKLY;BYDAY=WE,SA', NULL),
('tpl-9', 'Fold laundry', 'Fold laundry', 'chores', 15, 20, 'FREQ=WEEKLY;BYDAY=SU', NULL),
('tpl-10', 'Set table', 'Set dinner table', 'chores', 5, 5, 'FREQ=DAILY', NULL);
