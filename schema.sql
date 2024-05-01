DROP TABLE IF EXISTS admins; CREATE TABLE admins (
	[id] INTEGER PRIMARY KEY
	, [fullname] TEXT NOT NULL
	, [username] TEXT NOT NULL
	, [email] TEXT UNIQUE
	, [hash] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS assessors; CREATE TABLE assessors (
	[id] INTEGER PRIMARY KEY
	, [fullname] TEXT NOT NULL
	, [username] TEXT NOT NULL
	, [email] TEXT UNIQUE
	, [hash] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS organizations; CREATE TABLE organizations (
	[id] INTEGER PRIMARY KEY
	, [name] TEXT NOT NULL
	, [address] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS modules; CREATE TABLE modules (
	[id] TEXT PRIMARY KEY
	, [category] TEXT CHECK (category IN('SELF', 'CASE', 'FACE', 'DISC')) NOT NULL
	, [title] TEXT NOT NULL
	, [ascent] INTEGER CHECK (ascent IN(0, 1)) NOT NULL
	, [version] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS slots; CREATE TABLE slots (
	[id] INTEGER PRIMARY KEY
	, [modules] INTEGER CHECK(modules IN(1,2,3,4)) NOT NULL
	, [mode] TEXT NOT NULL
	, [slot1] TEXT CHECK (slot1 IN('SELF', 'CASE', 'FACE', 'DISC'))
	, [slot2] TEXT CHECK (slot2 IN('SELF', 'CASE', 'FACE', 'DISC'))
	, [slot3] TEXT CHECK (slot3 IN('SELF', 'CASE', 'FACE', 'DISC'))
	, [slot4] TEXT CHECK (slot4 IN('SELF', 'CASE', 'FACE', 'DISC'))
	, [self_pos] INTEGER DEFAULT 0
	, [case_pos] INTEGER DEFAULT 0
	, [face_pos] INTEGER DEFAULT 0
	, [disc_pos] INTEGER DEFAULT 0
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS batches; CREATE TABLE batches (
	[id] INTEGER PRIMARY KEY
	, [token] TEXT NOT NULL UNIQUE
	, [org_id] INTEGER NOT NULL
	, [date] TEXT
	, [type] TEXT CHECK(type IN('ASCENT', 'CUSTOM')) NOT NULL DEFAULT 'ASCENT'
	, [mode] TEXT
	, [split] INTEGER CHECK(split IN(1, 2, 3, 4)) NOT NULL DEFAULT 1
	, [title] TEXT NOT NULL DEFAULT 'Batch'
	, [status] INTEGER NOT NULL DEFAULT 0 -- 1 (deployed) 2 (maintenance) 3 (closed) 9 (archived)
	, [regrouping] INTEGER NOT NULL DEFAULT 0 -- 1 needs regrouping
	, [time1] TEXT
	, [time2] TEXT
	, [time3] TEXT
	, [time4] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS batch_modules; CREATE TABLE batch_modules (
	[batch_id] INTEGER NOT NULL
	, [category] TEXT NOT NULL -- 'SELF', 'CASE', 'FACE', 'DISC'
	, [module_id] TEXT NOT NULL
	, [priority] INTEGER -- used for module ordering in custom assessment
	, PRIMARY KEY (batch_id, module_id)
);

DROP TABLE IF EXISTS persons; CREATE TABLE persons (
	[id] TEXT PRIMARY KEY
	, [org_id] INTEGER NOT NULL
	, [batch_id] INTEGER NOT NULL
	, [fullname] TEXT NOT NULL
	, [username] TEXT NOT NULL
	, [email] TEXT
	, [hash] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
	, UNIQUE(batch_id, email)
);

DROP TABLE IF EXISTS groups; CREATE TABLE groups (
	[id] TEXT PRIMARY KEY
	, [batch_id] INTEGER NOT NULL
	, [ass_id] INTEGER
	, [name] TEXT NOT NULL
	, [slot1] TEXT
	, [slot2] TEXT
	, [slot3] TEXT
	, [slot4] TEXT
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
);

DROP TABLE IF EXISTS groupings; CREATE TABLE groupings (
	[batch_id] INTEGER NOT NULL
	, [group_id] TEXT NOT NULL
	, [person_id] TEXT NOT NULL
	, [face_ass_id] INTEGER
	, [case_ass_id] INTEGER
	, [created] TEXT NOT NULL DEFAULT (datetime('now')||'Z')
	, [updated] TEXT
	, PRIMARY KEY (batch_id, person_id)
);

-- triggers

CREATE TRIGGER update_admins AFTER UPDATE ON admins
	BEGIN UPDATE admins SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_assessors AFTER UPDATE ON assessors
	BEGIN UPDATE assessors SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_organizations AFTER UPDATE ON organizations
	BEGIN UPDATE organizations SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_modules AFTER UPDATE ON modules
	BEGIN UPDATE modules SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_slots AFTER UPDATE ON slots
	BEGIN UPDATE slots SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_persons AFTER UPDATE ON persons
	BEGIN UPDATE persons SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_batches AFTER UPDATE ON batches
	BEGIN UPDATE batches SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

CREATE TRIGGER update_groups AFTER UPDATE ON groups
	BEGIN UPDATE groups SET updated = datetime('now')||'Z' WHERE id = NEW.id;
END;

-- CREATE TRIGGER update_groupings AFTER UPDATE ON groupings
-- 	BEGIN UPDATE groupings SET updated = datetime('now')||'Z' WHERE id = NEW.id;
-- END;

-- views

DROP VIEW IF EXISTS v_batches; CREATE VIEW v_batches AS SELECT
	b.*
	, o.name org_name
	, (SELECT COUNT(*) from persons WHERE batch_id=b.id) persons
	, (SELECT COUNT(*) from batch_modules WHERE batch_id=b.id) modules
	, (SELECT id FROM batches WHERE id < b.id ORDER BY id DESC LIMIT 1) prev_id
	, (SELECT id FROM batches WHERE id > b.id LIMIT 1) next_id
	FROM batches b
	LEFT JOIN organizations o ON b.org_id=o.id;

DROP VIEW IF EXISTS v_organizations; CREATE VIEW v_organizations AS SELECT
	o.*
	, (SELECT COUNT(*) FROM batches WHERE org_id=o.id) batches
	, (SELECT COUNT(*) FROM persons WHERE org_id=o.id) persons
	, (SELECT MAX(date) FROM batches WHERE org_id=o.id) last_batch_date
	, (SELECT id FROM organizations WHERE id < o.id ORDER BY id DESC LIMIT 1) prev_id
	, (SELECT id FROM organizations WHERE id > o.id LIMIT 1) next_id
	FROM organizations o;

DROP VIEW IF EXISTS v_batch_modules; CREATE VIEW v_batch_modules AS SELECT
	b.*, m.title FROM batch_modules b LEFT JOIN modules m ON b.module_id=m.id;

DROP VIEW IF EXISTS v_groups; CREATE VIEW v_groups AS SELECT
	g.*
	, a.fullname disc_assessor_name
	, (SELECT COUNT(*) FROM groupings WHERE group_id=g.id) members
	FROM groups g
	LEFT JOIN assessors a ON g.ass_id=a.id;

DROP VIEW IF EXISTS v_persons; CREATE VIEW v_persons AS SELECT
  p.*
	, o.name org_name
  , gg.group_id, gr.name group_name
  , gr.ass_id, a3.fullname disc_assessor_name
  , gg.face_ass_id, a1.fullname face_assessor_name
  , gg.case_ass_id, a2.fullname case_assessor_name
  FROM persons p
  LEFT JOIN organizations o ON p.org_id=o.id
  LEFT JOIN groupings gg ON p.id=gg.person_id
  LEFT JOIN groups gr ON gg.group_id=gr.id
  LEFT JOIN assessors a1 ON gg.face_ass_id=a1.id
  LEFT JOIN assessors a2 ON gg.case_ass_id=a2.id
  LEFT JOIN assessors a3 ON gr.ass_id=a3.id;

DROP VIEW IF EXISTS v_allocs; CREATE VIEW v_allocs AS SELECT
	batch_id
	, (SELECT count(*) FROM groups WHERE slot1 LIKE 'DISC:%' AND batch_id=g.batch_id) AS disc_slot1
	, (SELECT count(*) FROM groups WHERE slot2 LIKE 'DISC:%' AND batch_id=g.batch_id) AS disc_slot2
	, (SELECT count(*) FROM groups WHERE slot3 LIKE 'DISC:%' AND batch_id=g.batch_id) AS disc_slot3
	, (SELECT count(*) FROM groups WHERE slot4 LIKE 'DISC:%' AND batch_id=g.batch_id) AS disc_slot4
	, (SELECT count(*) FROM groups WHERE slot1 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot1
	, (SELECT count(*) FROM groups WHERE slot2 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot2
	, (SELECT count(*) FROM groups WHERE slot3 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot3
	, (SELECT count(*) FROM groups WHERE slot4 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot4
	, (SELECT sum(members) FROM v_groups WHERE slot1 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot1_size
	, (SELECT sum(members) FROM v_groups WHERE slot2 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot2_size
	, (SELECT sum(members) FROM v_groups WHERE slot3 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot3_size
	, (SELECT sum(members) FROM v_groups WHERE slot4 LIKE 'FACE:%' AND batch_id=g.batch_id) AS face_slot4_size
	, (SELECT count (DISTINCT slot1||slot2||slot3||slot4) FROM groups WHERE batch_id=g.batch_id) AS permutation
	FROM groups g GROUP BY batch_id;





DROP TABLE IF EXISTS batch_assessors; CREATE TABLE batch_assessors (
  [batch_id] INTEGER NOT NULL,
  [ass_id] INTEGER NOT NULL,
  [type] TEXT CHECK(type IN('face', 'disc', 'case')) NOT NULL,
	[slot1] INTEGER CHECK(slot1 IN(0, 1)) NOT NULL DEFAULT 1,
	[slot2] INTEGER CHECK(slot2 IN(0, 1)) NOT NULL DEFAULT 1,
	[slot3] INTEGER CHECK(slot3 IN(0, 1)) NOT NULL DEFAULT 1,
	[slot4] INTEGER CHECK(slot4 IN(0, 1)) NOT NULL DEFAULT 1,
  PRIMARY KEY (batch_id, ass_id)
);

DROP VIEW IF EXISTS v_batch_assessors; CREATE VIEW v_batch_assessors AS SELECT
	ba.*,
	fullname, username, email
	FROM batch_assessors ba
	LEFT JOIN assessors a ON ba.ass_id=a.id;