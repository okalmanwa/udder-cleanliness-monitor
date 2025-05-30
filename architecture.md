# architecture.md

```markdown
# Digital Udder Monitoring System

## Core Data Structure

### Farm Entity
```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL
);
CREATE TABLE udders (
  id UUID PRIMARY KEY,
  farm_id UUID REFERENCES farms(id),
  identifier VARCHAR(10) NOT NULL, -- Format: "FarmA-U1"
  position VARCHAR(20), -- LF, RF, LR, RR
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farm_id, identifier)
);
CREATE TABLE examinations (
  id UUID PRIMARY KEY,
  udder_id UUID REFERENCES udders(id),
  score INTEGER CHECK (score BETWEEN 1 AND 4),
  exam_timestamp TIMESTAMPTZ DEFAULT NOW(),
  images TEXT[]
);
Frontend Components
Farm Selector

components/FarmSelector.tsx

Fetches farm list from /api/farms

Stores selection in Zustand

Udder Dashboard

components/UdderDashboard.tsx

Shows grid of udders for selected farm

Color codes by latest score

Examination Form

components/ExaminationForm.tsx

Records score + images per udder

Posts to /api/examinations

API Routes
Endpoint	Method	Description
/api/farms	GET	List all farms
/api/farms/[id]/udders	GET	Get udders with latest scores
/api/examinations	POST	Submit new examination
Visualization System
Farm Summary View

Aggregate scores across all udders

Time-series trend graph

Udder History

Individual udder score timeline

Image gallery per examination