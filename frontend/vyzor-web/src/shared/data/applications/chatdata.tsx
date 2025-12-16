
import { Fragment, useState } from "react"
import { Col } from "react-bootstrap"
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Link } from "react-router-dom";
import { Lightboxcomponent } from "../../@spk-reusable-components/reusable-plugins/spk-lightbox";
import face1 from '../../../assets/images/faces/1.jpg';
import face2 from '../../../assets/images/faces/2.jpg';
import face3 from '../../../assets/images/faces/3.jpg';
import face4 from '../../../assets/images/faces/4.jpg';
import face5 from '../../../assets/images/faces/5.jpg';
import face6 from '../../../assets/images/faces/6.jpg';
import face7 from '../../../assets/images/faces/7.jpg';
import face8 from '../../../assets/images/faces/8.jpg';
import face9 from '../../../assets/images/faces/9.jpg';
import face10 from '../../../assets/images/faces/10.jpg';
import face11 from '../../../assets/images/faces/11.jpg';
import face12 from '../../../assets/images/faces/12.jpg';
import face13 from '../../../assets/images/faces/13.jpg';
import face14 from '../../../assets/images/faces/14.jpg';
import face15 from '../../../assets/images/faces/15.jpg';
import face16 from '../../../assets/images/faces/16.jpg';
import face17 from '../../../assets/images/faces/17.jpg';
import face18 from '../../../assets/images/faces/18.jpg';
import face19 from '../../../assets/images/faces/19.jpg';
import face20 from '../../../assets/images/faces/20.jpg';
import face21 from '../../../assets/images/faces/21.jpg';

import file1 from '../../../assets/images/media/files/1.png';
import file2 from '../../../assets/images/media/files/2.png';
import file3 from '../../../assets/images/media/files/3.png';
import file4 from '../../../assets/images/media/files/4.png';

import media40 from '../../../assets/images/media/media-40.jpg';
import media41 from '../../../assets/images/media/media-41.jpg';
import media42 from '../../../assets/images/media/media-42.jpg';
import media43 from '../../../assets/images/media/media-43.jpg';
import media44 from '../../../assets/images/media/media-44.jpg';
import media45 from '../../../assets/images/media/media-45.jpg';
import media46 from '../../../assets/images/media/media-46.jpg';
import media60 from '../../../assets/images/media/media-60.jpg';
import media61 from '../../../assets/images/media/media-61.jpg';

//Users
interface ChatUser {
    id: number;
    name: string;
    time: string;
    message: string;
    image: string;
    unreadCount: number;
    typing: boolean;
    status: string;
    isActive: boolean;
};
export const ChatUsers: ChatUser[] = [
    {
        id: 1,
        name: 'John Doe',
        time: '10:30 AM',
        message: "Got your email 😊, I’ll send over the details by EOD! 😄",
        image: face15,
        unreadCount: 0,
        typing: false,
        status:"online",
        isActive: false,
    },
    {
        id: 2,
        name: 'Alice Smith',
        time: '12:15 PM',
        message: 'Typing...',
        image: face2,
        unreadCount: 1,
        typing: true,
        status:"online",
        isActive: true,
    },
    {
        id: 3,
        name: 'Bob Johnson',
        time: '2:00 PM',
        message: 'Let’s schedule a call to discuss the project timeline.',
        image: face10,
        unreadCount: 3,
        typing: false,
        status:"online",
        isActive: false,
    },
    {
        id: 4,
        name: 'Emily Davis',
        time: '4:30 PM',
        message: 'The document is ready for final approval! 💹',
        image: face8,
        unreadCount: 0,
        typing: false,
        status:"online",
        isActive: false,
    },
];
interface ChatUser1 {
    id: number;
    name: string;
    time: string;
    message: string;
    image: string;
    unreadCount?: number;
    typing?: boolean;
    isActive?: boolean;
    online: boolean;
    status:string
};
export const ChatUsers1: ChatUser1[] = [
    {
        id: 11,
        name: 'Michael Brown',
        time: '7:00 PM',
        message: 'I’ll finish the remaining tasks tomorrow.',
        image: face11,
        online: false,
        status:"offline"
    },
    {
        id: 12,
        name: 'Sarah Lee',
        time: '10:45 AM',
        message: 'Can you share the meeting notes from yesterday?',
        image: face3,
        online: false,
         status:"offline"
    },
    {
        id: 13,
        name: 'David Williams',
        time: '3:30 PM',
        message: 'I think we should revise the design before the next meeting.',
        image: face16,
        online: false,
         status:"offline"
    },
    {
        id: 14,
        name: 'Olivia Wilson',
        time: '3 days ago',
        message: 'Just wanted to confirm the new meeting time.',
        image: face4,
        online: false,
         status:"offline"
    },
    {
        id: 15,
        name: 'William Clark',
        time: '9:00 AM',
        message:
            'I’ve added the new features to the app. Let me know your thoughts.',
        image: face13,
        online: false,
         status:"offline"
    },
    {
        id: 16,
        name: 'Sophia Lewis',
        time: '5 days ago',
        message:
            'I’m looking forward to seeing the final version of the presentation.',
        image: face5,
        online: false,
         status:"offline"
    },
];

//Groups
interface GroupChat {
    id: number;
    name: string;
    onlineCount: number;
    avatars: string[];
    extraCount: number;
};
export const GroupChats: GroupChat[] = [
    {
        id: 1,
        name: 'Team Innovators',
        onlineCount: 4,
        avatars: [
            face2,
            face8,
            face2,
            face10,
        ],
        extraCount: 19,
    },
    {
        id: 2,
        name: 'Creative Minds Chat',
        onlineCount: 32,
        avatars: [
            face1,
            face7,
            face3,
            face9,
            face12,
        ],
        extraCount: 123,
    },
    {
        id: 3,
        name: 'Social Media Managers',
        onlineCount: 3,
        avatars: [
            face4,
            face8,
            face13,
        ],
        extraCount: 15,
    },
    {
        id: 4,
        name: 'Startup Hustlers',
        onlineCount: 5,
        avatars: [
            face1,
            face7,
            face14,
        ],
        extraCount: 28,
    },
    {
        id: 5,
        name: 'Sales Team Network',
        onlineCount: 0,
        avatars: [
            face5,
            face6,
            face12,
            face3,
        ],
        extraCount: 53,
    },
];
interface GroupChatPreview {
    id: number;
    name: string;
    time: string;
    message: string;
    sender?: string;
    image: string;
    status: string;
    unread?: boolean;
};
export const GroupChatPreviews: GroupChatPreview[] = [
    {
        id: 17,
        name: 'Family Chat 😍',
        time: '10:45 AM',
        sender: 'Lily Perez',
        message: 'How are you doing today? 😊',
        image: face17,
        status: "online",
    },
    {
        id: 18,
        name: 'Home Team',
        time: '4:54 PM',
        sender: 'Paul Carter',
        message: 'Let me know if you need anything else.',
        image: face18,
        status: "offline",
        unread: true,
    },
    {
        id: 19,
        name: 'Our Tribe 😎',
        time: '8:32 AM',
        message: 'Simon,Melissa,Amanda,Patrick,Siddique',
        image: face19,
        status: "offline",
    },
    {
        id: 20,
        name: 'The Circle',
        time: 'Yesterday',
        message: 'Kamalan,Subha,Ambrose,Kiara,Jackson',
        image: face20,
        status: "offline",
    },
    {
        id: 21,
        name: 'Family Bond',
        time: '2 Days ago',
        message: 'Subman,Rajen,Kairo,Dibasha,Alexa',
        image: face21,
        status: "offline",
    },
];

//Contacts
interface Contact {
    name: string;
    avatar?: string;
    initials?: string;
};
interface GroupedContacts {
    letter: string;
    contacts: Contact[];
};
export const GroupedContacts: GroupedContacts[] = [
    {
        letter: 'A',
        contacts: [{ name: 'Emma Johnson', avatar: face5 }],
    },
    {
        letter: 'B',
        contacts: [{ name: 'James Miller', avatar: face12 }],
    },
    {
        letter: 'C',
        contacts: [{ name: 'John Smith', avatar: face14 }],
    },
    {
        letter: 'D',
        contacts: [{ name: 'Robert Johnson', avatar: face9 }],
    },
    {
        letter: 'E',
        contacts: [{ name: 'Olivia Smith', avatar: face7 }],
    },
    {
        letter: 'J',
        contacts: [{ name: 'Paul Carter', avatar: face15 }],
    },
    {
        letter: 'L',
        contacts: [{ name: 'Andrew Young', initials: 'AY' }],
    },
    {
        letter: 'M',
        contacts: [{ name: 'Isabella Davis', avatar: face2 }],
    },
    {
        letter: 'N',
        contacts: [{ name: 'Michael Brown', avatar: face10}],
    },
    {
        letter: 'W',
        contacts: [{ name: 'Thomas King', avatar: face16 }],
    },
];

//Offcanvas
interface FileItem {
    fileName: string;
    fileSize: string;
    fileDate: string;
    fileIcon: string;
};

export const Files: FileItem[] = [
    {
        fileName: 'Vacation_Photo_01.jpg',
        fileSize: '3.4 MB',
        fileDate: '24,Oct 2025 - 14:24PM',
        fileIcon: file1,
    },
    {
        fileName: 'Document_Report_2025.pdf',
        fileSize: '1.2 MB',
        fileDate: '22,Oct 2025 - 10:19AM',
        fileIcon: file2,
    },
    {
        fileName: 'Design_Assets_Logo.png',
        fileSize: '1.5 MB',
        fileDate: '22,Oct 2025 - 10:18AM',
        fileIcon: file3,
    },
    {
        fileName: 'Project_Files_Backup.zip',
        fileSize: '25.8 MB',
        fileDate: '22,Oct 2025 - 10:18AM',
        fileIcon: file4,
    },
];

export const ChatGallery = () => {

    const [open, setOpen] = useState(false);

    const Slides = [

        { src:media40 },
        { src: media41 },
        { src: media42 },
        { src: media43 },
        { src: media44 },
        { src: media45 },
        { src: media46 },
        { src: media60 },
        { src: media61 },
    ]

    return (
        <Fragment>
            <div className="row g-2">
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media40} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media41} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media42} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media43} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media44} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media45} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media46} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media60} alt="image" />
                    </Link>
                </Col>
                <Col lg={4} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card mb-0" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <img src={media61} alt="image" />
                    </Link>
                </Col>
            </div>
            <Lightboxcomponent close={() => setOpen(false)}  open={open} plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]} slides={Slides} index={0} />
        </Fragment>
    )
}





