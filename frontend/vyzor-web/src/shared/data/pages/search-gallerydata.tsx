

import { useState } from 'react';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SpkButton from '../../@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import { Lightboxcomponent } from '../../@spk-reusable-components/reusable-plugins/spk-lightbox';
import media40 from '../../../assets/images/media/media-40.jpg';
import media41 from '../../../assets/images/media/media-41.jpg';
import media42 from '../../../assets/images/media/media-42.jpg';
import media43 from '../../../assets/images/media/media-43.jpg';
import media44 from '../../../assets/images/media/media-44.jpg';
import media45 from '../../../assets/images/media/media-45.jpg';
import media46 from '../../../assets/images/media/media-46.jpg';
import media60 from '../../../assets/images/media/media-60.jpg';
import comppanyLogo2 from '../../../assets/images/company-logos/2.png';
import comppanyLogo4 from '../../../assets/images/company-logos/4.png';
import comppanyLogo5 from '../../../assets/images/company-logos/5.png';
import comppanyLogo6 from '../../../assets/images/company-logos/6.png';
import comppanyLogo7 from '../../../assets/images/company-logos/7.png';
import comppanyLogo8 from '../../../assets/images/company-logos/8.png';
import comppanyLogo9 from '../../../assets/images/company-logos/9.png';

export const SearchGallerylist = () => {

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
    ]

    return (
        <>
            <Row>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media40} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo6} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Tech Gadgets</div>
                            </div>
                            <div className="fs-12 text-default">Innovative Marvels</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media41} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo2} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Healthy Recipes</div>
                            </div>
                            <div className="fs-12 text-default">Nutrient Nourish</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media42} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo4} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Travel Explorer</div>
                            </div>
                            <div className="fs-12 text-default">Global Wander</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media43} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo5} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Fashion Finds</div>
                            </div>
                            <div className="fs-12 text-default">Chic Styles</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media44} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo6} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Nature Photography</div>
                            </div>
                            <div className="fs-12 text-default">Wild Beauty</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1" >
                    <Image  src={media45} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo7} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Future Tales</div>
                            </div>
                            <div className="fs-12 text-default">Innovative Marvels</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media46} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo8} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Science Fiction Books</div>
                            </div>
                            <div className="fs-12 text-default">Future Tales</div>
                        </div>
                    </Link>
                </Col>
                <Col lg={3} md={3} sm={6} className="col-12">
                    <Link to="#!" className="glightbox card search-images-card" data-gallery="gallery1">
                        <Image  src={media60} alt="image" onClick={() => setOpen(true)} />
                        <div className="p-2">
                            <div className="d-flex align-items-center gap-1">
                                <div className="avatar avatar-xs">
                                    <Image  src={comppanyLogo9} alt="" />
                                </div>
                                <div className="figure-caption fs-13 fw-medium text-default">Fitness Fanatics</div>
                            </div>
                            <div className="fs-12 text-default">Active Vibes</div>
                        </div>
                    </Link>
                </Col>
                <Col xl={12} className="mb-4">
                    <SpkButton Customclass="btn btn-info-light btn-loader mx-auto">
                        <span className="me-2">Loading</span>
                        <span className="loading"><i className="ri-loader-4-line fs-16"></i></span>
                    </SpkButton>
                </Col>

            </Row>
            <Lightboxcomponent
                close={() => setOpen(false)} // Close function
                open={open}
                plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
                slides={Slides} index={0} />
        </>
    );
};
