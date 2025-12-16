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
import face4 from '../../../../assets/images/faces/4.jpg';
import face5 from '../../../../assets/images/faces/5.jpg';
import face8 from '../../../../assets/images/faces/8.jpg';
import face9 from '../../../../assets/images/faces/9.jpg';
import face10 from '../../../../assets/images/faces/10.jpg';
import face11 from '../../../../assets/images/faces/11.jpg';
import face13 from '../../../../assets/images/faces/13.jpg';
import face14 from '../../../../assets/images/faces/14.jpg';


type ContactRow = {
    id: number;
    companyName: string;
    companyLogo: string;
    email: string;
    phone: string;
    employeeBadge: string;
    industry: string;
    personName: string;
    personImage: string;
    score: number;
    badgeColor: string;
  };
 export const CompaniesTable: ContactRow[] = [
    {
      id: 1,
      companyName: "Tech Innovations",
      companyLogo: comppanyLogo1,
      email: "contact@techinnovations.com",
      phone: "(123) 456-7890",
      employeeBadge: "200+ employees",
      industry: "Technology",
      personName: "John Doe",
      personImage:face14,
      score: 150,
      badgeColor: "primary-transparent",
    },
    {
      id: 2,
      companyName: "Creative Solutions",
      companyLogo: comppanyLogo3,
      email: "info@creativesolutions.com",
      phone: "(987) 654-3210",
      employeeBadge: "50-100 employees",
      industry: "Marketing",
      personName: "Jane Smith",
      personImage: face1,
      score: 75,
      badgeColor: "danger-transparent",
    },
    {
      id: 3,
      companyName: "Future Enterprises",
      companyLogo: comppanyLogo4,
      email: "sales@futureenterprises.com",
      phone: "(555) 123-4567",
      employeeBadge: "(555) 123-4567",
      industry: "E-Commerce",
      personName: "Emily Johnson",
      personImage: face4,
      score: 120,
      badgeColor: "success-transparent",
    },
    {
      id: 4,
      companyName: "Innovate Global",
      companyLogo: comppanyLogo5,
      email: "hello@innovateglobal.com",
      phone: "(333) 777-8888",
      employeeBadge: "500+ employees",
      industry: "Manufacturing",
      personName: "Michael Brown",
      personImage: face11,
      score: 200,
      badgeColor: "light text-default",
    },
    {
      id: 5,
      companyName: "DesignWorks",
      companyLogo: comppanyLogo6,
      email: "contact@designworks.com",
      phone: "(222) 333-4444",
      employeeBadge: "20-50 employees",
      industry: "Design",
      personName: "Sara White",
      personImage: face8,
      score: 35,
      badgeColor: "pink-transparent",
    },
    {
        id: 6,
        companyName: "GreenTech",
        companyLogo: comppanyLogo7,
        email: "support@greentech.com",
        phone: "support@greentech.com",
        employeeBadge: "50-100 employees",
        industry: "Renewable Energy",
        personName: "David Lee",
        personImage: face13,
        score: 80,
        badgeColor: "danger-transparent",
      },
      {
        id: 7,
        companyName: "Tech Pros",
        companyLogo: comppanyLogo8,
        email: "info@techpros.com",
        phone: "(888) 999-0000",
        employeeBadge: "100-500 employees",
        industry: "IT Services",
        personName: "Olivia Green",
        personImage: face5,
        score: 65,
        badgeColor: "primary-transparent",
      },
      {
        id: 8,
        companyName: "Innovators Inc",
        companyLogo: comppanyLogo9,
        email: "contact@innovatorsinc.com",
        phone: "(777) 888-9999",
        employeeBadge: "200+ employees",
        industry: "Consulting",
        personName: "Liam Turner",
        personImage: face9,
        score: 110,
        badgeColor: "warning-transparent",
      },
      {
        id: 9,
        companyName: "Future Vision",
        companyLogo: comppanyLogo10,
        email: "info@futurevision.com",
        phone: "(555) 111-2222",
        employeeBadge: "10-20 employees",
        industry: "Media",
        personName: "Mia Martinez",
        personImage: face1,
        score: 50,
        badgeColor: "success-transparent",
      },
      {
        id: 10,
        companyName: "Green Future",
        companyLogo: comppanyLogo2,
        email: "support@greenfuture.com",
        phone: "(444) 222-3333",
        employeeBadge: "100-500 employees",
        industry: "Sustainable Tech",
        personName: "Noah Harris",
        personImage: face10,
        score: 130,
        badgeColor: "light text-default",
      }
  ];

  interface selectdata {
    value: string;
    label: string;
  }
  export const Selectdata: selectdata[] = [
    { value: 'Company Size', label: 'Company Size' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Small Business', label: 'Small Business' },
    { value: 'Micro Business', label: 'Micro Business' },
    { value: 'Startup', label: 'Startup' },
    { value: 'Large Enterprise', label: 'Large Enterprise' },
    { value: 'Medium Size', label: 'Medium Size' },
  ];
  
  export const Selectdatas: selectdata[] = [
    { value: 'Select Insustry', label: 'Select Insustry' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'Education', label: 'Education' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Healthcare', label: 'Healthcare' }
  ];