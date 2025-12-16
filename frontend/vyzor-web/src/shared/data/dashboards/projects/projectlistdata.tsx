import comppanyLogo1 from '../../../../assets/images/company-logos/1.png';
import comppanyLogo2 from '../../../../assets/images/company-logos/2.png';
import comppanyLogo3 from '../../../../assets/images/company-logos/3.png';
import comppanyLogo4 from '../../../../assets/images/company-logos/4.png';
import comppanyLogo5 from '../../../../assets/images/company-logos/5.png';
import comppanyLogo6 from '../../../../assets/images/company-logos/6.png';
import comppanyLogo7 from '../../../../assets/images/company-logos/7.png';
import comppanyLogo8 from '../../../../assets/images/company-logos/8.png';
import comppanyLogo9 from '../../../../assets/images/company-logos/9.png';
import comppanyLogo10 from '../../../../assets/images/company-logos/10.png';

import face1 from '../../../../assets/images/faces/1.jpg';
import face2 from '../../../../assets/images/faces/2.jpg';
import face3 from '../../../../assets/images/faces/3.jpg';
import face4 from '../../../../assets/images/faces/4.jpg';
import face5 from '../../../../assets/images/faces/5.jpg';
import face6 from '../../../../assets/images/faces/6.jpg';
import face7 from '../../../../assets/images/faces/7.jpg';
import face8 from '../../../../assets/images/faces/8.jpg';
import face9 from '../../../../assets/images/faces/9.jpg';
import face10 from '../../../../assets/images/faces/10.jpg';
import face11 from '../../../../assets/images/faces/11.jpg';
import face12 from '../../../../assets/images/faces/12.jpg';
import face13 from '../../../../assets/images/faces/13.jpg';
import face14 from '../../../../assets/images/faces/14.jpg';
import face15 from '../../../../assets/images/faces/15.jpg';
import face16 from '../../../../assets/images/faces/16.jpg';

export interface Project {
    name: string;
    companyLogo: string;
    companyName: string;
    startDate: string;
    endDate: string;
    status: string;
    budget: string;
    team: string[];
    extraTeam: number;
    priority: "High" | "Medium" | "Low";
}

export const projectData: Project[] = [
    {
        name: "Website Redesign",
        companyLogo: comppanyLogo1,
        companyName: "ABC Corp",
        startDate: "2025-01-10",
        endDate: "2025-03-15",
        status: "In Progress",
        budget: "$15,000",
        team: [
            face2,
            face8,
            face2,
            face10,
        ],
        extraTeam: 2,
        priority: "High"
    },
    {
        name: "Mobile App",
        companyLogo: comppanyLogo2,
        companyName: "XYZ Ltd",
        startDate: "2025-02-01",
        endDate: "2025-04-20",
        status: "Completed",
        budget: "$25,000",
        team: [
            face12,
            face9,
            face11,
        ],
        extraTeam: 4,
        priority: "Medium"
    },
    {
        name: "E-commerce Platform",
        companyLogo: comppanyLogo3,
        companyName: "FutureTech",
        startDate: "2025-03-05",
        endDate: "2025-05-30",
        status: "In Progress",
        budget: "$50,000",
        team: [
            face5,
            face6,
        ],
        extraTeam: 1,
        priority: "High"
    },
    {
        name: "CRM System",
        companyLogo: comppanyLogo4,
        companyName: "Innovate Solutions",
        startDate: "2025-01-15",
        endDate: "2025-04-05",
        status: "Delayed",
        budget: "$20,000",
        team: [
            face3,
            face9,
            face12,
            face11,
        ],
        extraTeam: 2,
        priority: "Low"
    },
    {
        name: "Content Management System",
        companyLogo: comppanyLogo5,
        companyName: "DesignWorks",
        startDate: "2025-02-20",
        endDate: "2025-05-01",
        status: "Completed",
        budget: "$18,000",
        team: [
            face10,
            face2,
            face1,
        ],
        extraTeam: 1,
        priority: "Medium"
    },
    {
        name: "Analytics Dashboard",
        companyLogo: comppanyLogo6,
        companyName: "GreenTech",
        startDate: "2025-03-01",
        endDate: "2025-06-15",
        status: "In Progress",
        budget: "$30,000",
        team: [
            face7,
            face13,
        ],
        extraTeam: 0,
        priority: "High"
    },
    {
        name: "AI Integration",
        companyLogo: comppanyLogo7,
        companyName: "Tech Innovations",
        startDate: "2025-03-10",
        endDate: "2025-07-01",
        status: "Not Started",
        budget: "$40,000",
        team: [
            face5,
            face14,
            face15,
        ],
        extraTeam: 2,
        priority: "High"
    },
    {
        name: "SEO Optimization",
        companyLogo: comppanyLogo8,
        companyName: "Creativa Solutions",
        startDate: "2025-01-25",
        endDate: "2025-03-10",
        status: "Completed",
        budget: "$8,000",
        team: [
            face13,
            face16,
        ],
        extraTeam: 2,
        priority: "Medium"
    },
    {
        name: "HR Management System",
        companyLogo: comppanyLogo9,
        companyName: "Innovators Inc",
        startDate: "2025-04-01",
        endDate: "2025-07-01",
        status: "In Progress",
        budget: "$12,000",
        team: [
            face1,
            face15,
            face12,
            face8,
        ],
        extraTeam: 7,
        priority: "Medium"
    },
    {
        name: "Project Management Tool",
        companyLogo: comppanyLogo10,
        companyName: "GreenFuture",
        startDate: "2025-02-10",
        endDate: "2025-02-10",
        status: "Delayed",
        budget: "$22,000",
        team: [
            face5,
            face11,
            face13,
        ],
        extraTeam: 4,
        priority: "Low"
    }
];

export const Projectselectdata = [
    { value: 'Newest', label: 'Newest' },
    { value: 'Date Added', label: 'Date Added' },
    { value: 'Type', label: 'Type' },
    { value: 'A - Z', label: 'A - Z' },
]

export const AvatarImages: string[] = [
    face1,
    face2,
    face8,
    face12,
    face10,
    face4,
    face5,
    face13
  ];
