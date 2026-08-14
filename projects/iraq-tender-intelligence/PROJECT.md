# Iraq Tender Intelligence

## Objective
Build a B2B subscription platform that filters Iraqi tenders for companies and provides actionable tender intelligence.

## Revenue target
Initial target: >= $1,000/month.
Target mix: 11 Business customers at $99/month = $1,089 MRR.

## Positioning
Not a generic tender directory. The product is a tender-intelligence layer:
- collect public/authorized tender notices
- normalize and classify tenders
- match tenders to each company's profile
- score relevance
- show deadlines, requirements and official source
- send alerts

## Initial vertical
Oil & Gas services, industrial equipment, engineering and supplies in Iraq.

## MVP
1. Public landing page
2. Tender feed
3. Tender detail page
4. Company profile/preferences
5. Match score
6. Saved tenders
7. Email alerts
8. Pricing: Free / Pro $49 / Business $99 / Enterprise $199+
9. Admin ingestion and review queue
10. Source attribution and official-link preservation

## Validation gate
Do not build broad functionality until 3 paying pilot customers are obtained. The first commercial milestone is 3 paid customers; the scale milestone is 11 Business customers.

## Data integrity
Never fabricate tender data. Every tender record must retain source URL, publication date, closing date when available, source organization, and ingestion timestamp. Automated extraction must be reviewable.

## Architecture direction
Prefer a low-cost web stack with a relational database, scheduled ingestion workers, full-text search, transactional email, and an LLM-assisted classification/matching layer. Keep source connectors modular.

## Status
Project initialized. Next: implement MVP skeleton and source connector interfaces, then validate with real customers before expanding.
