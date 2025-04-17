import { NextResponse } from 'next/server';

// Sample text for the demo
const SAMPLE_TEXT = `# MongoDB Corporate Policies Handbook

## Time Off and Leave Policies

### Paid Time Off (PTO)
MongoDB offers a flexible PTO policy for all full-time employees. Key points:
- Unlimited PTO for exempt employees with manager approval
- PTO must be requested at least 2 weeks in advance for absences longer than 3 days
- Minimum 2 weeks PTO recommended annually for work-life balance
- No carryover or payout of PTO due to unlimited policy
- Track all PTO in Workday system

### Sick Leave
- 10 paid sick days per year for all employees
- Sick leave accrues at 0.83 days per month
- Unused sick leave carries over up to 15 days maximum
- Doctor's note required for absences longer than 3 consecutive days
- Can be used for personal illness or caring for immediate family members

### Parental Leave
- 20 weeks paid parental leave for primary caregivers
- 10 weeks paid parental leave for secondary caregivers
- Must be taken within 12 months of birth/adoption
- Can be taken continuously or in minimum 2-week increments
- Benefits continue during leave period

## Expense Policy

### Business Travel
- Book all travel through MongoDB's Concur system
- Economy class for flights under 6 hours
- Business class allowed for flights over 6 hours
- Hotels capped at $300/night in standard markets, $400/night in high-cost markets
- Per diem meal allowance: $75/day domestic, $100/day international
- Use corporate card when possible

### Office Expenses
- $500 annual allowance for office supplies
- $2,000 one-time allowance for home office setup
- Ergonomic equipment requires HR pre-approval
- Submit receipts within 30 days of purchase
- Personal cell phone reimbursement up to $50/month

### Client Entertainment
- Maximum $150 per person for client meals
- Alcohol limited to 2 drinks per person
- Must include business purpose and attendee list
- Senior manager approval required for expenses over $1,000
- No entertainment expenses for government officials

## Remote Work Policy

### Eligibility
- Available to all employees unless role requires on-site presence
- Must maintain core working hours of 10am-4pm local time
- Need reliable internet connection (minimum 50Mbps)
- Must have dedicated home office or workspace
- Required to be available for in-person meetings with 2 weeks notice

### Equipment
- Company provides: laptop, monitor, keyboard, mouse
- Additional equipment needs reviewed case-by-case
- All equipment must be returned upon employment end
- Report damaged equipment to IT within 24 hours
- Security requirements must be maintained

### Communication
- Must be available on Slack during working hours
- Use video for all team meetings when possible
- Required to attend quarterly in-person team meetings
- Update calendar and status to reflect availability
- Respond to messages within 4 business hours

## Professional Development

### Training Budget
- $5,000 annual learning and development allowance
- Can be used for: courses, conferences, certifications
- Must be relevant to current role or career path
- Requires manager approval
- Submit requests at least 30 days in advance

### Certification Bonuses
- MongoDB certifications: $500 bonus per certification
- Industry certifications: Up to $1,000 bonus
- Must maintain certification to retain bonus
- Maximum 3 certification bonuses per year
- Bonus paid in next payroll cycle after completion

## Health and Wellness Benefits

### Gym Reimbursement
- Up to $100/month for gym membership or fitness classes
- Must submit receipts quarterly
- Minimum 8 visits per month required
- Can be used for digital fitness subscriptions
- Annual fitness challenge participation bonus: $200

### Mental Health Support
- 12 free counseling sessions annually
- Confidential mental health app subscription
- Quarterly wellness workshops
- Mental health days don't count against sick leave
- 24/7 employee assistance program hotline`;

export async function GET() {
  return NextResponse.json({ text: SAMPLE_TEXT });
}