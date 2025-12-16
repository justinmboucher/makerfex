
import { Fragment, useState } from "react"
import { Col, Image } from "react-bootstrap"
import { Link } from "react-router-dom";
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
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
import face13 from '../../../assets/images/faces/13.jpg';
import face14 from '../../../assets/images/faces/14.jpg';
import face15 from '../../../assets/images/faces/15.jpg';
import face16 from '../../../assets/images/faces/16.jpg';
import media26 from '../../../assets/images/media/media-26.jpg';
import media30 from '../../../assets/images/media/media-31.jpg';
import media31 from '../../../assets/images/media/media-32.jpg';
import media32 from '../../../assets/images/media/media-33.jpg';
import media40 from '../../../assets/images/media/media-40.jpg';
import media41 from '../../../assets/images/media/media-41.jpg';
import media42 from '../../../assets/images/media/media-42.jpg';
import media43 from '../../../assets/images/media/media-43.jpg';
import media44 from '../../../assets/images/media/media-44.jpg';
import media45 from '../../../assets/images/media/media-45.jpg';
import media46 from '../../../assets/images/media/media-46.jpg';
import media59 from '../../../assets/images/media/media-59.jpg';
import media60 from '../../../assets/images/media/media-60.jpg';
import media61 from '../../../assets/images/media/media-61.jpg';

export const ProfileGallery = () => {

    const [open, setOpen] = useState(false);

    const Slides = [

        { src: media40 },
        { src: media41 },
        { src: media42 },
        { src: media43 },
        { src: media44 },
        { src: media45 },
        { src: media46 },
        { src: media60 },
        { src: media26 },
        { src: media32 },
        { src: media30 },
        { src: media31 },
        { src: media46 },
        { src: media59 },
        { src: media61 },
        { src: media42 },
    ]

    return (
        <Fragment>
            <div className="row gy-4">
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media40} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media41} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media42} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media43} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media44} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media45} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media46} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media60} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media26} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media32} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media30} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media31} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media46} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media59} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media61} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col xxl={3} xl={3} lg={3} md={6} sm={12} className="">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image src={media42} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
            </div>
            <Lightboxcomponent close={() => setOpen(false)}  open={open} plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]} slides={Slides} index={0} />
        </Fragment>
    )
}

interface UserProfile {
    name: string;
    mail: string;
    imgSrc: string;
    icon: string;
    color: string;
    followers: string;
}

export const Profiles: UserProfile[] = [
    {
        name: "JohnDoe",
        mail: "john.doe@example.com",
        imgSrc: face9,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "SarahSmith",
        mail: "sarah.smith@example.com",
        imgSrc: face1,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "MichaelBrown",
        mail: "michael.brown@example.com",
        imgSrc: face10,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "EmmaWilson",
        mail: "emma.wilson@example.com",
        imgSrc: face2,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "JamesTaylor",
        mail: "james.taylor@example.com",
        imgSrc: face11,
        icon: "minus",
        color: 'danger',
        followers: 'Unfollow'
    },
    {
        name: "OliviaJohnson",
        mail: "olivia.johnson@example.com",
        imgSrc: face3,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "DavidMartinez",
        mail: "david.martinez@example.com",
        imgSrc: face13,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "SophiaGarcia",
        mail: "sophia.garcia@example.com",
        imgSrc: face4,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "DanielLee",
        mail: "daniel.lee@example.com",
        imgSrc: face14,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "IsabellaHarris",
        mail: "isabella.harris@example.com",
        imgSrc: face5,
        icon: "minus",
        color: 'danger',
        followers: 'Unfollow'
    },
    {
        name: "WilliamClark",
        mail: "william.clark@example.com",
        imgSrc: face15,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "MiaLewis",
        mail: "mia.lewis@example.com",
        imgSrc: face6,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "AlexanderWalker",
        mail: "alexander.walker@example.com",
        imgSrc: face16,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "CharlotteAllen",
        mail: "charlotte.allen@example.com",
        imgSrc: face7,
        icon: "add",
        color: 'primary',
        followers: 'Follow'
    },
    {
        name: "BenjaminYoung",
        mail: "benjamin.young@example.com",
        imgSrc: face8,
        icon: "minus",
        color: 'danger',
        followers: 'Unfollow'
    },
];

interface Friend {
    name: string;
    mail: string;
    imgSrc: string;
}

export const FriendsList: Friend[] = [
    {
        name: "JohnDoe",
        mail: "john.doe@example.com",
        imgSrc: face9,
    },
    {
        name: "SarahSmith",
        mail: "sarah.smith@example.com",
        imgSrc: face1,
    },
    {
        name: "MichaelBrown",
        mail: "michael.brown@example.com",
        imgSrc: face10,
    },
    {
        name: "EmmaWilson",
        mail: "emma.wilson@example.com",
        imgSrc: face2,
    },
    {
        name: "JamesTaylor",
        mail: "james.taylor@example.com",
        imgSrc: face11,
    },
    {
        name: "OliviaJohnson",
        mail: "olivia.johnson@example.com",
        imgSrc: face3,
    },
    {
        name: "DavidMartinez",
        mail: "david.martinez@example.com",
        imgSrc: face13
    },
    {
        name: "SophiaGarcia",
        mail: "sophia.garcia@example.com",
        imgSrc: face4
    },
    {
        name: "DanielLee",
        mail: "daniel.lee@example.com",
        imgSrc: face14
    },
    {
        name: "IsabellaHarris",
        mail: "isabella.harris@example.com",
        imgSrc: face6
    },
    {
        name: "WilliamClark",
        mail: "william.clark@example.com",
        imgSrc: face15
    },
    {
        name: "JohnDoe",
        mail: "john.doe@example.com",
        imgSrc: face9
    },
];



