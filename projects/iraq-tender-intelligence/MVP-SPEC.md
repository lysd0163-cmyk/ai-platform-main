# MVP Specification — Iraq Tender Intelligence

## User journey
1. Visitor lands on the site.
2. Selects sector and receives a limited sample of relevant opportunities.
3. Creates a company profile: sectors, keywords, locations, minimum project size.
4. System produces a relevance score for each tender.
5. User saves a tender or enables alerts.
6. Paid plan unlocks full alerts, advanced filters and company-level intelligence.

## Tender schema
- id
- title
- organization
- sector
- location
- tender_number
- publication_date
- closing_date
- description
- requirements
- documents
- source_url
- source_name
- ingested_at
- last_verified_at
- status
- confidence

## Company profile schema
- company_id
- sectors
- keywords
- locations
- capabilities
- minimum_value
- excluded_keywords
- alert_frequency

## Scoring
Start deterministic and auditable:
- sector match: 30
- keyword/capability match: 30
- location match: 15
- deadline suitability: 10
- requirement fit: 15

AI may assist extraction and semantic matching, but every score must expose reasons and source evidence.

## Plans
Free: limited discovery.
Pro: $49/month.
Business: $99/month.
Enterprise: $199+/month.

## Security
- tenant isolation
- authenticated dashboard
- server-side authorization
- rate limits
- audit log for admin changes
- no sensitive customer documents in the MVP unless explicitly required

## Acceptance criteria
- No tender appears without a source URL.
- No generated field is presented as official fact unless verified/extracted from source.
- Closing dates are timezone-aware.
- User can delete saved tenders and disable alerts.
- Payment entitlement is checked server-side.
- Admin can mark a tender verified, stale or rejected.
