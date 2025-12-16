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
import face9 from '../../../../assets/images/faces/9.jpg';
import face10 from '../../../../assets/images/faces/10.jpg';
import face11 from '../../../../assets/images/faces/11.jpg';
import face13 from '../../../../assets/images/faces/13.jpg';
import face15 from '../../../../assets/images/faces/15.jpg';

interface Leads {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    companyLogo: string;
    companyName: string;
    source: string;
    tags: { label: string; color: string }[];
    avatar: string;
};

export const Leadsdata: Leads[] = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "(123) 456-7890",
        status: "New Lead",
        companyLogo: comppanyLogo1,
        companyName: "ABC Corp",
        source: "Web",
        tags: [
            { label: "Interested", color: "primary-transparent" },
            { label: "VIP", color: "primary-transparent" }
          ],
        avatar: face9
    },
    {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "(987) 654-3210",
        status: "Contacted",
        companyLogo: comppanyLogo3,
        companyName: "XYZ Ltd",
        source: "Referral",
        tags: [
            { label: "Follow-up", color: "primary-transparent" },
          ],
        avatar: face1
    },
    {
        id: "3",
        name: "Emily Johnson",
        email: "emily.johnson@example.com",
        phone: "(555) 123-4567",
        status: "Qualified",
        companyLogo: comppanyLogo4,
        companyName: "FutureTech",
        source: "Social Media",
        tags: [
            { label: "High Priority", color: "success-transparent" },
            { label: "VIP", color: "primary-transparent" }
          ],
        avatar: face2
    },
    {
        id: "4",
        name: "Michael Brown",
        email: "michael.brown@example.com",
        phone: "(333) 777-8888",
        status: "Negotiation",
        companyLogo: comppanyLogo5,
        companyName: "Innovate Solutions",
        source: "Web",
        tags: [
            { label: "Potential", color: "light text-default" },
          ],
        avatar: face10
    },
    {
        id: "5",
        name: "Sara White",
        email: "sara.white@example.com",
        phone: "(222) 333-4444",
        status: "Lead Closed",
        companyLogo: comppanyLogo6,
        companyName: "DesignWorks",
        source: "Event",
        tags: [
            { label: "Coverted", color: "pink-transparent" },
          ],
        avatar: face3
    },
    {
        id: "6",
        name: "David Lee",
        email: "david.lee@example.com",
        phone: "(444) 555-6666",
        status: "Contacted",
        companyLogo: comppanyLogo7,
        companyName: "Tech Innovations",
        source: "Referral",
        tags: [
            { label: "Follow-up", color: "danger-transparent" },
          ],
        avatar: face11
    },
    {
        id: "7",
        name: "Olivia Green",
        email: "olivia.green@example.com",
        phone: "(555) 777-8888",
        status: "Contacted",
        companyLogo: comppanyLogo8,
        companyName: "GreenTech",
        source: "Web",
        tags: [
            { label: "Interested", color: "warning-transparent" },
            { label: "VIP", color: "purple-transparent" }
          ],
        avatar: face4
    },
    {
        id: "8",
        name: "Liam Turner",
        email: "liam.turner@example.com",
        phone: "(888) 999-0000",
        status: "Negotiation",
        companyLogo: comppanyLogo9,
        companyName: "Innovators Inc",
        source: "Event",
        tags: [
            { label: "Potential", color: "success-transparent" },
          ],
        avatar: face13
    },
    {
        id: "9",
        name: "Mia Martinez",
        email: "mia.martinez@example.com",
        phone: "(777) 888-9999",
        status: "Qualified",
        companyLogo: comppanyLogo10,
        companyName: "Creativa Solutions",
        source: "Social Media",
        tags: [
            { label: "VIP", color: "primary-transparent" }
          ],
        avatar: face5
    },
    {
        id: "10",
        name: "Noah Harris",
        email: "noah.harris@example.com",
        phone: "(444) 222-3333",
        status: "Lead Closed",
        companyLogo: comppanyLogo2,
        companyName: "GreenFuture",
        source: "Referral",
        tags: [
            { label: "Converted", color: "primary-transparent" },
          ],
        avatar: face15
    }
];


interface Selecttype {
    value: string;
    label: string;
}
export const Tagselect: Selecttype[] = [
    { value: 'New Lead', label: 'New Lead' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Hot Lead', label: 'Hot Lead' },
    { value: 'Partner', label: 'Partner' },
    { value: 'LostCustomer', label: 'LostCustomer' },
    { value: 'Influencer', label: 'Influencer' },
    { value: 'Subscriber', label: 'Subscriber' }
];

export const LeadsSelect: Selecttype[] = [
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Direct mail', label: 'Direct mail' },
    { value: 'Blog Articles', label: 'Blog Articles' },
    { value: 'Affiliates', label: 'Affiliates' },
    { value: 'Organic search', label: 'Organic search' }
];

interface data2 {
    value: string;
    label: string;
}
export const StatusSelect: data2[] = [
    { value: 'Select Status', label: 'Select Status' },
    { value: 'New', label: 'New' },
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Disqualified', label: 'Disqualified' },
    { value: 'Qualified', label: 'Qualified' }
];