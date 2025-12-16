
import { Card, Dropdown, Image, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import SpkDropdown from "../../../@spk-reusable-components/general-reusable/reusable-uielements/spk-dropdown";
import nft2 from '../../../../assets/images/nft-images/2.png';
import nft3 from '../../../../assets/images/nft-images/3.png';
import nft4 from '../../../../assets/images/nft-images/4.png';
import nft6 from '../../../../assets/images/nft-images/6.jpg';
import nft8 from '../../../../assets/images/nft-images/8.jpg';
import nft9 from '../../../../assets/images/nft-images/9.jpg';
import nft11 from '../../../../assets/images/nft-images/11.jpg';
import nft15 from '../../../../assets/images/nft-images/15.jpg';
import nft16 from '../../../../assets/images/nft-images/16.jpg';
import nft17 from '../../../../assets/images/nft-images/17.jpg';
import nft35 from '../../../../assets/images/nft-images/35.png';
import nft36 from '../../../../assets/images/nft-images/36.png';
import nft37 from '../../../../assets/images/nft-images/37.png';
import nft38 from '../../../../assets/images/nft-images/38.png';
import nft39 from '../../../../assets/images/nft-images/39.png';
import nft40 from '../../../../assets/images/nft-images/40.png';
import nft41 from '../../../../assets/images/nft-images/41.png';
import nft42 from '../../../../assets/images/nft-images/42.png';
import nft43 from '../../../../assets/images/nft-images/43.png';
import ethereum_eth_logo from '../../../../assets/images/crypto-currencies/crypto-icons/ethereum-eth-logo.svg';

import face5 from '../../../../assets/images/faces/5.jpg';
import face10 from '../../../../assets/images/faces/10.jpg'
import face15 from '../../../../assets/images/faces/15.jpg';

interface NftTag {
    label: string;
    className: string;
    isActive?: boolean;
  }
  
export const NftTags: NftTag[] = [
    { label: 'Music', className: 'nft-tag-primary', isActive: true },
    { label: 'Games', className: 'nft-tag-secondary' },
    { label: 'Art', className: 'nft-tag-info' },
    { label: 'Photography', className: 'nft-tag-success' },
    { label: 'Sport', className: 'nft-tag-danger' },
    { label: 'Cartoon', className: 'nft-tag-purple' },
];

interface NftCard {
  id: string;
  image: string;
  title: string;
  author: string;
  likes: string;
  currentBid: string;
  bidAmount: string;
  time:string;
}

export const NftCards: NftCard[] = [
  {
    id: 'nft1',
    image: nft2,
    title: 'Neon Samurai: Blade of the Future',
    author: 'By Kairo Tetsuo',
    likes: '1.32k',
    currentBid: '12.45ETH',
    bidAmount: 'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
  {
    id: 'nft2',
    image: nft3,
    title: 'Cybercity Uprising: Rebels of the Neon Streets',
    author: 'By Aiko Nakamura',
    likes: '1.26k',
    currentBid: '18.34ETH',
    bidAmount: 'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
  {
    id: 'nft3',
    image: nft4,
    title: 'Holo-Vision: The Last Cyberpunk Hero',
    author: 'By Ryo Takahashi',
    likes: '2.45k',
    currentBid: '26.50ETH',
    bidAmount: 'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
];

interface Follower {
    id: string;
    name: string;
    handle: string;
    image: string;
    isFollowing: boolean;
  }
  
export const Followers: Follower[] = [
    {
      id: '1',
      name: 'Kairo Tetsuo',
      handle: '@KairoX',
      image: nft6,
      isFollowing: false,
    },
    {
      id: '2',
      name: 'Aiko Nakamura',
      handle: '@NamiGhost',
      image: nft15,
      isFollowing: true,
    },
    {
      id: '3',
      name: 'Kairo Tetsuo',
      handle: '@KairoX',
      image: nft16,
      isFollowing: false,
    },
    {
      id: '4',
      name: 'Ryo Takahashi',
      handle: '@TakaraVision',
      image: nft17,
      isFollowing: false,
    },
    {
      id: '5',
      name: 'Nova Cypher',
      handle: '@CypherNova',
      image: nft11,
      isFollowing: false,
    },
    {
      id: '6',
      name: 'Zara Kai',
      handle: '@ZaraKx',
      image: nft9,
      isFollowing: false,
    },
    {
      id: '7',
      name: 'Maxim Xeno',
      handle: '@XenoMax',
      image: nft8,
      isFollowing: false,
    },
];
  
export const NftSeries = [{
    name: "Last Year",
    data: [20, 38, 38, 72, 55, 63, 43, 76, 55, 80, 40, 80]
}, {
    name: "This Year",
    data: [85, 65, 75, 38, 85, 35, 62, 40, 40, 64, 50, 89]
}]
export const NftOptions = {
    chart: {
        height: 280,
        type: 'bar',
        zoom: {
            enabled: false
        },
        stacked: true,
    },
    dataLabels: {
        enabled: false
    },
    plotOptions: {
        bar: {
            columnWidth: '45%',
            borderRadius: 2,
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        markers: {
            width: 10,
            height: 10,
        }
    },
    stroke: {
        curve: 'smooth',
    },
    grid: {
        borderColor: "#f1f1f1",
        strokeDashArray: 3,
    },
    colors: ["var(--primary-color)", "var(--primary02)"],
    yaxis: {
        title: {
            text: 'Statistics',
            style: {
                color: '#adb5be',
                fontSize: '14px',
                fontWeight: 600,
                cssClass: 'apexcharts-yaxis-label',
            },
        },
    },
    xaxis: {
        type: 'month',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
        },
        axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            width: 6,
            offsetX: 0,
            offsetY: 0
        },
        labels: {
            rotate: -90
        }
    }
}
interface StatItem {
    title: string;
    badge: string;
    badgeColor: string; 
    badgeIcon: string; 
    label: string;
    value: string;
  }
  
export const StatItems: StatItem[] = [
    {
      title: "Growth",
      badge: "2.35%",
      badgeColor: "success",
      badgeIcon: "ti ti-arrow-up",
      label: "NFT's Sold",
      value: "3,297",
    },
    {
      title: "Market",
      badge: "6.96%",
      badgeColor: "success",
      badgeIcon: "ti ti-arrow-up",
      label: "Total Market",
      value: "$1.45M",
    },
    {
      title: "Bid",
      badge: "3.85%",
      badgeColor: "danger",
      badgeIcon: "ti ti-arrow-down",
      label: "Highest Bid",
      value: "128ETH",
    },
];

interface NftSaleItem {
    image: string;
    title: string;
    author: string;
    avatar: string;
    price: string;
  }
  
export const NftSales: NftSaleItem[] = [
    {
      image: nft36,
      title: "Blade of the Future",
      author: "Kairo Tetsuo",
      avatar: ethereum_eth_logo,
      price: "10 ETH",
    },
    {
      image: nft38,
      title: "Rebels of the Neon Streets",
      author: "Aiko Nakamura",
      avatar: ethereum_eth_logo,
      price: "5 ETH",
    },
    {
      image: nft40,
      title: "The Last Cyberpunk Hero",
      author: "Ryo Takahashi",
      avatar: ethereum_eth_logo,
      price: "7 ETH",
    },
    {
      image: nft41,
      title: "Reborn in the Matrix",
      author: "Nova Cypher",
      avatar: ethereum_eth_logo,
      price: "12 ETH",
    },
    {
      image: nft42,
      title: "Neon Rage",
      author: "Zara Kai",
      avatar: ethereum_eth_logo,
      price: "7 ETH",
    },
    {
      image: nft43,
      title: "Dawn of Darkness",
      author: "Maxim Xeno",
      avatar: ethereum_eth_logo,
      price: "8 ETH",
    },
];
  
interface NftTableItem {
    id: number;
    image: string;
    title: string;
    handle: string;
    creator: string;
    date: string;
    price: string;
    status: string;
    statusClass: string;
    category: string;
    chain: string;
    edition: string;
    volume: string;
  }
  
export const NftTableData: NftTableItem[] = [
    {
      id: 1,
      image: nft40,
      title: "Neon Samurai",
      handle: "@KairoX",
      creator: "Kairo Tetsuo",
      date: "Feb 25, 2025",
      price: "10 ETH",
      status: "Sold Out",
      statusClass: "bg-success-transparent",
      category: "Cyberpunk",
      chain: "Ethereum",
      edition: "1 of 1",
      volume: "50 ETH",
    },
    {
      id: 2,
      image: nft42,
      title: "Cybercity Uprising",
      handle: "@NamiGhost",
      creator: "Aiko Nakamura",
      date: "Mar 10, 2025",
      price: "5 ETH",
      status: "50% Sold",
      statusClass: "bg-success-transparent",
      category: "Cyberpunk",
      chain: "Polygon",
      edition: "3 of 10",
      volume: "15 ETH",
    },
    {
      id: 3,
      image: nft35,
      title: "Holo-Vision Hero",
      handle: "@TakaraVision",
      creator: "Ryo Takahashi",
      date: "Mar 18, 2025",
      price: "7 ETH",
      status: "80% Sold",
      statusClass: "bg-success-transparent",
      category: "Sci-Fi",
      chain: "Ethereum",
      edition: "5 of 5",
      volume: "20 ETH",
    },
    {
      id: 4,
      image: nft36,
      title: "Cyber Phoenix",
      handle: "@CypherNova",
      creator: "Nova Cypher",
      date: "Apr 2, 2025",
      price: "12 ETH",
      status: "10% Sold",
      statusClass: "bg-success-transparent",
      category: "Cyberpunk",
      chain: "Binance",
      edition: "10 of 20",
      volume: "10 ETH",
    },
    {
      id: 5,
      image: nft37,
      title: "Digital Outlaws",
      handle: "@ZaraKx",
      creator: "Zara Kai",
      date: "Apr 15, 2025",
      price: "15 ETH",
      status: "Coming Soon",
      statusClass: "bg-primary-transparent",
      category: "Cyberpunk",
      chain: "Solana",
      edition: "1 of 1",
      volume: "0 ETH",
    },
    {
      id: 6,
      image: nft38,
      title: "Cyber Reaper",
      handle: "@XenoMax",
      creator: "Maxim Xeno",
      date: "Apr 20, 2025",
      price: "8 ETH",
      status: "Pre-Sale",
      statusClass: "bg-warning-transparent",
      category: "Cyberpunk",
      chain: "Ethereum",
      edition: "7 of 10",
      volume: "25 ETH",
    },
  ];
    
//
export const BalanceSeries = [{
  name: 'Value',
  data: [20, 14, 19, 10, 25, 20, 22, 9, 12]
}]
export const BalanceOptions = {
  chart: {
    type: 'area',
    height: 60,
    sparkline: {
        enabled: true
    }
},
stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: undefined,
    width: 1.5,
    dashArray: 0,
},
fill: {
    type: 'gradient',
    gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
            [
                {
                    offset: 0,
                    color: "var(--primary01)",
                    opacity: 1
                },
                {
                    offset: 75,
                    color: "var(--primary01)",
                    opacity: 1
                },
                {
                    offset: 100,
                    color: "var(--primary01)",
                    opacity: 1
                }
            ]
        ]
    }
},
yaxis: {
    min: 0,
    show: false,
    axisBorder: {
        show: false
    },
},
xaxis: {
    show: false,
    axisBorder: {
        show: false
    },
},
colors: ["var(--primary-color)"],

}

interface NftCardData {
  images: string[];
  user: {
    name: string;
    username: string;
    avatar: string;
  };
}
const nftCards: NftCardData[] = [
  {
    images: [
      nft38,
      nft40,
      nft41,
    ],
    user: {
      name: "Melissa Smith",
      username: "@melissa",
      avatar: face5,
    },
  },
  {
    images: [
      nft35,
      nft36,
      nft37,
    ],
    user: {
      name: "Simon Cowell",
      username: "@simon",
      avatar: face15,
    },
  },
  {
    images: [
      nft39,
      nft42,
      nft43,
    ],
    user: {
      name: "Json Talor",
      username: "@taylor",
      avatar: face10,
    },
  },
];

export const NftSwiper = nftCards.map((card, index) => (
      <Card className="custom-card border-0 shadow-none mb-0" key={index}>
        <Card.Body className="card-body p-0">
          <Row className="g-2">
            <div className="col-12">
              <Image  src={card.images[0]} alt="" className="nft-featuredcollect-image rounded" />
            </div>
            <div className="col-6">
              <Image  src={card.images[1]} alt="" className="nft-featuredcollect-image rounded" />
            </div>
            <div className="col-6">
              <Image  src={card.images[2]} alt="" className="nft-featuredcollect-image rounded" />
            </div>
          </Row>
        </Card.Body>
        <Card.Footer className="border-top-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center flex-fill">
              <div className="me-2 lh-1">
                <span className="avatar avatar-md avatar-rounded">
                  <Image  src={card.user.avatar} alt="" />
                  <Link to="#!" className="badge rounded-pill bg-primary avatar-badge">
                    <i className="ri-check-line align-mmiddle"></i>
                  </Link>
                </span>
              </div>
              <div>
                <p className="mb-0 fw-semibold">
                  <Link to="#!">{card.user.name}</Link>
                </p>
                <p className="text-muted fs-12 mb-0">{card.user.username}</p>
              </div>
            </div>
            <div>
            <SpkDropdown Togglevariant="" Customtoggleclass="btn btn-icon btn-sm btn-primary-light no-caret" Icon={true} IconClass="fe fe-more-vertical">
                <Dropdown.Item>Action</Dropdown.Item>
                <Dropdown.Item>Another action</Dropdown.Item>
                <Dropdown.Item>Something else here</Dropdown.Item>
            </SpkDropdown>
            </div>
          </div>
        </Card.Footer>
      </Card>
  ))
  