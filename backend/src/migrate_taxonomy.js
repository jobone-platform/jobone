import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import connectDB from "./configs/db.js";
import Job from "./models/jobs.js";
import Employer from "./models/employer.js";

const JOB_TAXONOMY_MAP = {
  // IT & Software
  "Senior React.js Developer": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "Frontend Development" },
  "Full Stack MERN Developer": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "Full Stack Development" },
  "Backend Node.js Engineer": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "Backend Development" },
  "Python & AI Systems Developer": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "AI & Machine Learning" },
  "Junior Frontend Web Developer (0–1 yr)": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "Frontend Development" },
  "DevOps & Cloud Infrastructure Engineer": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "DevOps & Cloud" },
  "Data Analyst & BI Specialist": { industry: "Information Technology & Software", department: "Data, Analytics & AI", subdomain: "Data Analytics & BI" },
  "QA Automation & Testing Engineer": { industry: "Information Technology & Software", department: "Quality Assurance & Safety", subdomain: "Quality Assurance" },
  "UI/UX Product Designer": { industry: "Information Technology & Software", department: "Design & Creative", subdomain: "UI/UX & Product Design" },
  "Web Development Intern": { industry: "Information Technology & Software", department: "Engineering & Development", subdomain: "Web Development" },

  // Banking & Finance
  "Financial Analyst — Corporate Advisory": { industry: "Banking & Financial Services", department: "Finance & Accounting", subdomain: "Corporate Advisory" },
  "Senior Accountant & GST Specialist": { industry: "Banking & Financial Services", department: "Finance & Accounting", subdomain: "Accounting & Taxation" },
  "Banking Operations Executive": { industry: "Banking & Financial Services", department: "Operations & Logistics", subdomain: "Banking Operations" },
  "Credit Risk Analyst": { industry: "Banking & Financial Services", department: "Finance & Accounting", subdomain: "Risk & Compliance" },

  // Sales & Marketing -> Advertising & Digital Marketing
  "Enterprise B2B Sales Executive": { industry: "Advertising & Digital Marketing", department: "Sales & Business Development", subdomain: "B2B Sales" },
  "Performance & Digital Marketing Manager": { industry: "Advertising & Digital Marketing", department: "Marketing & Growth", subdomain: "Performance Marketing" },
  "SEO & Content Marketing Specialist": { industry: "Advertising & Digital Marketing", department: "Marketing & Growth", subdomain: "Content & SEO" },
  "Business Development Associate (Fresher Friendly)": { industry: "Advertising & Digital Marketing", department: "Sales & Business Development", subdomain: "Business Development" },

  // Healthcare & Pharma
  "Clinical Research Coordinator": { industry: "Pharmaceuticals & Biotechnology", department: "Clinical & Healthcare Operations", subdomain: "Clinical Research" },
  "Hospital Operations Administrator": { industry: "Healthcare & Medical Services", department: "Administration & Workplace", subdomain: "Hospital Administration" },
  "Medical Representative (Pharma Sales)": { industry: "Pharmaceuticals & Biotechnology", department: "Sales & Business Development", subdomain: "Pharma Sales" },

  // Engineering & Manufacturing
  "Mechanical Design & CAD Engineer": { industry: "Manufacturing & Industrial Engineering", department: "Engineering & Development", subdomain: "Mechanical Design" },
  "Quality Assurance & Control Engineer": { industry: "Manufacturing & Industrial Engineering", department: "Quality Assurance & Safety", subdomain: "Quality Assurance" },
  "Industrial Automation Engineer": { industry: "Manufacturing & Industrial Engineering", department: "Engineering & Development", subdomain: "Industrial Automation" },

  // Operations & Logistics -> Transportation & Logistics
  "Supply Chain Operations Coordinator": { industry: "Transportation & Logistics", department: "Operations & Logistics", subdomain: "Supply Chain" },
  "Warehouse Hub Manager": { industry: "Transportation & Logistics", department: "Operations & Logistics", subdomain: "Warehousing & Inventory" },
  "E-Commerce Last-Mile Logistics Lead": { industry: "Transportation & Logistics", department: "Operations & Logistics", subdomain: "Last-Mile Delivery" },

  // Customer Support -> mapped to employer's genuine industry with Customer Support department
  "Customer Success Specialist": { industry: "Retail & E-Commerce", department: "Customer Support & Success", subdomain: "Customer Success" },
  "Technical Support Engineer (L2)": { industry: "Information Technology & Software", department: "Customer Support & Success", subdomain: "Technical Support" },
  "Omnichannel Helpdesk Representative": { industry: "Retail & E-Commerce", department: "Customer Support & Success", subdomain: "Helpdesk & Support" },

  // HR & Admin -> mapped to employer's genuine industry with HR department
  "Talent Acquisition Specialist — Tech Hiring": { industry: "Information Technology & Software", department: "Human Resources & Talent Acquisition", subdomain: "Talent Acquisition" },
  "HR Generalist & Payroll Compliance Executive": { industry: "Banking & Financial Services", department: "Human Resources & Talent Acquisition", subdomain: "HR & Payroll Compliance" },
};

const EMPLOYER_MAP = {
  "TechNova Solutions": "Information Technology & Software",
  "FinEdge Consulting": "Banking & Financial Services",
  "HealthPlus Healthcare": "Healthcare & Medical Services",
  "BrightScale Marketing": "Advertising & Digital Marketing",
  "CloudMatrix Systems": "Information Technology & Software",
  "SecureCore Technologies": "Manufacturing & Industrial Engineering",
  "UrbanLogix": "Transportation & Logistics",
  "NextGen Retail": "Retail & E-Commerce",
};

async function runMigration() {
  await connectDB();
  console.log("Connected to MongoDB. Starting Taxonomy Migration...");

  // 1. Migrate Jobs
  const jobs = await Job.find({}).lean();
  let updatedJobsCount = 0;

  for (const job of jobs) {
    const mapping = JOB_TAXONOMY_MAP[job.title];
    if (mapping) {
      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            industry: mapping.industry,
            department: mapping.department,
            subdomain: mapping.subdomain,
            previousTaxonomy: {
              industry: job.industry,
              subdomain: job.subdomain,
            },
          },
        }
      );
      updatedJobsCount++;
    } else {
      // General fallback if title not explicitly listed
      let targetInd = "Information Technology & Software";
      if (job.industry === "Banking & Finance") targetInd = "Banking & Financial Services";
      else if (job.industry === "Healthcare & Pharma") targetInd = "Healthcare & Medical Services";
      else if (job.industry === "Engineering & Manufacturing") targetInd = "Manufacturing & Industrial Engineering";
      else if (job.industry === "Operations & Logistics") targetInd = "Transportation & Logistics";
      else if (job.industry === "Sales & Marketing") targetInd = "Advertising & Digital Marketing";
      else if (job.industry === "Education & EdTech") targetInd = "Education & EdTech";

      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            industry: targetInd,
            department: job.department || "Operations & Logistics",
            previousTaxonomy: {
              industry: job.industry,
              subdomain: job.subdomain,
            },
          },
        }
      );
      updatedJobsCount++;
    }
  }
  console.log(`Successfully migrated ${updatedJobsCount} job records.`);

  // 2. Migrate Employers
  let updatedEmployersCount = 0;
  for (const [companyName, newInd] of Object.entries(EMPLOYER_MAP)) {
    const res = await Employer.updateMany(
      { companyName },
      { $set: { industry: newInd } }
    );
    updatedEmployersCount += res.modifiedCount;
  }
  console.log(`Successfully updated ${updatedEmployersCount} employer profiles.`);

  // 3. Print Post-Migration Breakdown
  const newCounts = await Job.aggregate([
    { $group: { _id: { industry: "$industry", department: "$department" }, count: { $sum: 1 } } },
    { $sort: { "_id.industry": 1 } },
  ]);
  console.log("New Job Distribution by Industry & Department:", JSON.stringify(newCounts, null, 2));

  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

