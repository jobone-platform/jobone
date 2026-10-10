import React from "react";

export default function CompanyDisplay({ job, fallback = "Confidential Employer", className = "" }) {
  if (!job) return <span className={className}>{fallback}</span>;
  
  let agencyName = job.postedByCompany || job.postedByName || fallback;
  if (typeof agencyName === 'object' && agencyName !== null) {
    agencyName = agencyName.companyName || agencyName.name || fallback;
  }
  
  if (job.isThirdPartyRecruiting && job.showHiringCompanyName && job.hiringCompanyName) {
    return (
      <span className={className}>
        {job.hiringCompanyName} 
        <span className="text-xs italic text-slate-400 ml-1.5 font-normal">
          (Via {agencyName})
        </span>
      </span>
    );
  }
  
  return <span className={className}>{agencyName}</span>;
}
