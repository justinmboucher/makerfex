import nft2 from '../../../../assets/images/nft-images/2.png';
import nft3 from '../../../../assets/images/nft-images/3.png';
import nft4 from '../../../../assets/images/nft-images/4.png';
import nft7 from '../../../../assets/images/nft-images/7.png';
import nft10 from '../../../../assets/images/nft-images/10.png';
import nft12 from '../../../../assets/images/nft-images/12.png';
import nft13 from '../../../../assets/images/nft-images/13.png';
import nft14 from '../../../../assets/images/nft-images/14.png';
import nft18 from '../../../../assets/images/nft-images/18.png';
import nft44 from '../../../../assets/images/nft-images/44.png';
import nft45 from '../../../../assets/images/nft-images/45.png';

interface NFTItem {
    id: number;
    image: string;
    title: string;
    author: string;
    currentBid: string;
    likes: string;
    bidAmount:string;
    time:string;
  }
  
export const MartketPlaceItems: NFTItem[] = [
  {
    id: 1,
    image: nft2,
    title: "Neon Samurai: Blade of the Future",
    author: "By Kairo Tetsuo",
    currentBid: "12.45ETH",
    likes: "1.32k",
    bidAmount:'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
  {
    id: 2,
    image: nft3,
    title: "Cybercity Uprising: Rebels of the Neon Streets",
    author: "By Aiko Nakamura",
    currentBid: "18.34ETH",
    likes: "1.26k",
    bidAmount:'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
  {
    id: 3,
    image: nft4,
    title: "Holo-Vision: The Last Cyberpunk Hero",
    author: "By Ryo Takahashi",
    currentBid: "26.50ETH",
    likes: "2.45k",
    bidAmount:'Place a Bid',
    time:'04hrs : 24m : 38s'
  },
  {
    id: 4,
    image: nft44,
    title: "Neon Assassin",
    author: "By TrixTheArtist",
    currentBid: "1.5 ETH",
    likes: "1.2k",
    bidAmount:'Place a Bid',
    time:'02hrs : 34m : 12s'
  },
  {
    id: 5,
    image: nft45,
    title: "Cyber Samurai",
    author: "By PixelWarrior",
    currentBid: "2.0 ETH",
    likes: "2.3k",
    bidAmount:'Place a Bid',
    time:'03hrs : 15m : 22s'
  },
  {
    id: 6,
    image: nft18,
    title: "Robo-Revolution",
    author: "By Holo-Creator",
    currentBid: "0.75 ETH",
    likes: "800",
    bidAmount:'Place a Bid',
    time:'01hrs : 47m : 08s'
  },
  {
    id: 7,
    image: nft14,
    title: "Neon District",
    author: "By TechnoVision",
    currentBid: "1.6 ETH",
    likes: "1.6 k",
    bidAmount:'Place a Bid',
    time:'04hrs : 05m : 40s'
  },
  {
    id: 8,
    image: nft13,
    title: "Synthwave Dream",
    author: "By CyborgDreamer",
    currentBid: "1.8 ETH",
    likes: "2.1k",
    bidAmount:'Place a Bid',
    time:'05hrs : 28m : 59s'
  }
];

interface Market {
    id: number;
    title: string;
    author: string;
    likes: string;
    time: string;
    image: string;
    currentBid: string;
    bidAmount:string;
  }
  
export const MartketPlaceItems1: Market[] = [
  {
    id: 1,
    title: 'Chrome Guardian',
    author: 'By NeonRider',
    likes: '3.5k',
    time: '03hrs : 10m : 45s',
    image: nft12,
    currentBid: '2.5 ETH',
    bidAmount:'Place a Bid',
  },
  {
    id: 2,
    title: 'Electric Reaper',
    author: 'By DarkSynth',
    likes: '2.7k',
    time: '02hrs : 58m : 12s',
    image: nft10,
    currentBid: '3.1 ETH',
    bidAmount:'Place a Bid',
  },
  {
    id: 3,
    title: 'Robo-Punk Revolution',
    author: 'By UrbanPixel',
    likes: '1.8k',
    time: '06hrs : 45m : 20s',
    image: nft7,
    currentBid: '2.3 ETH',
    bidAmount:'Place a Bid',
  },
];

