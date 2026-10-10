import React from "react";

export default function Services() {
return(
<section id="services" className="container mx-auto px-6 py-30">
    <h3 className="text-3xl font-bold text-center mb-10 text-blue-700">
        Our Services
    </h3>
    <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Job Listings</h4>
            <p className="text-gray-600">
                Browse thousands of job opportunities tailored for you.
            </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Resume Builder</h4>
            <p className="text-gray-600">
                Create professional resumes to stand out from the crowd.
            </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg">
            <h4 className="text-xl font-semibold mb-4">Career Guidance</h4>
            <p className="text-gray-600">
                Get expert advice to build and grow your career.
            </p>
        </div>
    </div>
</section>
)}