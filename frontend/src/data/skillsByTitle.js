export const SKILLS_BY_TITLE = {
    // ─── Executive & C-Suite ───
    "Chief Executive Officer (CEO)": ["Strategic Planning", "P&L Management", "Board Relations", "Stakeholder Management", "M&A", "Corporate Governance", "Organisational Leadership", "Change Management", "Financial Oversight", "Business Development"],
    "Chief Operating Officer (COO)": ["Operations Management", "Process Optimisation", "Cross-functional Leadership", "KPI Management", "Resource Allocation", "Vendor Management", "Risk Management", "Budgeting", "Team Leadership", "Strategic Execution"],
    "Chief Financial Officer (CFO)": ["Financial Planning & Analysis", "GAAP/IFRS", "Treasury Management", "Investor Relations", "Risk Management", "Mergers & Acquisitions", "Capital Markets", "Financial Reporting", "Cost Optimisation", "Budgeting"],
    "Chief Technology Officer (CTO)": ["Technology Strategy", "System Architecture", "R&D Leadership", "Cloud Infrastructure", "Cybersecurity", "Agile/Scrum", "Vendor Management", "Product Roadmap", "Team Building", "Digital Transformation"],
    "Chief Marketing Officer (CMO)": ["Brand Strategy", "Digital Marketing", "Market Research", "Campaign Management", "Revenue Growth", "Content Strategy", "PR & Communications", "Data Analytics", "Customer Acquisition", "Budget Management"],
    "Chief Human Resources Officer (CHRO)": ["HR Strategy", "Talent Acquisition", "Compensation & Benefits", "Employee Relations", "Organisational Development", "Succession Planning", "DEI Initiatives", "HRIS Systems", "Labour Law", "Change Management"],
    "Managing Director (MD)": ["Business Strategy", "P&L Ownership", "Stakeholder Engagement", "Team Leadership", "Market Expansion", "Financial Oversight", "Client Relations", "Corporate Governance", "Business Development", "Risk Management"],
    "General Manager (GM)": ["Operations Management", "Team Leadership", "Budget Management", "Business Development", "Client Relations", "Strategic Planning", "Performance Management", "Process Improvement", "Vendor Management", "Revenue Growth"],
    "Vice President (VP)": ["Strategic Planning", "Team Leadership", "Stakeholder Management", "Budget Management", "Cross-functional Collaboration", "Performance Metrics", "Business Development", "Process Improvement", "Reporting", "Change Management"],
    "Director": ["Team Management", "Strategic Planning", "Budget Oversight", "Stakeholder Communication", "Performance Management", "Process Optimisation", "Cross-functional Collaboration", "Reporting & Analytics", "Business Development", "Risk Management"],
    "President": ["Corporate Strategy", "P&L Management", "Board Engagement", "Stakeholder Relations", "M&A", "Organisational Leadership", "Market Expansion", "Investor Relations", "Culture Building", "Executive Reporting"],

    // ─── Technology & Software Engineering ───
    "Software Engineer": ["Data Structures & Algorithms", "Object-Oriented Programming", "Git", "REST APIs", "SQL", "Unit Testing", "Agile/Scrum", "Code Review", "Linux/Unix", "Problem Solving"],
    "Junior Software Engineer": ["Data Structures & Algorithms", "Object-Oriented Programming", "Git", "REST APIs", "SQL", "Unit Testing", "HTML/CSS", "Debugging", "Agile Basics", "Problem Solving"],
    "Senior Software Engineer": ["System Design", "Microservices", "Code Review", "Mentoring", "CI/CD", "Cloud Services", "Performance Optimisation", "REST APIs", "Agile/Scrum", "Technical Documentation"],
    "Staff Software Engineer": ["System Architecture", "Technical Leadership", "Cross-team Collaboration", "Code Review", "Mentoring", "CI/CD Pipelines", "Distributed Systems", "Performance Optimisation", "Cloud Platforms", "Engineering Standards"],
    "Frontend Web Developer": ["HTML5", "CSS3", "JavaScript", "React.js", "Responsive Design", "REST APIs", "Git", "Browser Compatibility", "Performance Optimisation", "Figma/Adobe XD"],
    "React Developer": ["React.js", "Redux", "JavaScript (ES6+)", "HTML5/CSS3", "REST APIs", "Git", "Webpack/Vite", "React Hooks", "Component Architecture", "TypeScript"],
    "Angular Developer": ["Angular", "TypeScript", "RxJS", "HTML5/CSS3", "REST APIs", "Git", "NgRx", "Unit Testing (Jasmine)", "Webpack", "Agile/Scrum"],
    "Vue.js Developer": ["Vue.js", "Vuex", "JavaScript (ES6+)", "HTML5/CSS3", "REST APIs", "Git", "Nuxt.js", "Vue Router", "TypeScript", "Webpack"],
    "Backend Developer": ["Node.js/Python/Java", "REST APIs", "SQL/NoSQL", "Git", "Authentication (JWT/OAuth)", "Server Management", "Microservices", "Docker", "CI/CD", "Cloud Platforms"],
    "Node.js Developer": ["Node.js", "Express.js", "REST APIs", "MongoDB/PostgreSQL", "JWT/OAuth", "Git", "Docker", "Microservices", "Async Programming", "Unit Testing"],
    "Python Developer": ["Python", "Django/Flask/FastAPI", "REST APIs", "SQL/NoSQL", "Git", "Docker", "Data Structures", "Unit Testing", "OOP", "Linux"],
    "Java Developer": ["Java", "Spring Boot", "REST APIs", "SQL/NoSQL", "Maven/Gradle", "Git", "Microservices", "JUnit", "Docker", "OOP"],
    "Full Stack Developer": ["React.js/Vue.js", "Node.js/Python", "REST APIs", "SQL/NoSQL", "Git", "Docker", "HTML5/CSS3", "Authentication", "CI/CD", "Agile/Scrum"],
    "MERN Stack Developer": ["MongoDB", "Express.js", "React.js", "Node.js", "REST APIs", "Git", "JWT Auth", "Redux", "Docker", "HTML5/CSS3"],
    "Mobile App Developer": ["React Native/Flutter", "REST APIs", "Git", "App Store Deployment", "UI/UX Principles", "Push Notifications", "Offline Storage", "Performance Optimisation", "Debugging", "Agile/Scrum"],
    "iOS Developer": ["Swift", "SwiftUI/UIKit", "Xcode", "REST APIs", "Git", "CoreData", "App Store Connect", "Push Notifications", "Memory Management", "Unit Testing"],
    "Android Developer": ["Kotlin/Java", "Android Studio", "REST APIs", "Git", "Room Database", "Firebase", "Play Store Deployment", "Material Design", "Unit Testing", "MVVM Architecture"],
    "Flutter Developer": ["Flutter", "Dart", "REST APIs", "Git", "Firebase", "State Management (Provider/Bloc)", "Cross-platform Development", "App Store/Play Store Deployment", "UI Design", "Unit Testing"],
    "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD Pipelines", "Terraform", "Linux", "AWS/Azure/GCP", "Shell Scripting", "Monitoring (Prometheus/Grafana)", "Git", "Ansible"],
    "Cloud Engineer": ["AWS/Azure/GCP", "Terraform/CloudFormation", "Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "Security Best Practices", "Cost Optimisation", "Monitoring"],
    "Cloud Architect": ["Solution Architecture", "AWS/Azure/GCP", "Terraform", "Kubernetes", "Microservices", "Security & Compliance", "Cost Management", "DevOps", "Networking", "Disaster Recovery"],
    "QA Tester": ["Manual Testing", "Test Case Writing", "Bug Reporting", "Regression Testing", "JIRA", "Agile/Scrum", "API Testing (Postman)", "Functional Testing", "Attention to Detail", "UAT"],
    "QA Automation Engineer": ["Selenium/Cypress", "Python/Java", "CI/CD Integration", "Test Frameworks (TestNG/JUnit)", "API Testing", "JIRA", "Git", "Performance Testing", "BDD (Cucumber)", "Agile"],
    "Database Administrator (DBA)": ["SQL", "PostgreSQL/MySQL/Oracle", "Database Design", "Performance Tuning", "Backup & Recovery", "Replication", "Security Management", "Query Optimisation", "MongoDB", "Linux"],
    "Software Architect": ["System Design", "Microservices", "Cloud Architecture", "API Design", "Security Patterns", "Performance Optimisation", "Technical Leadership", "Distributed Systems", "Documentation", "Agile"],
    "Embedded Systems Engineer": ["C/C++", "RTOS", "Microcontrollers (ARM/AVR)", "Communication Protocols (I2C/SPI/UART)", "Debugging (JTAG)", "Linux Kernel", "Circuit Design", "PCB Layout", "Firmware Development", "IoT"],
    "Game Developer": ["Unity/Unreal Engine", "C#/C++", "Game Physics", "3D Math", "Version Control", "Performance Optimisation", "Shader Programming", "Multiplayer Networking", "UI Design", "Debugging"],

    // ─── Data & Analytics ───
    "Data Analyst": ["SQL", "Excel (Advanced)", "Python/R", "Power BI/Tableau", "Data Visualisation", "Statistical Analysis", "ETL", "Data Cleaning", "Pivot Tables", "Business Intelligence"],
    "Senior Data Analyst": ["SQL (Advanced)", "Python", "Power BI/Tableau", "Statistical Modelling", "A/B Testing", "Data Pipeline Management", "Stakeholder Reporting", "ETL", "Machine Learning Basics", "Business Intelligence"],
    "Data Scientist": ["Python/R", "Machine Learning", "Deep Learning", "SQL", "Statistics", "Data Visualisation", "Feature Engineering", "NLP", "TensorFlow/PyTorch", "Jupyter Notebooks"],
    "Machine Learning Engineer": ["Python", "TensorFlow/PyTorch", "Scikit-learn", "MLOps", "Docker", "SQL", "Feature Engineering", "Model Deployment", "Cloud Platforms", "Statistics"],
    "Data Engineer": ["Python", "SQL", "Apache Spark", "Kafka", "Airflow", "Cloud Platforms (AWS/GCP/Azure)", "ETL Pipelines", "Data Warehousing", "Hadoop", "Git"],
    "BI Developer": ["Power BI/Tableau", "SQL", "DAX/MDX", "Data Modelling", "ETL", "SSRS", "Azure/AWS", "Report Design", "Business Analysis", "Excel"],
    "AI Researcher": ["Python", "Deep Learning", "NLP", "Computer Vision", "TensorFlow/PyTorch", "Research Methodology", "Statistics", "Academic Writing", "CUDA", "Mathematics"],
    "NLP Engineer": ["Python", "NLP Libraries (spaCy/NLTK)", "Transformers (BERT/GPT)", "Deep Learning", "Text Classification", "Named Entity Recognition", "Sentiment Analysis", "SQL", "TensorFlow/PyTorch", "ML Deployment"],
    "Prompt Engineer": ["LLM Fine-tuning", "Prompt Design", "Python", "API Integration", "NLP Concepts", "Evaluation Metrics", "Technical Writing", "AI Ethics", "OpenAI/Anthropic APIs", "Experiment Tracking"],

    // ─── Product & Design ───
    "Product Manager": ["Product Roadmap", "User Story Writing", "Agile/Scrum", "Stakeholder Management", "Market Research", "A/B Testing", "JIRA/Confluence", "Data Analysis", "Wireframing", "Go-to-Market Strategy"],
    "Senior Product Manager": ["Product Strategy", "OKR Setting", "Cross-functional Leadership", "Market Analysis", "User Research", "Roadmap Prioritisation", "Stakeholder Communication", "Data-driven Decision Making", "A/B Testing", "P&L Awareness"],
    "UX/UI Designer": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Design Systems", "Interaction Design", "Responsive Design", "Information Architecture"],
    "Graphic Designer": ["Adobe Illustrator", "Adobe Photoshop", "InDesign", "Typography", "Brand Identity", "Layout Design", "Colour Theory", "Figma", "Print Design", "Digital Design"],
    "Product Designer": ["Figma", "User Research", "Prototyping", "Design Systems", "Interaction Design", "Visual Design", "Usability Testing", "Cross-functional Collaboration", "Accessibility", "Design Thinking"],
    "Art Director": ["Creative Direction", "Adobe Creative Suite", "Brand Strategy", "Typography", "Art Direction", "Team Management", "Campaign Ideation", "Photography Direction", "Layout Design", "Client Presentations"],
    "Motion Graphics Designer": ["After Effects", "Premiere Pro", "Cinema 4D", "Figma", "Animation Principles", "Video Editing", "Compositing", "Storyboarding", "3D Modelling", "Typography"],
    "3D Artist": ["Blender/Maya/3ds Max", "Texturing", "Lighting", "Rendering (Arnold/V-Ray)", "UV Mapping", "Rigging", "ZBrush", "Substance Painter", "Game Asset Creation", "Animation"],

    // ─── Sales & Business Development ───
    "Sales Executive": ["Lead Generation", "Cold Calling", "CRM Software (Salesforce/HubSpot)", "Negotiation", "Client Relationship Management", "Target Achievement", "B2B/B2C Sales", "Product Demonstration", "Follow-up", "Market Research"],
    "Business Development Manager (BDM)": ["Strategic Partnerships", "Lead Generation", "Market Research", "Negotiation", "CRM Software", "Proposal Writing", "Client Presentations", "Pipeline Management", "Revenue Growth", "Networking"],
    "Account Executive (AE)": ["Sales Pipeline Management", "CRM Software", "Negotiation", "Client Presentations", "Cold Outreach", "Contract Management", "B2B Sales", "Quota Achievement", "Product Knowledge", "Communication"],
    "Account Manager": ["Client Retention", "Upselling/Cross-selling", "CRM Software", "Relationship Management", "Negotiation", "Reporting", "Contract Renewal", "Problem Resolution", "Product Knowledge", "Communication"],
    "Sales Development Representative (SDR)": ["Cold Calling", "Email Outreach", "Lead Qualification", "CRM Software", "LinkedIn Sales Navigator", "Objection Handling", "Appointment Setting", "Product Knowledge", "Communication", "Target Achievement"],
    "Pre-Sales Consultant": ["Solution Architecture", "Product Demonstrations", "RFP/RFI Responses", "Technical Knowledge", "Stakeholder Presentations", "Needs Assessment", "Proposal Writing", "CRM Software", "Communication", "POC Management"],
    "Key Account Manager (KAM)": ["Strategic Account Planning", "Client Retention", "Executive Relationship Management", "Upselling", "CRM Software", "Contract Negotiation", "Performance Reviews", "Problem Solving", "Revenue Growth", "Cross-functional Collaboration"],

    // ─── Marketing & Communications ───
    "Digital Marketing Manager": ["SEO/SEM", "Google Ads", "Social Media Marketing", "Email Marketing", "Content Strategy", "Google Analytics", "PPC Campaigns", "CRM", "A/B Testing", "Marketing Automation"],
    "Content Writer": ["SEO Writing", "Copywriting", "Research", "WordPress/CMS", "Editing & Proofreading", "Content Strategy", "Social Media Writing", "Blogging", "Keyword Research", "Grammar & Style"],
    "Social Media Manager": ["Content Creation", "Social Media Strategy", "Instagram/Facebook/LinkedIn", "Community Management", "Analytics & Reporting", "Paid Social Ads", "Canva/Adobe Express", "Scheduling Tools", "Influencer Marketing", "Campaign Management"],
    "SEO Specialist": ["On-page SEO", "Off-page SEO", "Keyword Research", "Google Search Console", "Backlink Analysis", "Technical SEO", "Google Analytics", "Content Optimisation", "Ahrefs/SEMrush", "Schema Markup"],
    "Brand Manager": ["Brand Strategy", "Market Research", "Campaign Management", "Cross-functional Collaboration", "Budget Management", "Consumer Insights", "Agency Management", "P&L Ownership", "Product Launches", "Competitive Analysis"],
    "PR Manager": ["Media Relations", "Press Release Writing", "Crisis Communication", "Stakeholder Engagement", "Event Management", "Brand Positioning", "Social Media", "Influencer Relations", "Copywriting", "Reputation Management"],
    "Email Marketing Specialist": ["Mailchimp/Klaviyo/HubSpot", "Email Copywriting", "A/B Testing", "List Segmentation", "Automation Workflows", "Analytics & Reporting", "HTML/CSS (Basic)", "Campaign Management", "Compliance (GDPR)", "CRM"],

    // ─── Finance & Accounting ───
    "Accountant": ["Tally ERP", "GST Filing", "TDS", "Bookkeeping", "MS Excel", "Bank Reconciliation", "Financial Reporting", "Payroll Processing", "Accounts Payable/Receivable", "Audit Support"],
    "Senior Accountant": ["Financial Reporting", "GAAP/IFRS", "Month-end Close", "Tax Compliance", "Variance Analysis", "Advanced Excel", "ERP Systems (SAP/Oracle)", "Audit Coordination", "Budgeting", "Team Supervision"],
    "Financial Analyst": ["Financial Modelling", "Excel (Advanced)", "Variance Analysis", "Budgeting & Forecasting", "Data Analysis", "PowerPoint Presentations", "ERP Systems", "DCF Valuation", "Financial Reporting", "Market Research"],
    "Chief Accountant": ["Financial Statements", "GAAP/IFRS", "Team Management", "Tax Planning", "ERP Systems", "Internal Controls", "Audit Management", "Budgeting", "Cash Flow Management", "Regulatory Compliance"],
    "Payroll Specialist": ["Payroll Processing", "Statutory Compliance (PF/ESI/TDS)", "Tally/SAP", "Excel", "Salary Structuring", "Leave Management", "Full & Final Settlement", "Payslip Generation", "Labour Laws", "Attention to Detail"],
    "Tax Consultant": ["Income Tax", "GST", "Tax Planning", "Tax Compliance", "Return Filing", "Tally/SAP", "Audit Support", "Financial Statements", "Excel", "Regulatory Knowledge"],
    "Internal Auditor": ["Audit Planning", "Risk Assessment", "Internal Controls", "GAAP/IFRS", "Report Writing", "Data Analysis", "ERP Systems", "Compliance", "Process Documentation", "SAP/Oracle"],

    // ─── Human Resources ───
    "HR Generalist": ["Recruitment", "Onboarding", "Payroll Processing", "Employee Relations", "HRIS Systems", "Labour Laws", "Performance Management", "Policy Implementation", "Training Coordination", "Exit Management"],
    "HR Manager": ["HR Strategy", "Talent Acquisition", "Employee Relations", "Performance Management", "Compensation & Benefits", "Labour Laws", "HRIS", "Organisational Development", "Conflict Resolution", "Compliance"],
    "Recruiter": ["Sourcing", "Interviewing", "Job Posting", "ATS Software", "Candidate Screening", "Offer Negotiation", "LinkedIn Recruiting", "Employer Branding", "Stakeholder Management", "Pipeline Management"],
    "HR Business Partner (HRBP)": ["Strategic HR", "Employee Relations", "Performance Management", "Change Management", "Workforce Planning", "Compensation Analysis", "HRIS", "Stakeholder Management", "Labour Law", "Talent Management"],
    "Learning & Development (L&D) Specialist": ["Training Design", "Instructional Design", "LMS Administration", "Facilitation", "Needs Assessment", "E-learning Development", "Content Creation", "Evaluation & Assessment", "Stakeholder Management", "Presentation Skills"],

    // ─── Operations & Logistics ───
    "Operations Manager": ["Process Optimisation", "Team Leadership", "Budget Management", "KPI Tracking", "Supply Chain Management", "Vendor Management", "Risk Management", "SOP Development", "Cross-functional Collaboration", "Reporting"],
    "Supply Chain Analyst": ["Supply Chain Management", "ERP Systems (SAP/Oracle)", "Demand Forecasting", "Data Analysis", "Excel", "Vendor Management", "Inventory Management", "Logistics Coordination", "Procurement", "Reporting"],
    "Logistics Coordinator": ["Shipment Tracking", "Freight Management", "Vendor Coordination", "Documentation", "ERP/WMS Systems", "Import/Export Regulations", "Inventory Control", "Route Planning", "Communication", "Problem Solving"],
    "Procurement Manager": ["Strategic Sourcing", "Vendor Management", "Contract Negotiation", "Cost Reduction", "RFQ/RFP Management", "ERP Systems", "Supplier Evaluation", "Budgeting", "Category Management", "Compliance"],
    "Warehouse Manager": ["Warehouse Operations", "Inventory Management", "WMS Software", "Team Leadership", "Safety Compliance", "Stock Audits", "Shipping & Receiving", "Process Optimisation", "Vendor Coordination", "Reporting"],
    "Fleet Manager": ["Fleet Operations", "Vehicle Maintenance", "Route Optimisation", "Driver Management", "GPS Tracking Systems", "Budget Management", "Compliance (RTO/Permits)", "Fuel Management", "Vendor Negotiation", "Reporting"],

    // ─── Customer Support & Success ───
    "Customer Service Representative": ["Communication", "Problem Solving", "CRM Software", "Active Listening", "Complaint Resolution", "Product Knowledge", "Email/Chat Support", "Patience", "Data Entry", "Team Collaboration"],
    "Customer Success Manager (CSM)": ["Onboarding", "Client Retention", "Upselling/Cross-selling", "CRM Software", "Data Analysis", "Stakeholder Management", "Problem Resolution", "Product Knowledge", "Communication", "NPS/CSAT"],
    "Technical Support Engineer": ["Troubleshooting", "Networking Basics", "Windows/Linux", "Ticketing Systems (JIRA/Zendesk)", "Customer Communication", "Remote Desktop Tools", "Hardware Knowledge", "SQL Basics", "Documentation", "Escalation Management"],
    "Call Center Agent": ["Active Listening", "Communication", "CRM Software", "Call Handling", "Problem Resolution", "Product Knowledge", "Typing Speed", "Patience", "Upselling", "Escalation Handling"],

    // ─── Healthcare & Medical ───
    "Registered Nurse (RN)": ["Patient Assessment", "IV Therapy", "Medication Administration", "Electronic Health Records (EHR)", "Wound Care", "Clinical Documentation", "Patient Education", "Emergency Response", "Infection Control", "Team Collaboration"],
    "Medical Assistant": ["Vital Signs", "Phlebotomy", "EHR Software", "Patient Scheduling", "Medication Administration", "Clinical Documentation", "Medical Billing", "Sterilisation", "Patient Communication", "CPR Certified"],
    "Pharmacist": ["Prescription Dispensing", "Drug Interaction Knowledge", "Patient Counselling", "Inventory Management", "Compounding", "Regulatory Compliance", "Clinical Knowledge", "EHR Software", "Communication", "Attention to Detail"],
    "Dentist": ["Diagnosis", "Restorative Dentistry", "Oral Surgery", "Radiology", "Patient Management", "Infection Control", "Dental Software", "Orthodontics Basics", "Communication", "Manual Dexterity"],
    "Healthcare Administrator": ["Hospital Administration", "Healthcare Policy", "Budgeting", "Staff Management", "EHR Systems", "Regulatory Compliance", "Patient Relations", "Billing & Coding", "Strategic Planning", "Reporting"],
    "Physiotherapy (BPT)": ["Manual Therapy", "Exercise Prescription", "Patient Assessment", "Electrotherapy", "Sports Rehabilitation", "Paediatric Physiotherapy", "Documentation", "Anatomy Knowledge", "Patient Education", "Empathy"],

    // ─── Education & Training ───
    "Teacher": ["Lesson Planning", "Classroom Management", "Curriculum Development", "Student Assessment", "Communication", "Patience", "Subject Matter Knowledge", "Differentiated Instruction", "Parent Communication", "EdTech Tools"],
    "Corporate Trainer": ["Training Design", "Facilitation", "Needs Analysis", "Presentation Skills", "LMS Tools", "Instructional Design", "Content Development", "Assessment Design", "Communication", "Feedback Delivery"],
    "Professor": ["Research", "Academic Writing", "Curriculum Design", "Student Mentoring", "Grant Writing", "Subject Expertise", "Presentation Skills", "Critical Thinking", "Publication", "Peer Review"],
    "Instructional Designer": ["ADDIE Model", "Articulate Storyline/Rise", "E-learning Development", "LMS Administration", "Needs Analysis", "Storyboarding", "Content Writing", "Visual Design", "Assessment Design", "Stakeholder Management"],
    "Tutor": ["Subject Expertise", "Lesson Planning", "Student Assessment", "Communication", "Patience", "Personalised Teaching", "Problem Solving", "Time Management", "Adaptability", "Feedback Delivery"],

    // ─── Legal & Compliance ───
    "Paralegal": ["Legal Research", "Document Drafting", "Case Management", "Legal Filing", "MS Office", "Contract Review", "Client Communication", "Attention to Detail", "Confidentiality", "Litigation Support"],
    "Compliance Manager": ["Regulatory Knowledge", "Risk Assessment", "Policy Development", "Audit Management", "Reporting", "Training & Awareness", "Legal Research", "Stakeholder Communication", "Documentation", "Ethics Management"],
    "Corporate Counsel": ["Contract Drafting", "Legal Research", "M&A Support", "Regulatory Compliance", "Risk Management", "Negotiation", "Employment Law", "IP Law", "Litigation Management", "Stakeholder Communication"],
    "Risk Analyst": ["Risk Assessment", "Data Analysis", "Excel", "Regulatory Knowledge", "Report Writing", "Financial Modelling", "Quantitative Analysis", "Attention to Detail", "Communication", "Problem Solving"],

    // ─── Retail & Consumer Services ───
    "Retail Sales Associate": ["Customer Service", "Product Knowledge", "POS Systems", "Cash Handling", "Upselling", "Inventory Management", "Communication", "Visual Merchandising", "Stock Replenishment", "Team Collaboration"],
    "Store Manager": ["Retail Operations", "Team Leadership", "Sales Target Management", "Inventory Control", "Customer Service", "P&L Management", "Visual Merchandising", "Staff Scheduling", "Vendor Relations", "Reporting"],
    "Visual Merchandiser": ["Store Layout Design", "Display Creation", "Brand Guidelines", "Planogram Execution", "Trend Awareness", "Photography", "Inventory Management", "Communication", "Creativity", "Retail Operations"],

    // ─── Hospitality & Food Service ───
    "Hotel Manager": ["Front Office Management", "Revenue Management", "Guest Relations", "Housekeeping Operations", "F&B Management", "Team Leadership", "Budgeting", "OTA Management", "Complaint Resolution", "Compliance"],
    "Chef / Cook": ["Food Preparation", "Menu Planning", "Food Safety & Hygiene", "Inventory Management", "Kitchen Management", "Plating & Presentation", "Team Coordination", "Cost Control", "Recipe Development", "Time Management"],
    "Barista": ["Espresso Preparation", "Latte Art", "Customer Service", "POS Systems", "Inventory Management", "Cleanliness Standards", "Menu Knowledge", "Communication", "Upselling", "Time Management"],
    "Restaurant Manager": ["Restaurant Operations", "Staff Management", "Customer Service", "POS Systems", "Inventory Control", "Budgeting", "Health & Safety Compliance", "Reservation Management", "Vendor Relations", "Complaint Resolution"],
    "Front Desk Agent": ["Guest Check-in/Check-out", "Property Management Systems (PMS)", "Customer Service", "Reservation Management", "Communication", "Cash Handling", "Problem Resolution", "Multitasking", "Upselling", "Attention to Detail"],

    // ─── Manufacturing & Production ───
    "Production Supervisor": ["Production Planning", "Team Leadership", "Quality Control", "Safety Compliance", "Machine Operation", "Inventory Management", "Lean Manufacturing", "SOPs", "Reporting", "Problem Solving"],
    "Quality Control (QC) Inspector": ["Inspection Techniques", "Statistical Process Control (SPC)", "ISO Standards", "Measurement Tools", "Documentation", "Root Cause Analysis", "Attention to Detail", "Reporting", "Non-conformance Management", "Product Knowledge"],
    "Manufacturing Engineer": ["Process Design", "Lean Manufacturing", "CAD Software", "Six Sigma", "SOP Development", "Quality Management", "Root Cause Analysis", "Tooling & Fixtures", "Safety Compliance", "Production Optimisation"],
    "CNC Machinist": ["CNC Programming (G-Code)", "Blueprint Reading", "Precision Measurement", "Machine Setup", "Quality Inspection", "Material Knowledge", "Troubleshooting", "Safety Compliance", "CAD/CAM", "Attention to Detail"],
    "Welder": ["MIG/TIG/Arc Welding", "Blueprint Reading", "Metal Fabrication", "Safety Compliance", "Quality Inspection", "Precision", "Material Knowledge", "Equipment Maintenance", "Physical Stamina", "Attention to Detail"],

    // ─── Construction & Real Estate ───
    "Civil Engineer": ["AutoCAD", "Structural Analysis", "Project Management", "Construction Materials", "Site Supervision", "Cost Estimation", "MS Project", "Safety Standards", "Survey Techniques", "Report Writing"],
    "Architect": ["AutoCAD", "Revit/BIM", "SketchUp", "Design Concepts", "Building Codes", "Project Management", "Client Communication", "Cost Estimation", "3D Rendering", "Site Supervision"],
    "Construction Manager": ["Project Scheduling", "Budget Management", "Site Supervision", "Contractor Management", "Blueprint Reading", "Safety Compliance", "Risk Management", "MS Project", "Client Communication", "Quality Control"],
    "Real Estate Agent": ["Property Valuation", "Client Relations", "Negotiation", "Market Research", "Contract Knowledge", "Communication", "Lead Generation", "Property Law Basics", "CRM Software", "Site Visits"],
    "Property Manager": ["Lease Management", "Tenant Relations", "Maintenance Coordination", "Budget Management", "Legal Compliance", "Rent Collection", "Vendor Management", "Property Inspection", "Communication", "Reporting"],
    "Electrician": ["Electrical Wiring", "Blueprint Reading", "Safety Standards", "Circuit Installation", "Troubleshooting", "Conduit Bending", "Panel Installation", "Power Distribution", "Testing Equipment", "Compliance (IE Rules)"],

    // ─── IT Infrastructure & Security ───
    "System Administrator": ["Windows Server", "Linux/Unix", "Active Directory", "Networking (TCP/IP)", "Virtualisation (VMware)", "Backup & Recovery", "Patch Management", "PowerShell/Bash", "Monitoring Tools", "Troubleshooting"],
    "Network Engineer": ["Cisco Routers/Switches", "TCP/IP", "OSPF/BGP", "Firewall Management", "VPN Configuration", "Network Security", "LAN/WAN", "Monitoring Tools", "Troubleshooting", "Network Documentation"],
    "Cybersecurity Analyst": ["SIEM Tools", "Penetration Testing", "Incident Response", "Vulnerability Assessment", "Firewall Management", "Network Security", "Threat Intelligence", "Compliance (ISO 27001)", "Scripting (Python/Bash)", "Forensics"],
    "IT Support Specialist": ["Troubleshooting", "Windows/MacOS/Linux", "Networking Basics", "Help Desk Software", "Hardware Installation", "Active Directory", "Remote Support", "Printer/Scanner Setup", "Communication", "Documentation"],
    "Cloud Administrator": ["AWS/Azure/GCP", "VM Management", "IAM Policies", "Storage Management", "Monitoring & Alerting", "Cost Optimisation", "Security Configurations", "Backup Solutions", "Terraform Basics", "Linux"],
};