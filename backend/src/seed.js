import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/admin.js";
import Employer from "./models/employer.js";
import User from "./models/users.js";

dotenv.config();

const mongoUrl = process.env.SEED_MONGO_URL || process.env.MONGO_URL;
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);

function isLocalMongoUrl(value) {
  try {
    const { hostname } = new URL(value);
    return localHosts.has(hostname.replace(/^\[|\]$/g, "").toLowerCase());
  } catch {
    return false;
  }
}

if (!mongoUrl) {
  throw new Error("Set MONGO_URL or SEED_MONGO_URL before running the seed script.");
}

if (!isLocalMongoUrl(mongoUrl) && process.env.ALLOW_REMOTE_SEED !== "true") {
  throw new Error(
    "Refusing to seed a remote MongoDB database. Set SEED_MONGO_URL to a local URI, or set ALLOW_REMOTE_SEED=true to explicitly allow remote seeding.",
  );
}

const makePassword = () => randomBytes(24).toString("base64url");
const accounts = [];

async function createSeedAccount(Model, email, name, fields = {}, hashPassword = false) {
  const existing = await Model.findOne({ email });
  if (existing) {
    console.log(`Skipped existing ${Model.modelName}: ${email}`);
    return;
  }

  const password = makePassword();
  const storedPassword = hashPassword ? await bcrypt.hash(password, 10) : password;
  await new Model({ name, email, password: storedPassword, ...fields }).save();
  accounts.push({ type: Model.modelName, email, password });
}

try {
  await mongoose.connect(mongoUrl);

  await createSeedAccount(
    Admin,
    process.env.SEED_ADMIN_EMAIL || "seed.admin@jobone.test",
    "Seed Admin",
    { role: "superAdmin" },
  );
  await createSeedAccount(
    Employer,
    process.env.SEED_EMPLOYER_EMAIL || "seed.employer@jobone.test",
    "Seed Employer",
    { companyName: "JobOne Test Company", isVerified: true, isApproved: "approved" },
    true,
  );
  await createSeedAccount(
    User,
    process.env.SEED_JOBSEEKER_EMAIL || "seed.jobseeker@jobone.test",
    "Seed Job Seeker",
    { isVerified: true },
    true,
  );

  if (accounts.length) {
    console.log("Created seed accounts. Save these generated passwords; they are only shown once:");
    for (const account of accounts) {
      console.log(`${account.type}: ${account.email} | password: ${account.password}`);
    }
  } else {
    console.log("All seed accounts already exist; no changes made.");
  }
} finally {
  await mongoose.disconnect();
}
