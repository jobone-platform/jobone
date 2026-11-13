import {
  Code2,
  TrendingUp,
  HeartPulse,
  Pill,
  Cpu,
  Car,
  Building2,
  GraduationCap,
  ShoppingBag,
  Radio,
  Film,
  Megaphone,
  Hotel,
  Truck,
  Zap,
  Sprout,
  PackageCheck,
  Briefcase,
  ShieldAlert,
  Plane,
  Landmark,
  Scale,
  FlaskConical,
  Leaf,
} from "lucide-react";

/**
 * JobOne Real-World Industry Taxonomy
 * 
 * Strict separation:
 * - Industry: The macroeconomic sector of the organization.
 * - Department / Functional Area: Internal operational division within an organization.
 * - Job Title: The specific position held by an individual.
 */

export const INDUSTRIES = [
  {
    id: "it-software",
    slug: "it-software",
    name: "Information Technology & Software",
    shortName: "IT & Software",
    icon: Code2,
    group: "tech",
    description: "Enterprise software, cloud infrastructure, AI/ML, SaaS products, cybersecurity, and digital platforms.",
    departments: [
      "Engineering & Development",
      "Data, Analytics & AI",
      "Product Management",
      "Quality Assurance & Testing",
      "Design & Creative",
      "Customer Support & Success",
      "Sales & Business Development",
      "Human Resources & Talent Acquisition"
    ],
    popularRoles: [
      "Software Engineer",
      "Full Stack Developer",
      "DevOps & Cloud Engineer",
      "Data Analyst & BI Specialist",
      "AI/ML Engineer",
      "UI/UX Product Designer"
    ],
    aliases: ["IT & Software", "IT/Software", "Software", "Technology", "Tech"]
  },
  {
    id: "banking-financial-services",
    slug: "banking-financial-services",
    name: "Banking & Financial Services",
    shortName: "Banking & Finance",
    icon: TrendingUp,
    group: "finance",
    description: "Retail banking, corporate finance, investment banking, risk management, wealth management, and fintech.",
    departments: [
      "Finance & Accounting",
      "Risk & Compliance",
      "Investment & Advisory",
      "Operations & Banking Processing",
      "Sales & Wealth Management",
      "Engineering & Development"
    ],
    popularRoles: [
      "Financial Analyst",
      "Investment Banking Associate",
      "Credit Risk Analyst",
      "Senior Accountant & GST Specialist",
      "Banking Operations Executive",
      "Wealth Manager"
    ],
    aliases: ["Banking & Finance", "Banking", "Finance", "BFSI", "Fintech"]
  },
  {
    id: "healthcare-medical-services",
    slug: "healthcare-medical-services",
    name: "Healthcare & Medical Services",
    shortName: "Healthcare & Medical",
    icon: HeartPulse,
    group: "healthcare",
    description: "Hospitals, multi-specialty clinics, diagnostic networks, telemedicine, nursing, and clinical management.",
    departments: [
      "Clinical & Healthcare Operations",
      "Hospital Administration",
      "Nursing & Patient Care",
      "Diagnostics & Laboratory",
      "Quality Assurance & Safety"
    ],
    popularRoles: [
      "Medical Officer",
      "Hospital Operations Administrator",
      "Staff Nurse",
      "Medical Laboratory Technician",
      "Healthcare Quality Manager"
    ],
    aliases: ["Healthcare & Pharma", "Healthcare", "Medical Services", "Hospital"]
  },
  {
    id: "pharmaceuticals-biotechnology",
    slug: "pharmaceuticals-biotechnology",
    name: "Pharmaceuticals & Biotechnology",
    shortName: "Pharma & Biotech",
    icon: Pill,
    group: "healthcare",
    description: "Drug discovery, formulation, clinical trials, regulatory affairs, biotech research, and medical supplies.",
    departments: [
      "Research & Development (R&D)",
      "Quality Assurance & Quality Control",
      "Clinical Operations",
      "Regulatory Affairs",
      "Sales & Business Development"
    ],
    popularRoles: [
      "Clinical Research Associate",
      "Formulation Scientist",
      "Regulatory Affairs Executive",
      "Quality Control Chemist",
      "Medical Representative"
    ],
    aliases: ["Pharma", "Pharmaceuticals", "Biotechnology", "Biotech"]
  },
  {
    id: "manufacturing-industrial-engineering",
    slug: "manufacturing-industrial-engineering",
    name: "Manufacturing & Industrial Engineering",
    shortName: "Manufacturing & Engineering",
    icon: Cpu,
    group: "engineering",
    description: "Heavy machinery, precision manufacturing, industrial automation, robotics, chemicals, and plant operations.",
    departments: [
      "Engineering & Development",
      "Production & Plant Operations",
      "Quality Assurance & Safety",
      "Maintenance & Facilities",
      "Supply Chain & Procurement"
    ],
    popularRoles: [
      "Mechanical Design & CAD Engineer",
      "Production Engineer",
      "Quality Assurance & Control Engineer",
      "Industrial Automation Engineer",
      "Plant Operations Supervisor"
    ],
    aliases: ["Engineering & Manufacturing", "Manufacturing", "Industrial Engineering"]
  },
  {
    id: "automotive-mobility",
    slug: "automotive-mobility",
    name: "Automotive & Mobility",
    shortName: "Automotive & Mobility",
    icon: Car,
    group: "engineering",
    description: "Electric vehicles (EV), automotive OEMs, component design, battery technology, and smart transit platforms.",
    departments: [
      "Engineering & Development",
      "R&D & Embedded Systems",
      "Manufacturing & Assembly",
      "Supply Chain & Operations",
      "Sales & Dealership Network"
    ],
    popularRoles: [
      "Automotive Design Engineer",
      "EV Battery Systems Engineer",
      "Embedded Software Engineer",
      "Plant Assembly Lead",
      "Service & Technical Support Specialist"
    ],
    aliases: ["Automotive", "Mobility", "EV", "Automobile"]
  },
  {
    id: "construction-real-estate",
    slug: "construction-real-estate",
    name: "Construction & Real Estate",
    shortName: "Real Estate & Construction",
    icon: Building2,
    group: "infrastructure",
    description: "Commercial and residential real estate, civil infrastructure, architecture, project development, and property management.",
    departments: [
      "Civil Engineering & Construction",
      "Architecture & Planning",
      "Property Sales & Leasing",
      "Project Management",
      "Legal & Land Acquisition"
    ],
    popularRoles: [
      "Civil Site Engineer",
      "Project Manager — Construction",
      "Architectural Drafter",
      "Real Estate Property Consultant",
      "Quantity Surveyor & Estimator"
    ],
    aliases: ["Real Estate", "Construction", "Property", "Infrastructure"]
  },
  {
    id: "education-edtech",
    slug: "education-edtech",
    name: "Education & EdTech",
    shortName: "Education & EdTech",
    icon: GraduationCap,
    group: "services",
    description: "Universities, K-12 schooling, online learning platforms, vocational training, and educational technology.",
    departments: [
      "Academic Operations & Teaching",
      "Curriculum & Content Development",
      "Student Counseling & Admissions",
      "EdTech Product & Engineering",
      "Institutional Administration"
    ],
    popularRoles: [
      "Subject Matter Expert",
      "Curriculum Designer",
      "Academic Counselor",
      "EdTech Content Developer",
      "School / College Administrator"
    ],
    aliases: ["Education & EdTech", "Education", "EdTech", "Academics"]
  },
  {
    id: "retail-ecommerce",
    slug: "retail-ecommerce",
    name: "Retail & E-Commerce",
    shortName: "Retail & E-Commerce",
    icon: ShoppingBag,
    group: "commerce",
    description: "Online marketplaces, brick-and-mortar retail chains, omnichannel commerce, inventory systems, and store operations.",
    departments: [
      "Store Operations & Merchandising",
      "E-Commerce Platform & Catalog",
      "Customer Support & Success",
      "Supply Chain & Warehousing",
      "Marketing & Category Growth"
    ],
    popularRoles: [
      "Store Manager",
      "E-Commerce Category Lead",
      "Customer Success Specialist",
      "Retail Merchandiser",
      "Inventory Controller"
    ],
    aliases: ["Retail", "E-Commerce", "Ecommerce", "Retail & Commerce"]
  },
  {
    id: "telecommunications",
    slug: "telecommunications",
    name: "Telecommunications",
    shortName: "Telecommunications",
    icon: Radio,
    group: "tech",
    description: "5G network providers, broadband infrastructure, optical fiber, satellite communication, and telecom hardware.",
    departments: [
      "Network Engineering & Operations",
      "Field Operations & Installation",
      "RF & Wireless Planning",
      "Customer Support & Billing",
      "Enterprise Telecom Sales"
    ],
    popularRoles: [
      "Network Engineer",
      "RF Planning Specialist",
      "Fiber Optics Field Engineer",
      "NOC Operations Engineer",
      "Telecom Solutions Architect"
    ],
    aliases: ["Telecom", "Telecommunications", "Broadband"]
  },
  {
    id: "media-entertainment",
    slug: "media-entertainment",
    name: "Media & Entertainment",
    shortName: "Media & Entertainment",
    icon: Film,
    group: "creative",
    description: "Film, broadcast television, OTT streaming platforms, music production, digital publishing, and gaming.",
    departments: [
      "Content Production & Editorial",
      "Audio & Video Engineering",
      "Creative Design & Animation",
      "Distribution & Rights Management",
      "Digital Media Marketing"
    ],
    popularRoles: [
      "Video Editor & Motion Designer",
      "Content Producer",
      "Broadcast Technician",
      "Sound Engineer",
      "Creative Copywriter"
    ],
    aliases: ["Media", "Entertainment", "Broadcast", "OTT"]
  },
  {
    id: "advertising-digital-marketing",
    slug: "advertising-digital-marketing",
    name: "Advertising & Digital Marketing",
    shortName: "Advertising & Marketing",
    icon: Megaphone,
    group: "marketing",
    description: "Performance marketing agencies, creative advertising, SEO/SEM, brand strategy, PR, and social media campaigns.",
    departments: [
      "Marketing & Growth",
      "Sales & Business Development",
      "Creative Direction & Design",
      "Content Strategy & Copywriting",
      "Media Buying & Analytics"
    ],
    popularRoles: [
      "Performance & Digital Marketing Manager",
      "SEO & Content Marketing Specialist",
      "Media Planner & Buyer",
      "Art Director",
      "Brand Strategist"
    ],
    aliases: ["Sales & Marketing", "Advertising", "Digital Marketing", "Marketing Agency"]
  },
  {
    id: "hospitality-tourism",
    slug: "hospitality-tourism",
    name: "Hospitality & Tourism",
    shortName: "Hospitality & Tourism",
    icon: Hotel,
    group: "services",
    description: "Hotels, luxury resorts, restaurant chains, travel management agencies, airlines, and event tourism.",
    departments: [
      "Hotel & Front Office Operations",
      "Food & Beverage Management",
      "Travel Planning & Ticketing",
      "Housekeeping & Facilities",
      "Sales & Event Banqueting"
    ],
    popularRoles: [
      "Hotel Operations Manager",
      "Executive Chef",
      "Travel Consultant",
      "Front Office Executive",
      "Food & Beverage Supervisor"
    ],
    aliases: ["Hospitality", "Tourism", "Hotels", "Travel"]
  },
  {
    id: "transportation-logistics",
    slug: "transportation-logistics",
    name: "Transportation & Logistics",
    shortName: "Logistics & Transport",
    icon: Truck,
    group: "operations",
    description: "Freight forwarding, 3PL logistics, maritime shipping, air cargo, fleet management, and cold chain distribution.",
    departments: [
      "Supply Chain & Operations",
      "Warehouse & Hub Management",
      "Fleet & Dispatch Operations",
      "Customs & Freight Forwarding",
      "Logistics Analytics & Planning"
    ],
    popularRoles: [
      "Supply Chain Operations Coordinator",
      "Warehouse Hub Manager",
      "E-Commerce Last-Mile Logistics Lead",
      "Freight Forwarding Specialist",
      "Fleet Dispatch Supervisor"
    ],
    aliases: ["Operations & Logistics", "Logistics", "Transportation", "Supply Chain"]
  },
  {
    id: "energy-utilities",
    slug: "energy-utilities",
    name: "Energy & Utilities",
    shortName: "Energy & Utilities",
    icon: Zap,
    group: "infrastructure",
    description: "Renewable energy, solar/wind farms, thermal power, oil & gas exploration, electrical grid, and water treatment.",
    departments: [
      "Plant & Power Operations",
      "Electrical & Transmission Engineering",
      "Safety & Environmental Compliance",
      "Project Execution & Grid Connection",
      "Procurement & Vendor Management"
    ],
    popularRoles: [
      "Solar Project Engineer",
      "Electrical Grid Specialist",
      "Power Plant Operations Engineer",
      "Health, Safety & Environment (HSE) Officer",
      "Substation Maintenance Engineer"
    ],
    aliases: ["Energy", "Utilities", "Power", "Renewables", "Oil & Gas"]
  },
  {
    id: "agriculture-agritech",
    slug: "agriculture-agritech",
    name: "Agriculture & Agritech",
    shortName: "Agriculture & Agritech",
    icon: Sprout,
    group: "science",
    description: "Precision farming, drone crop monitoring, agri-inputs, seed technology, greenhouse cultivation, and food supply chains.",
    departments: [
      "Agronomy & Field Research",
      "Supply Chain & Procurement",
      "Agritech IoT & Hardware",
      "Rural Sales & Distribution",
      "Quality Assurance & Soil Testing"
    ],
    popularRoles: [
      "Agronomist & Crop Specialist",
      "Agricultural Procurement Executive",
      "Farm Operations Supervisor",
      "Drone Survey Operator",
      "Soil & Seed Analyst"
    ],
    aliases: ["Agriculture", "Agritech", "Farming", "Agri"]
  },
  {
    id: "fmcg-consumer-goods",
    slug: "fmcg-consumer-goods",
    name: "FMCG & Consumer Goods",
    shortName: "FMCG & Consumer Goods",
    icon: PackageCheck,
    group: "commerce",
    description: "Packaged foods, personal care products, beverages, household essentials, and consumer durable distribution.",
    departments: [
      "Trade Sales & Distribution",
      "Brand Management & Marketing",
      "Packaging & Product Formulation",
      "Supply Chain & Inventory",
      "Quality Assurance & Regulatory"
    ],
    popularRoles: [
      "Territory Sales Executive",
      "Area Sales Manager",
      "Brand Manager — FMCG",
      "Packaging Development Technologist",
      "Trade Marketing Specialist"
    ],
    aliases: ["FMCG", "Consumer Goods", "CPG", "Packaged Goods"]
  },
  {
    id: "consulting-professional-services",
    slug: "consulting-professional-services",
    name: "Consulting & Professional Services",
    shortName: "Consulting & Advisory",
    icon: Briefcase,
    group: "services",
    description: "Management consulting, business advisory, IT strategy, risk management, executive search, and accounting partnerships.",
    departments: [
      "Management Consulting & Strategy",
      "Audit & Tax Advisory",
      "Business Transformation",
      "Human Resources & Talent Acquisition",
      "Client Relationship Management"
    ],
    popularRoles: [
      "Management Consultant",
      "Strategy Analyst",
      "Senior Tax Consultant",
      "Risk Advisory Associate",
      "Talent Acquisition Consultant"
    ],
    aliases: ["Consulting", "Professional Services", "Advisory", "Business Consulting"]
  },
  {
    id: "insurance",
    slug: "insurance",
    name: "Insurance",
    shortName: "Insurance",
    icon: ShieldAlert,
    group: "finance",
    description: "Life insurance, general insurance, health underwriting, actuarial analytics, claims investigation, and policy underwriting.",
    departments: [
      "Underwriting & Risk Assessment",
      "Actuarial Science",
      "Claims Processing & Investigation",
      "Agency & Bancassurance Sales",
      "Policy Operations & Customer Service"
    ],
    popularRoles: [
      "Insurance Underwriter",
      "Actuarial Analyst",
      "Claims Settlement Officer",
      "Bancassurance Sales Manager",
      "Risk Assessment Specialist"
    ],
    aliases: ["Insurance", "Insurtech", "Underwriting"]
  },
  {
    id: "aerospace-defence",
    slug: "aerospace-defence",
    name: "Aerospace & Defence",
    shortName: "Aerospace & Defence",
    icon: Plane,
    group: "engineering",
    description: "Aviation manufacturing, drone defense, satellite systems, avionics, radar engineering, and military hardware.",
    departments: [
      "Avionics & Embedded Engineering",
      "Aerodynamics & Structural Design",
      "Quality Assurance & Defense Standards",
      "Production & Precision Assembly",
      "Defense Project Management"
    ],
    popularRoles: [
      "Aeronautical Design Engineer",
      "Avionics Systems Specialist",
      "Radar & RF Electronics Engineer",
      "Defense Procurement Manager",
      "Flight Test Technician"
    ],
    aliases: ["Aerospace", "Defence", "Defense", "Aviation"]
  },
  {
    id: "government-public-sector",
    slug: "government-public-sector",
    name: "Government & Public Sector",
    shortName: "Government & Public Sector",
    icon: Landmark,
    group: "services",
    description: "Public sector undertakings (PSUs), municipal administration, smart city projects, and civil governance initiatives.",
    departments: [
      "Public Administration & Governance",
      "Infrastructure & Urban Planning",
      "Finance & Public Budgeting",
      "Citizen Services & Operations",
      "Policy Research & Compliance"
    ],
    popularRoles: [
      "Public Policy Analyst",
      "Urban Planning Specialist",
      "PSU Project Engineer",
      "Municipal Operations Executive",
      "Government Relations Officer"
    ],
    aliases: ["Government", "Public Sector", "PSU", "Civil Services"]
  },
  {
    id: "legal-services",
    slug: "legal-services",
    name: "Legal Services",
    shortName: "Legal Services",
    icon: Scale,
    group: "services",
    description: "Corporate law firms, litigation practices, intellectual property, contract arbitration, and legal advisory.",
    departments: [
      "Corporate & M&A Legal",
      "Litigation & Dispute Resolution",
      "Intellectual Property & Patents",
      "Contract Drafting & Review",
      "Regulatory & Compliance"
    ],
    popularRoles: [
      "Corporate Legal Counsel",
      "Contract Management Specialist",
      "Intellectual Property Attorney",
      "Compliance Officer",
      "Litigation Associate"
    ],
    aliases: ["Legal", "Law", "Legal Services", "Law Firm"]
  },
  {
    id: "research-development",
    slug: "research-development",
    name: "Research & Development",
    shortName: "Research & Development",
    icon: FlaskConical,
    group: "science",
    description: "Scientific discovery, advanced material labs, semiconductor research, prototype engineering, and applied sciences.",
    departments: [
      "Applied Science & Research",
      "Prototype Design & Testing",
      "Patent & Innovation Management",
      "Laboratory Operations & Safety",
      "Computational Research"
    ],
    popularRoles: [
      "Research Scientist",
      "Laboratory Director",
      "Materials Science Researcher",
      "Patent Analyst",
      "Applied Data Scientist"
    ],
    aliases: ["Research & Development", "R&D", "Scientific Research"]
  },
  {
    id: "environmental-sustainability",
    slug: "environmental-sustainability",
    name: "Environmental & Sustainability",
    shortName: "Environmental & Sustainability",
    icon: Leaf,
    group: "science",
    description: "ESG reporting, carbon footprint auditing, waste recycling, water conservation, circular economy, and ecological planning.",
    departments: [
      "ESG & Sustainability Strategy",
      "Environmental Impact Assessment",
      "Waste & Water Management",
      "Carbon Auditing & Renewable Credits",
      "Regulatory Environmental Compliance"
    ],
    popularRoles: [
      "Sustainability Consultant",
      "ESG Reporting Specialist",
      "Environmental Impact Auditor",
      "Waste Management Project Manager",
      "Carbon Accounting Analyst"
    ],
    aliases: ["Environmental", "Sustainability", "ESG", "Cleantech", "Green Energy"]
  }
];

export const DEPARTMENTS = [
  "Engineering & Development",
  "Human Resources & Talent Acquisition",
  "Administration & Workplace",
  "Finance & Accounting",
  "Sales & Business Development",
  "Marketing & Growth",
  "Customer Support & Success",
  "Operations & Logistics",
  "Supply Chain & Procurement",
  "Design & Creative",
  "Legal & Compliance",
  "Data, Analytics & AI",
  "Product Management",
  "Quality Assurance & Safety",
  "Clinical & Healthcare Operations",
  "Research & Development (R&D)"
];

/**
 * Standardize any arbitrary industry input to an official Industry record.
 */
export function normalizeIndustry(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();

  const direct = INDUSTRIES.find(
    (ind) =>
      ind.id.toLowerCase() === trimmed ||
      ind.slug.toLowerCase() === trimmed ||
      ind.name.toLowerCase() === trimmed ||
      ind.shortName.toLowerCase() === trimmed
  );
  if (direct) return direct;

  const byAlias = INDUSTRIES.find((ind) =>
    ind.aliases.some((alias) => alias.toLowerCase() === trimmed)
  );
  if (byAlias) return byAlias;

  const partial = INDUSTRIES.find((ind) => {
    const n = ind.name.toLowerCase();
    const s = ind.shortName.toLowerCase();
    return n.includes(trimmed) || trimmed.includes(s) || trimmed.includes(n);
  });
  if (partial) return partial;

  return null;
}

/**
 * Returns departments mapped to a specific industry name, or all departments if not found.
 */
export function getDepartmentsForIndustry(industryName) {
  const ind = normalizeIndustry(industryName);
  return ind ? ind.departments : DEPARTMENTS;
}

/**
 * Returns popular roles mapped to a specific industry name.
 */
export function getPopularRolesForIndustry(industryName) {
  const ind = normalizeIndustry(industryName);
  return ind ? ind.popularRoles : [];
}

/**
 * Build an industry-to-department lookup dictionary for dropdown selectors.
 */
export const INDUSTRY_DEPARTMENTS_MAP = INDUSTRIES.reduce((acc, ind) => {
  acc[ind.name] = ind.departments;
  return acc;
}, {});

