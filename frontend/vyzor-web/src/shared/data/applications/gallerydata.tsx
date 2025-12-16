

import { Fragment,  useState } from "react"
import {  Col, Image, Row } from "react-bootstrap"
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Link } from "react-router-dom";
import { Lightboxcomponent } from "../../@spk-reusable-components/reusable-plugins/spk-lightbox";

import media25 from '../../../assets/images/media/media-25.jpg';
import media26 from '../../../assets/images/media/media-26.jpg';
import media27 from '../../../assets/images/media/media-27.jpg';
import media28 from '../../../assets/images/media/media-28.jpg';
import media40 from '../../../assets/images/media/media-40.jpg';
import media41 from '../../../assets/images/media/media-41.jpg';
import media42 from '../../../assets/images/media/media-42.jpg';
import media43 from '../../../assets/images/media/media-43.jpg';
import media44 from '../../../assets/images/media/media-44.jpg';
import media45 from '../../../assets/images/media/media-45.jpg';
import media46 from '../../../assets/images/media/media-46.jpg';
import media60 from '../../../assets/images/media/media-60.jpg';

export const GalleryList = () => {

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
        <Fragment>
            <Row className="gy-4">
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media40} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media41} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media42} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media43} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media44} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media45} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media46} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
                <Col lg={3} md={4} sm={6} className="col-12">
                    <Link to="#!" className="glightbox" data-gallery="gallery1" onClick={() => setOpen(true)}>
                        <Image  src={media60} alt="image" className="img-fluid rounded" />
                    </Link>
                </Col>
            </Row>
            <Lightboxcomponent close={() => setOpen(false)} open={open} plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]} slides={Slides} index={0} />
        </Fragment>
    )
}
//*** Images with Description ***//
export  const Descriptiondata = [
    {
      src: media25,
       subHtml: `
        <p className="text-fixed-white" id="">Description Bottom</p>
         <div className="" id="">You can set the position of the description <a href="http://google.com">with a link to Google</a></div>
      `,
    },
    {
      src: media26,
      subHtml:`<p>
                  You can set the position of the description in different ways for example
                  <strong
                  style={{textDecoration: "underline"}}
                  >top, bottom, left or right</strong>
              </p>
              <p>
                  <a href="http://google.com" target="_blank"
                  style={{textDecoration: "underline", fontWeight: "bold"}}
                  >Example Google link</a>
                  ipsum vehicula eros ultrices lacinia Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae Duis quis ipsum vehicula eros ultrices lacinia.
                  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
              </p>
              <p>
                  Primis pharetra facilisis lorem quis penatibus ad nulla inceptos, dui per tempor taciti aliquet consequat sodales, curae tristique gravida auctor interdum malesuada sagittis.
                  Felis pretium eros ligula natoque ad ante rutrum himenaeos, adipiscing urna mauris porta quam efficitur odio, sagittis morbi tellus nisi molestie mus faucibus.
              </p>
              <p>
                  Primis pharetra facilisis lorem quis penatibus ad nulla inceptos, dui per tempor taciti aliquet consequat sodales, curae tristique gravida auctor interdum malesuada sagittis.
                  Felis pretium eros ligula natoque ad ante rutrum himenaeos, adipiscing urna mauris porta quam efficitur odio, sagittis morbi tellus nisi molestie mus faucibus.
              </p>`,
    },
    {
      src: media27,
      subHtml: `<p>You can set the position of the description in different ways for example top, bottom, left or right</p>
                 <p>Duis quis ipsum vehicula eros ultrices lacinia. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae</p>`,
    },
    {
      src: media28,
      subHtml: `<p className="mb-0">You can set the position of the description in different ways for example top, bottom, left or right</p>`,
    },
  ];
