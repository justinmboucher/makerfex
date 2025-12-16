import { Image } from "react-bootstrap";
import media13 from '../../../../assets/images/media/media-13.jpg';
import media14 from '../../../../assets/images/media/media-14.jpg';
import media18 from '../../../../assets/images/media/media-18.jpg';
import media25 from '../../../../assets/images/media/media-25.jpg';
import media26 from '../../../../assets/images/media/media-26.jpg';
import media27 from '../../../../assets/images/media/media-27.jpg';
import media28 from '../../../../assets/images/media/media-28.jpg';
import media29 from '../../../../assets/images/media/media-29.jpg';
import media30 from '../../../../assets/images/media/media-30.jpg';
import media31 from '../../../../assets/images/media/media-31.jpg';
import media32 from '../../../../assets/images/media/media-32.jpg';
import media33 from '../../../../assets/images/media/media-33.jpg';
import media40 from '../../../../assets/images/media/media-40.jpg';
import media41 from '../../../../assets/images/media/media-41.jpg';
import media42 from '../../../../assets/images/media/media-42.jpg';
import media43 from '../../../../assets/images/media/media-43.jpg';
import media44 from '../../../../assets/images/media/media-44.jpg';
import media45 from '../../../../assets/images/media/media-45.jpg';
import media59 from '../../../../assets/images/media/media-59.jpg';
import media60 from '../../../../assets/images/media/media-60.jpg';
import media61 from '../../../../assets/images/media/media-61.jpg';
import media62 from '../../../../assets/images/media/media-62.jpg';
import media63 from '../../../../assets/images/media/media-63.jpg';
import media64 from '../../../../assets/images/media/media-64.jpg';

export const Carouseldata = [
    <div>
        <Image  src={media28} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media31} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media32} className="d-block w-100" alt="..." />
    </div>
];

export const Indicatorcarousel = [
    <div className="">
        <Image  src={media25} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media29} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media30} className="d-block w-100" alt="..." />
    </div>
]

export const Slidecarousel = [
    <div>
        <Image  src={media26} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media27} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media33} className="d-block w-100" alt="..." />
    </div>
]

export const Captioncarousel = [
    <div className="">
        <Image  src={media59} className="d-block w-100" alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>First slide label</h5>
            <p>Some representative placeholder content for the first slide.</p>
        </div>
    </div>,
    <div>
        <Image  src={media60} className="d-block w-100" alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>Second slide label</h5>
            <p>Some representative placeholder content for the second slide.</p>
        </div>
    </div>,
    <div>
        <Image  src={media61} className="d-block w-100" alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>Third slide label</h5>
            <p>Some representative placeholder content for the third slide.</p>
        </div>
    </div>
]

export const Individualcarousel = [
    <div>
        <Image  src={media40} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media41} className="d-block w-100" alt="..." />
    </div>,
    <div >
        <Image  src={media42} className="d-block w-100" alt="..." />
    </div>
]

export const Crosscarousel = [
    <div className="">
        <Image  src={media43} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media44} className="d-block w-100" alt="..." />
    </div>,
    <div>
        <Image  src={media45} className="d-block w-100" alt="..." />
    </div>
]

export const Darkcarousel = [
    <div className="gri-cards" data-bs-interval="10000">
        <Image  src={media63} className="d-block w-100"
            alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>First slide label</h5>
            <p className="op-7">Some representative placeholder content for the first slide.</p>
        </div>
    </div>,
    <div className="grid-cards" data-bs-interval="2000">
        <Image  src={media64} className="d-block w-100"
            alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>Second slide label</h5>
            <p className="op-7">Some representative placeholder content for the second slide.</p>
        </div>
    </div>,
    <div className="grid-cards">
        <Image  src={media62} className="d-block w-100"
            alt="..." />
        <div className="carousel-caption d-none d-md-block">
            <h5 className='text-fixed-white'>Third slide label</h5>
            <p className="op-7">Some representative placeholder content for the third slide.</p>
        </div>
    </div>
]

export const Disablecarousel = [
    <div className="grid-cards">
        <Image  src={media13} className="d-block w-100" alt="..." />
    </div>,
    <div className="grid-cards">
        <Image  src={media14} className="d-block w-100" alt="..." />
    </div>,
    <div className="grid-cards">
        <Image  src={media18} className="d-block w-100" alt="..." />
    </div>
]