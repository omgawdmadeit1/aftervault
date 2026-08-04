export interface LetterTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
}

export const TEMPLATES: LetterTemplate[] = [
  {
    id: "t-bank",
    title: "Notify bank / credit union",
    category: "Financial",
    subject: "Notification of death and request for next steps — {{decedent}}",
    body: `To whom it may concern,

I am writing to notify you of the death of {{decedent}}, who held account(s) with your institution ({{account_details}}).

I am the designated contact / personal representative for practical matters. Please advise on:
1. Documentation required to freeze or transition the account
2. How automatic payments currently drawing from this account should be handled
3. The correct department and secure channel for further correspondence

I can be reached at {{contact_email}} or {{contact_phone}}.

Thank you for your guidance during this time.

Sincerely,
{{contact_name}}`,
  },
  {
    id: "t-ssa",
    title: "Social Security (SSA) notification",
    category: "Government",
    subject: "Report of death — {{decedent}}",
    body: `To the Social Security Administration,

I am reporting the death of {{decedent}}, SSN on file with your agency. Date of death: {{date_of_death}}.

Please confirm any benefits that need to stop and the process for any survivor benefits, if applicable.

Contact: {{contact_name}} · {{contact_email}} · {{contact_phone}}

This message is for operational notification only and is not legal advice.`,
  },
  {
    id: "t-subscription",
    title: "Cancel subscription",
    category: "Subscriptions",
    subject: "Account cancellation due to death of account holder — {{service}}",
    body: `Hello {{service}} support,

Please cancel the account held by {{decedent}} (account/email: {{account_details}}) due to their death on {{date_of_death}}.

Kindly:
1. Stop all future billing
2. Confirm cancellation in writing
3. Note any refund or final invoice process

I am the designated contact: {{contact_name}}, {{contact_email}}.

Thank you.`,
  },
  {
    id: "t-employer",
    title: "Notify employer / HR",
    category: "Work",
    subject: "Notification regarding {{decedent}}",
    body: `Dear HR / Benefits team,

I am writing to inform you of the death of {{decedent}}, who worked with your organization.

Please share the next steps for final pay, benefits, and any belongings that should be returned. I can coordinate as the designated family contact.

{{contact_name}}
{{contact_email}}
{{contact_phone}}`,
  },
  {
    id: "t-utility",
    title: "Utility account transition",
    category: "Home",
    subject: "Account holder change / death notification — {{service}}",
    body: `Hello,

Please note that {{decedent}}, the account holder for service at {{service_address}} (account: {{account_details}}), has died as of {{date_of_death}}.

We request guidance on keeping essential service active while transferring the account. Designated contact: {{contact_name}}, {{contact_email}}.

Thank you for your help.`,
  },
  {
    id: "t-insurer",
    title: "Insurance claim / policy notice",
    category: "Insurance",
    subject: "Death notification and claim inquiry — {{decedent}}",
    body: `To Claims / Customer Service,

I am notifying you of the death of {{decedent}}, policyholder under {{account_details}}.

Please provide the claim package requirements and the preferred secure channel for document submission.

Designated contact: {{contact_name}} · {{contact_email}} · {{contact_phone}}`,
  },
];

export function fillTemplate(
  body: string,
  vars: Record<string, string>,
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}
