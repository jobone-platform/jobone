import React, { useState, useRef, useEffect } from "react";
// FACT: Added 'Plus' icon for the custom title button
import { Search, ChevronDown, Check, Briefcase, Plus } from "lucide-react";

export const JOB_CATEGORIES = [
  {
    category: "Executive & C-Suite",
    titles: [
      "Chief Executive Officer (CEO)",
      "Global Chief Executive Officer",
      "Regional Chief Executive Officer",
      "Deputy Chief Executive Officer",
      "Interim Chief Executive Officer",
      "Co-Chief Executive Officer",
      "Chief Operating Officer (COO)",
      "Deputy Chief Operating Officer",
      "Chief Administrative Officer (CAO)",
      "Chief Financial Officer (CFO)",
      "Global Chief Financial Officer",
      "Deputy Chief Financial Officer",
      "Chief Accounting Officer (CAO)",
      "Chief Investment Officer (CIO)",
      "Chief Risk Officer (CRO)",
      "Chief Audit Executive (CAE)",
      "Chief Technology Officer (CTO)",
      "Chief Information Officer (CIO)",
      "Chief Information Security Officer (CISO)",
      "Chief Security Officer (CSO)",
      "Chief Data Officer (CDO)",
      "Chief Digital Officer (CDO)",
      "Chief Artificial Intelligence Officer (CAIO)",
      "Chief Analytics Officer (CAO)",
      "Chief Cloud Officer (CCO)",
      "Chief Marketing Officer (CMO)",
      "Chief Revenue Officer (CRO)",
      "Chief Commercial Officer (CCO)",
      "Chief Growth Officer (CGO)",
      "Chief Brand Officer (CBO)",
      "Chief Communications Officer (CCO)",
      "Chief Human Resources Officer (CHRO)",
      "Chief People Officer (CPO)",
      "Chief Diversity Officer (CDO)",
      "Chief Learning Officer (CLO)",
      "Chief Culture Officer (CCO)",
      "Chief Product Officer (CPO)",
      "Chief Design Officer (CDO)",
      "Chief Innovation Officer (CIO)",
      "Chief Creative Officer (CCO)",
      "Chief Visionary Officer (CVO)",
      "Chief Legal Officer (CLO)",
      "General Counsel",
      "Chief Compliance Officer (CCO)",
      "Chief Ethics Officer (CEO)",
      "Chief Privacy Officer (CPO)",
      "Chief Trust Officer (CTO)",
      "Chief Customer Officer (CCO)",
      "Chief Experience Officer (CXO)",
      "Chief Client Officer (CCO)",
      "Chief Supply Chain Officer (CSCO)",
      "Chief Procurement Officer (CPO)",
      "Chief Sustainability Officer (CSO)",
      "Chief Health Officer (CHO)",
      "Chief Medical Officer (CMO)",
      "Chief Nursing Officer (CNO)",
      "Chief Scientific Officer (CSO)",
      "Chief Strategy Officer (CSO)",
      "Chief Transformation Officer (CTO)",
      "President",
      "Global President",
      "Regional President",
      "Group President",
      "Co-President",
      "Vice President (VP)",
      "Executive Vice President (EVP)",
      "Senior Vice President (SVP)",
      "Assistant Vice President (AVP)",
      "Associate Vice President (AVP)",
      "General Manager (GM)",
      "Country Manager",
      "Regional General Manager",
      "Managing Director (MD)",
      "Executive Director",
      "Senior Director",
      "Director",
      "Co-Founder",
      "Principal",
      "Chairman",
      "Executive Chairman",
      "Vice Chairman",
      "Board Member",
      "Non-Executive Director",
      "Managing Partner",
      "Senior Partner",
      "Managing Member",
    ],
  },
  {
    category: "Technology & Software Engineering",
    titles: [
      // Core Engineering
      "Software Engineering Intern",
      "Junior Software Engineer",
      "Software Engineer",
      "Senior Software Engineer",
      "Staff Software Engineer",
      "Principal Software Engineer",
      "Distinguished Engineer",
      "Lead Software Engineer",
      "Engineering Manager",
      "Director of Engineering",
      "VP of Engineering",

      // Frontend & UI
      "Frontend Web Developer",
      "Junior Frontend Developer",
      "Senior Frontend Developer",
      "Lead Frontend Developer",
      "React Developer",
      "Angular Developer",
      "Vue.js Developer",
      "Svelte Developer",
      "Webmaster",
      "UI Engineer",
      "Creative Technologist",

      // Backend & API
      "Backend Developer",
      "Junior Backend Developer",
      "Senior Backend Developer",
      "Lead Backend Developer",
      "Node.js Developer",
      "Python Developer",
      "Java Developer",
      "C++ Developer",
      "C# / .NET Developer",
      "Golang Developer",
      "Ruby on Rails Developer",
      "PHP Developer",
      "Rust Developer",
      "API Engineer",

      // Full Stack
      "Full Stack Developer",
      "Junior Full Stack Developer",
      "Senior Full Stack Developer",
      "MERN Stack Developer",
      "MEAN Stack Developer",
      "LAMP Stack Developer",
      "Full Stack JavaScript Developer",

      // Mobile Engineering
      "Mobile App Developer",
      "iOS Developer",
      "Senior iOS Developer",
      "Swift Developer",
      "Android Developer",
      "Senior Android Developer",
      "Kotlin Developer",
      "React Native Developer",
      "Flutter Developer",
      "Mobile Architect",

      // Cloud, DevOps & Infrastructure
      "Cloud Engineer",
      "Cloud Architect",
      "AWS Solutions Architect",
      "Azure Cloud Engineer",
      "GCP Cloud Engineer",
      "DevOps Engineer",
      "Senior DevOps Engineer",
      "DevSecOps Engineer",
      "Site Reliability Engineer (SRE)",
      "Release Engineer",
      "Platform Engineer",
      "Infrastructure Engineer",
      "Kubernetes Administrator",

      // Quality Assurance & Testing
      "QA Analyst",
      "QA Tester",
      "Senior QA Tester",
      "Manual Tester",
      "Automation Tester",
      "Software Development Engineer in Test (SDET)",
      "QA Automation Engineer",
      "Lead QA Engineer",
      "Performance Testing Engineer",
      "Security Testing Engineer",

      // Database & Architecture
      "Database Administrator (DBA)",
      "SQL Developer",
      "NoSQL Database Engineer",
      "Data Warehouse Architect",
      "Software Architect",
      "Systems Architect",
      "Enterprise Architect",
      "Solutions Architect",

      // Game Development
      "Game Developer",
      "Senior Game Developer",
      "Unity Developer",
      "Unreal Engine Developer",
      "Gameplay Programmer",
      "Graphics Programmer",
      "Engine Programmer",
      "AR/VR Developer",

      // Embedded & Hardware
      "Embedded Systems Engineer",
      "Firmware Engineer",
      "IoT Engineer",
      "Hardware Engineer",
      "Robotics Engineer",
    ],
  },
  {
    category: "Data & Analytics",
    titles: [
      // Data Analysis & BI
      "Data Analytics Intern",
      "Junior Data Analyst",
      "Data Analyst",
      "Senior Data Analyst",
      "Lead Data Analyst",
      "Quantitative Analyst",
      "Business Data Analyst",
      "Marketing Data Analyst",
      "Financial Data Analyst",
      "Healthcare Data Analyst",
      "Operations Data Analyst",
      "Business Intelligence (BI) Intern",
      "BI Analyst",
      "Senior BI Analyst",
      "BI Developer",
      "Senior BI Developer",
      "BI Engineer",
      "BI Architect",
      "Tableau Developer",
      "Power BI Developer",
      "Looker Developer",

      // Data Science & Machine Learning
      "Data Science Intern",
      "Junior Data Scientist",
      "Data Scientist",
      "Senior Data Scientist",
      "Principal Data Scientist",
      "Lead Data Scientist",
      "Machine Learning Engineer",
      "Senior Machine Learning Engineer",
      "Deep Learning Engineer",
      "Applied Scientist",
      "AI Researcher",
      "NLP Engineer",
      "Computer Vision Engineer",
      "Prompt Engineer",

      // Data Engineering & Architecture
      "Data Engineering Intern",
      "Junior Data Engineer",
      "Data Engineer",
      "Senior Data Engineer",
      "Principal Data Engineer",
      "Lead Data Engineer",
      "Big Data Engineer",
      "Analytics Engineer",
      "Data Warehouse Engineer",
      "ETL Developer",
      "Data Architect",
      "Enterprise Data Architect",
      "Cloud Data Architect",

      // Leadership
      "Data Science Manager",
      "Analytics Manager",
      "BI Manager",
      "Director of Data Science",
      "Director of Analytics",
      "Director of Data Engineering",
      "VP of Data",
      "VP of Analytics",
    ],
  },
  {
    category: "Technology & IT",
    titles: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "MERN Stack Developer",
      "UI/UX Designer",
      "Data Analyst",
      "System Administrator",
      "IT Support Specialist",
      "QA Tester",
      "Python Developer",
      "React Developer",
      "Node.js Developer",
      "Cloud Architect",
      "DevOps Engineer",
    ],
  },
  {
    category: "Product & Design",
    titles: [
      // Product Management
      "Product Management Intern",
      "Associate Product Manager (APM)",
      "Junior Product Manager",
      "Product Manager",
      "Senior Product Manager",
      "Principal Product Manager",
      "Lead Product Manager",
      "Group Product Manager",
      "Technical Product Manager",
      "Growth Product Manager",

      // UX & UI Design
      "UX/UI Design Intern",
      "Junior UX/UI Designer",
      "UX/UI Designer",
      "Senior UX/UI Designer",
      "Lead UX/UI Designer",
      "Principal UX Designer",
      "Product Designer",
      "Senior Product Designer",
      "User Researcher",
      "UX Researcher",
      "Interaction Designer",
      "Visual Designer",
      "Information Architect",

      // Traditional & Creative Design
      "Graphic Design Intern",
      "Junior Graphic Designer",
      "Graphic Designer",
      "Senior Graphic Designer",
      "Art Director",
      "Creative Director",
      "Motion Graphics Designer",
      "3D Artist",
      "Animator",
      "Illustrator",

      // Leadership
      "Head of Product",
      "Director of Product Management",
      "VP of Product",
      "Head of Design",
      "Director of Design",
      "VP of Design",
    ],
  },
  {
    category: "IT Infrastructure & Security",
    titles: [
      // IT Support & Administration
      "IT Intern",
      "IT Support Specialist",
      "Help Desk Technician",
      "Desktop Support Engineer",
      "IT Administrator",
      "System Administrator",
      "Senior System Administrator",

      // Network & Infrastructure
      "Network Administrator",
      "Network Engineer",
      "Senior Network Engineer",
      "Network Architect",
      "Infrastructure Engineer",
      "Infrastructure Architect",
      "Telecommunications Engineer",

      // Cloud & Virtualization
      "Cloud Administrator",
      "Cloud Engineer",
      "Senior Cloud Engineer",
      "Cloud Architect",
      "Virtualization Engineer",
      "AWS Solutions Architect",
      "Azure Administrator",

      // Security & Compliance
      "Cybersecurity Analyst",
      "Senior Cybersecurity Analyst",
      "Information Security Engineer",
      "Security Architect",
      "Penetration Tester",
      "Ethical Hacker",
      "SOC Analyst",
      "Incident Responder",
      "Identity and Access Management (IAM) Engineer",
      "IT Auditor",
      "IT Compliance Specialist",

      // Leadership
      "IT Manager",
      "Senior IT Manager",
      "Director of IT",
      "VP of Information Technology",
      "Director of Cybersecurity",
      "VP of Security",
    ],
  },
  {
    category: "Sales & Business Development",
    titles: [
      // Entry & Inside Sales
      "Sales Intern",
      "Sales Trainee",
      "Sales Development Representative (SDR)",
      "Business Development Representative (BDR)",
      "Inside Sales Representative",
      "Telesales Executive",
      "Lead Generation Specialist",

      // Account Executives & Closing
      "Account Executive (AE)",
      "Senior Account Executive",
      "Enterprise Account Executive",
      "Mid-Market Account Executive",
      "SMB Account Executive",
      "Sales Executive",
      "Senior Sales Executive",

      // Account Management & Client Success
      "Account Manager",
      "Senior Account Manager",
      "Key Account Manager (KAM)",
      "National Account Manager",
      "Strategic Account Manager",
      "Client Relationship Manager",

      // Technical & Pre-Sales
      "Pre-Sales Consultant",
      "Pre-Sales Engineer",
      "Solutions Architect",
      "Solutions Engineer",
      "Sales Engineer",
      "Technical Account Manager (TAM)",

      // Business Development & Partnerships
      "Business Development Executive",
      "Business Development Manager (BDM)",
      "Senior Business Development Manager",
      "Director of Business Development",
      "Partnerships Manager",
      "Channel Sales Manager",
      "Alliances Manager",

      // Sales Leadership & Operations
      "Sales Supervisor",
      "Sales Manager",
      "Regional Sales Manager",
      "Area Sales Manager",
      "National Sales Manager",
      "Director of Sales",
      "VP of Sales",
      "Chief Revenue Officer (CRO)",
      "Sales Operations Analyst",
      "Sales Operations Manager",
      "Sales Enablement Manager",
    ],
  },
  {
    category: "Marketing & Communications",
    titles: [
      // General Marketing
      "Marketing Intern",
      "Marketing Assistant",
      "Marketing Coordinator",
      "Marketing Executive",
      "Marketing Specialist",
      "Marketing Manager",
      "Senior Marketing Manager",
      "Director of Marketing",
      "VP of Marketing",

      // Digital & Performance Marketing
      "Digital Marketing Intern",
      "Digital Marketing Executive",
      "Digital Marketing Manager",
      "Performance Marketer",
      "Growth Hacker",
      "Growth Marketing Manager",
      "SEO Specialist",
      "SEO Manager",
      "SEM/PPC Specialist",
      "Paid Media Manager",
      "Email Marketing Specialist",
      "CRM Manager",

      // Content & Social Media
      "Content Writer",
      "Senior Content Writer",
      "Copywriter",
      "Senior Copywriter",
      "Content Strategist",
      "Content Marketing Manager",
      "Social Media Intern",
      "Social Media Executive",
      "Social Media Manager",
      "Community Manager",
      "Video Editor",
      "Multimedia Specialist",

      // Brand & Product Marketing
      "Brand Ambassador",
      "Brand Executive",
      "Brand Manager",
      "Senior Brand Manager",
      "Director of Brand",
      "Product Marketing Specialist",
      "Product Marketing Manager",
      "Director of Product Marketing",

      // Public Relations & Events
      "PR Intern",
      "PR Executive",
      "Public Relations Specialist",
      "PR Manager",
      "Director of Public Relations",
      "Corporate Communications Manager",
      "Internal Communications Specialist",
      "Event Coordinator",
      "Event Manager",
      "Field Marketing Manager",
    ],
  },

  {
    category: "Finance & Accounting",
    titles: [
      // Accounting & Bookkeeping
      "Finance Intern",
      "Accounting Clerk",
      "Bookkeeper",
      "Junior Accountant",
      "Staff Accountant",
      "Accountant",
      "Senior Accountant",
      "Cost Accountant",
      "Forensic Accountant",
      "Chief Accountant",

      // Financial Planning & Analysis (FP&A)
      "Financial Analyst",
      "Senior Financial Analyst",
      "FP&A Analyst",
      "FP&A Manager",
      "Director of FP&A",

      // Control & Management
      "Assistant Controller",
      "Financial Controller",
      "Corporate Controller",
      "Finance Manager",
      "Senior Finance Manager",
      "Director of Finance",
      "VP of Finance",
      "Chief Financial Officer (CFO)",

      // Audit, Tax & Treasury
      "Auditor",
      "Internal Auditor",
      "Senior Auditor",
      "Audit Manager",
      "Tax Accountant",
      "Tax Consultant",
      "Tax Manager",
      "Director of Tax",
      "Treasury Analyst",
      "Treasury Manager",

      // Payroll & Billing
      "Billing Specialist",
      "Billing Manager",
      "Payroll Clerk",
      "Payroll Specialist",
      "Payroll Administrator",
      "Payroll Manager",
    ],
  },

  {
    category: "Human Resources & Talent Acquisition",
    titles: [
      // General HR & Strategic
      "HR Intern",
      "HR Assistant",
      "HR Coordinator",
      "HR Generalist",
      "Senior HR Generalist",
      "HR Business Partner (HRBP)",
      "Senior HRBP",
      "HR Manager",
      "Senior HR Manager",
      "Director of Human Resources",
      "VP of Human Resources",
      "Chief Human Resources Officer (CHRO)",

      // Talent Acquisition & Recruiting
      "Recruiting Coordinator",
      "Sourcer",
      "Talent Sourcing Specialist",
      "Junior Recruiter",
      "Recruiter",
      "Technical Recruiter",
      "Corporate Recruiter",
      "Executive Recruiter",
      "Talent Acquisition Specialist",
      "Talent Acquisition Manager",
      "Director of Talent Acquisition",

      // Compensation, Benefits & Operations
      "HR Operations Specialist",
      "HRIS Analyst",
      "HRIS Manager",
      "Benefits Administrator",
      "Compensation Analyst",
      "Compensation & Benefits Manager",
      "Total Rewards Manager",

      // Employee Experience & Development
      "Employee Relations Specialist",
      "Employee Relations Manager",
      "Learning & Development (L&D) Coordinator",
      "L&D Specialist",
      "L&D Manager",
      "Instructional Designer",
      "Diversity, Equity & Inclusion (DEI) Specialist",
      "DEI Manager",
      "Director of DEI",
    ],
  },
  {
    category: "Operations & Logistics",
    titles: [
      // General Operations
      "Operations Intern",
      "Operations Assistant",
      "Operations Coordinator",
      "Operations Analyst",
      "Senior Operations Analyst",
      "Operations Manager",
      "Senior Operations Manager",
      "Director of Operations",
      "VP of Operations",

      // Supply Chain & Procurement
      "Supply Chain Intern",
      "Supply Chain Coordinator",
      "Supply Chain Analyst",
      "Supply Chain Manager",
      "Director of Supply Chain",
      "Procurement Assistant",
      "Procurement Specialist",
      "Procurement Manager",
      "Purchasing Agent",
      "Purchasing Manager",
      "Strategic Sourcing Manager",

      // Logistics & Transportation
      "Logistics Coordinator",
      "Logistics Analyst",
      "Logistics Specialist",
      "Logistics Manager",
      "Director of Logistics",
      "Transportation Coordinator",
      "Transportation Manager",
      "Fleet Manager",
      "Dispatch Executive",

      // Warehouse & Inventory
      "Warehouse Associate",
      "Warehouse Worker",
      "Material Handler",
      "Forklift Operator",
      "Warehouse Supervisor",
      "Warehouse Manager",
      "Inventory Clerk",
      "Inventory Analyst",
      "Inventory Controller",
      "Inventory Manager",
    ],
  },
  {
    category: "Customer Support & Success",
    titles: [
      // Frontline Support & Service
      "Customer Service Representative",
      "Senior Customer Service Representative",
      "Customer Support Specialist",
      "Customer Care Executive",
      "Customer Service Supervisor",
      "Customer Service Manager",
      "Call Center Agent",
      "Call Center Manager",

      // Technical Support
      "Technical Support Specialist",
      "Technical Support Engineer",
      "Senior Technical Support Engineer",
      "IT Help Desk Technician",
      "Tier 1 Support",
      "Tier 2 Support",
      "Tier 3 Support",

      // Customer Success & Experience
      "Customer Success Intern",
      "Customer Success Associate",
      "Customer Success Manager (CSM)",
      "Senior Customer Success Manager",
      "Enterprise Customer Success Manager",
      "Director of Customer Success",
      "VP of Customer Success",
      "Customer Experience (CX) Specialist",
      "Customer Experience Manager",
      "Director of Customer Experience",

      // Implementation & Onboarding
      "Onboarding Specialist",
      "Implementation Specialist",
      "Implementation Manager",
      "Client Solutions Specialist",
      "Client Onboarding Manager",
    ],
  },
  {
    category: "Healthcare & Medical",
    titles: [
      // Nursing & Clinical Support
      "Nursing Intern",
      "Registered Nurse (RN)",
      "Licensed Practical Nurse (LPN)",
      "Nurse Practitioner (NP)",
      "Clinical Nurse Specialist",
      "Director of Nursing",
      "Chief Nursing Officer (CNO)",
      "Medical Assistant",
      "Nursing Assistant (CNA)",
      "Ward Boy / Attendant",

      // Physicians & Specialists
      "Resident Physician",
      "General Practitioner (GP)",
      "Physician Assistant (PA)",
      "Surgeon",
      "Pediatrician",
      "Cardiologist",
      "Neurologist",
      "Psychiatrist",
      "Chief Medical Officer (CMO)",

      // Therapy & Rehabilitation
      "Physical Therapist",
      "Occupational Therapist",
      "Speech-Language Pathologist",
      "Respiratory Therapist",
      "Massage Therapist",
      "Behavioral Therapist",

      // Pharmacy & Laboratory
      "Pharmacist",
      "Clinical Pharmacist",
      "Pharmacy Technician",
      "Phlebotomist",
      "Medical Laboratory Technician",
      "Clinical Research Associate",
      "Clinical Research Coordinator",

      // Administration & Operations
      "Healthcare Administrator",
      "Clinic Manager",
      "Hospital Administrator",
      "Medical Receptionist",
      "Medical Billing Specialist",
      "Medical Coder",
      "Health Information Manager",

      // Dental & Vision
      "Dentist",
      "Dental Hygienist",
      "Dental Assistant",
      "Optometrist",
      "Optician",
    ],
  },
  {
    category: "Education & Training",
    titles: [
      // K-12 & Early Education
      "Preschool Teacher",
      "Kindergarten Teacher",
      "Elementary School Teacher",
      "Middle School Teacher",
      "High School Teacher",
      "Special Education Teacher",
      "Substitute Teacher",
      "Teaching Assistant (TA)",

      // Higher Education & Academia
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Adjunct Professor",
      "Lecturer",
      "Research Assistant",
      "Postdoctoral Researcher",
      "Dean",
      "Provost",
      "University Chancellor",

      // Administration & Student Services
      "School Principal",
      "Vice Principal",
      "Superintendent",
      "Academic Coordinator",
      "Education Counselor",
      "Guidance Counselor",
      "Admissions Counselor",
      "Registrar",
      "Librarian",

      // Corporate Training & EdTech
      "Corporate Trainer",
      "Technical Trainer",
      "Instructional Designer",
      "Senior Instructional Designer",
      "Curriculum Developer",
      "E-Learning Specialist",
      "Learning and Development (L&D) Specialist",
      "Subject Matter Expert (SME)",

      // Tutoring & Coaching
      "Tutor",
      "Test Prep Instructor",
      "ESL Instructor",
      "Language Teacher",
      "Sports Coach",
    ],
  },
  {
    category: "Legal & Compliance",
    titles: [
      // Legal Practice & Support
      "Legal Intern",
      "Legal Assistant",
      "Legal Secretary",
      "Paralegal",
      "Law Clerk",
      "Contract Administrator",
      "Contract Manager",
      "Associate Attorney",
      "Attorney / Lawyer",
      "Litigation Attorney",
      "Corporate Counsel",
      "Senior Counsel",
      "General Counsel",
      "Chief Legal Officer (CLO)",

      // Compliance & Risk
      "Compliance Intern",
      "Compliance Analyst",
      "Compliance Specialist",
      "Compliance Manager",
      "Director of Compliance",
      "Chief Compliance Officer (CCO)",
      "Risk Analyst",
      "Risk Manager",
      "Director of Risk Management",
      "Data Privacy Officer (DPO)",
    ],
  },
  {
    category: "Retail & Consumer Services",
    titles: [
      // Store Floor & Customer Service
      "Retail Cashier",
      "Retail Sales Associate",
      "Senior Sales Associate",
      "Customer Service Representative",
      "Personal Shopper",
      "Beauty Advisor",
      "Retail Pharmacist",

      // Store Management
      "Shift Supervisor",
      "Team Lead",
      "Assistant Store Manager",
      "Store Manager",
      "General Manager (Retail)",
      "Area Manager",
      "District Manager",
      "Regional Director",

      // Merchandising & Buying
      "Merchandiser",
      "Visual Merchandiser",
      "Merchandise Planner",
      "Retail Buyer",
      "Senior Buyer",
      "Category Manager",
      "Director of Merchandising",
    ],
  },
  {
    category: "Hospitality & Food Service",
    titles: [
      // Front of House (FOH)
      "Host/Hostess",
      "Waiter/Waitress",
      "Server",
      "Bartender",
      "Barback",
      "Sommelier",
      "Barista",
      "Shift Leader",
      "Restaurant Supervisor",
      "Maitre D'",

      // Back of House (BOH) & Culinary
      "Dishwasher",
      "Prep Cook",
      "Line Cook",
      "Pastry Chef",
      "Sous Chef",
      "Executive Sous Chef",
      "Chef de Cuisine",
      "Executive Chef",
      "Kitchen Manager",

      // Management & Hotel Operations
      "Restaurant Manager",
      "General Manager (Hospitality)",
      "Food & Beverage (F&B) Manager",
      "Catering Manager",
      "Banquet Manager",
      "Front Desk Agent",
      "Night Auditor",
      "Concierge",
      "Hotel Manager",
      "Housekeeping Staff",
      "Housekeeping Manager",
      "Director of Rooms",
    ],
  },
  {
    category: "Manufacturing & Production",
    titles: [
      // Floor & Assembly
      "Assembly Line Worker",
      "Production Worker",
      "Machine Operator",
      "CNC Machinist",
      "Welder",
      "Fabricator",
      "Packaging Operator",
      "Material Handler",

      // Management & Operations
      "Production Supervisor",
      "Production Manager",
      "Plant Manager",
      "Operations Manager (Manufacturing)",
      "Shift Manager",

      // Quality & Engineering
      "Quality Control (QC) Inspector",
      "Quality Assurance (QA) Analyst",
      "QA Manager",
      "Manufacturing Engineer",
      "Industrial Engineer",
      "Process Engineer",
      "Maintenance Technician",
      "Maintenance Supervisor",
      "Reliability Engineer",
    ],
  },
  {
    category: "Construction & Real Estate",
    titles: [
      // Trades & Labor
      "Construction Laborer",
      "Carpenter",
      "Electrician",
      "Journeyman Electrician",
      "Plumber",
      "HVAC Technician",
      "Heavy Equipment Operator",
      "Painter",
      "Mason",
      "Welder",

      // Site Management & Engineering
      "Foreman",
      "Site Supervisor",
      "Construction Superintendent",
      "Construction Manager",
      "Project Manager (Construction)",
      "Estimator",
      "Project Engineer",
      "Civil Engineer",
      "Structural Engineer",
      "Architect",
      "Safety Officer",

      // Real Estate & Property Management
      "Real Estate Agent",
      "Real Estate Broker",
      "Commercial Real Estate Agent",
      "Property Manager",
      "Assistant Property Manager",
      "Leasing Consultant",
      "Leasing Manager",
      "Facilities Manager",
      "Facilities Director",
    ],
  },
];

export default function ElasticTitleDropdown({ value, onChange, hasError }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = JOB_CATEGORIES.map((group) => {
    const matchedTitles = group.titles.filter((title) =>
      title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const categoryMatches = group.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return {
      ...group,
      titles:
        categoryMatches && matchedTitles.length === 0
          ? group.titles
          : matchedTitles,
    };
  }).filter((group) => group.titles.length > 0);

  // FACT: Check if exact match exists to decide whether to show the custom add button
  const exactMatchExists = JOB_CATEGORIES.some((group) =>
    group.titles.some(
      (title) => title.toLowerCase() === searchTerm.toLowerCase().trim(),
    ),
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 pl-10 bg-white border rounded-xl flex items-center justify-between cursor-pointer focus-within:ring-2 transition-all ${
          hasError
            ? "border-red-500 bg-red-50 focus-within:ring-red-200"
            : "border-gray-200 bg-gray-50 hover:bg-white focus-within:ring-blue-100 focus-within:border-blue-500"
        }`}
      >
        <Briefcase
          className="absolute left-3 top-3.5 text-gray-400"
          size={18}
        />
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
          {value || "Select or type a job title..."}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search roles or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {/* FACT: THE CUSTOM TITLE INJECTION BUTTON */}
            {searchTerm.trim().length > 0 && !exactMatchExists && (
              <div
                onClick={() => {
                  onChange(searchTerm.trim());
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg cursor-pointer flex items-center justify-between hover:bg-blue-100 transition-colors shadow-sm"
              >
                <span className="font-medium text-sm">
                  Use custom title:{" "}
                  <strong className="font-extrabold">
                    "{searchTerm.trim()}"
                  </strong>
                </span>
                <Plus size={16} />
              </div>
            )}

            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm.trim().length > 0
                  ? "Click the button above to use this exact title."
                  : "Start typing to search or create a title."}
              </div>
            ) : (
              filteredCategories.map((group, idx) => (
                <div key={idx} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50 rounded-md mb-1">
                    {group.category}
                  </div>
                  {group.titles.map((title, tIdx) => (
                    <div
                      key={tIdx}
                      onClick={() => {
                        onChange(title);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                        value === title
                          ? "bg-blue-600 text-white font-bold"
                          : "text-gray-700 hover:bg-gray-100 font-medium"
                      }`}
                    >
                      {title}
                      {value === title && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
