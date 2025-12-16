import media41 from '../../../assets/images/media/media-41.jpg';
import media43 from '../../../assets/images/media/media-43.jpg';
import media44 from '../../../assets/images/media/media-44.jpg';
import media45 from '../../../assets/images/media/media-45.jpg';
import media46 from '../../../assets/images/media/media-46.jpg';
import media71 from '../../../assets/images/media/media-71.jpg';
import media73 from '../../../assets/images/media/media-73.jpg';
import media75 from '../../../assets/images/media/media-75.jpg';
import media76 from '../../../assets/images/media/media-76.jpg';
import media77 from '../../../assets/images/media/media-77.jpg';
import media78 from '../../../assets/images/media/media-78.jpg';
import media79 from '../../../assets/images/media/media-79.jpg';

import face1 from '../../../assets/images/faces/1.jpg';
import face3 from '../../../assets/images/faces/3.jpg';
import face11 from '../../../assets/images/faces/11.jpg';
import face13 from '../../../assets/images/faces/13.jpg';
import face15 from '../../../assets/images/faces/15.jpg';

//Top Podcasters
interface User {
    name: string;
    avatar: string;
    title: string;
    category: string;
    followers: string;
    badgeClass: string;
  };
  
export const Podcasters: User[] = [
    {
      name: 'John Doe',
      avatar: face13,
      title: 'Tech Talks',
      category: 'Technology',
      followers: '1.2M - Followers',
      badgeClass: 'bg-primary-transparent',
    },
    {
      name: 'Sarah Lee',
      avatar: face3,
      title: 'Fitness Fuel',
      category: 'Health & Fitness',
      followers: '850K - Followers',
      badgeClass: 'bg-secondary-transparent',
    },
    {
      name: 'Emily Stone',
      avatar: face1,
      title: 'True Crime Chronicles',
      category: 'True Crime',
      followers: '2.1M - Followers',
      badgeClass: 'bg-success-transparent',
    },
    {
      name: 'Mark Taylor',
      avatar: face15,
      title: 'Financial Futures',
      category: 'Finance & Economics',
      followers: '1M - Followers',
      badgeClass: 'bg-info-transparent',
    },
    {
      name: 'David Brown',
      avatar: face11,
      title: 'The Comedy Show',
      category: 'Comedy',
      followers: '1.5M - Followers',
      badgeClass: 'bg-warning-transparent',
    },
];

//Recommendations 

interface MediaCard {
    image: string;
    title: string;
    author: string;
    id: number;
  };
  
export const MediaCards: MediaCard[] = [
    {
      id: 1,
      image: media71,
      title: 'The Culture Lab',
      author: 'Sophia Miller',
    },
    {
      id: 2,
      image: media73,
      title: 'Morning Brew',
      author: 'Jake Matthews',
    },
    {
      id: 3,
      image: media79,
      title: 'Future of Finance',
      author: 'Sarah Lee',
    },
    {
      id: 4,
      image: media77,
      title: 'Waves of Change',
      author: 'David Green',
    },
    {
      id: 5,
      image: media76,
      title: 'Tech Deep Dive',
      author: 'Emily Scott',
    },
    {
      id: 6,
      image: media75,
      title: 'Unsolved Mysteries',
      author: 'Rachel Adams',
    },
];

//Recently Played
interface MediaCard {
    id: number;
    image: string;
    title: string;
    author: string;
  };
  
export const RecentlyMedia: MediaCard[] = [
    {
      id: 1,
      image: media43,
      title: "The Digital Revolution",
      author: "Alex Turner",
    },
    {
      id: 2,
      image: media44,
      title: "Unsolved Mysteries",
      author: "Rachel Adams",
    },
    {
      id: 3,
      image: media45,
      title: "Startup Stories",
      author: "James Hawkins",
    },
    {
      id: 4,
      image: media46,
      title: "Healthy Habits",
      author: "Olivia Reed",
    },
    {
      id: 5,
      image: media41,
      title: "Beyond the Horizon",
      author: "Michael Harris",
    },
];


interface ListItem {
    id: string;
    image: string;
    title: string;
    author: string;
    likes: number;
  };
  
export const ListItems: ListItem[] = [
    {
      id: "01",
      image: media73,
      title: "Voices of the Future",
      author: "John Harris",
      likes: 340,
    },
    {
      id: "02",
      image: media79,
      title: "The Art of Storytelling",
      author: "Mia Roberts",
      likes: 133,
    },
    {
      id: "03",
      image: media77,
      title: "The Healthy Life",
      author: "Laura Collins",
      likes: 234,
    },
    {
      id: "04",
      image: media76,
      title: "Crisis Management",
      author: "Robert Blake",
      likes: 432,
    },
    {
      id: "05",
      image: media75,
      title: "Gastronomic Adventures",
      author: "Lily Jackson",
      likes: 153,
    },
    {
      id: "06",
      image: media71,
      title: "Innovate to Win",
      author: "Chris Brooks",
      likes: 355,
    },
];

type TableRow = {
    id: number;
    image: string;
    title: string;
    author: string;
    category: string;
    episodes: number;
    views: string;
    duration: string;
    comments: string;
    likes: string;
    shares: string;
    rating: number;
    status: string;
  };
  
export const PodcastTable: TableRow[] = [
    {
      id: 1,
      image: media71,
      title: "The Digital Revolution",
      author: "Alex Turner",
      category: "Technology",
      episodes: 25,
      views: "1.2M",
      duration: "35 min",
      comments: "24K",
      likes: "5K",
      shares: "1.5K",
      rating: 4.8,
      status: "Active",
    },
    {
      id: 2,
      image: media79,
      title: "Unsolved Mysteries",
      author: "Rachel Adams",
      category: "True Crime",
      episodes: 40,
      views: "3.1M",
      duration: "50 min",
      comments: "32K",
      likes: "8K",
      shares: "3.2K",
      rating: 4.9,
      status: "Active",
    },
    {
      id: 3,
      image: media78,
      title: "Startup Stories",
      author: "James Hawkins",
      category: "Business",
      episodes: 15,
      views: "850K",
      duration: "45 min",
      comments: "19K",
      likes: "3K",
      shares: "1K",
      rating: 4.7,
      status: "Inactive",
    },
    {
      id: 4,
      image: media77,
      title: "Healthy Habits",
      author: "Olivia Reed",
      category: "Health & Fitness",
      episodes: 20,
      views: "900K",
      duration: "38 min",
      comments: "22K",
      likes: "4.5K",
      shares: "1.2K",
      rating: 4.5,
      status: "Active",
    },
    {
      id: 5,
      image: media76,
      title: "Beyond the Horizon",
      author: "Michael Harris",
      category: "Travel",
      episodes: 12,
      views: "500K",
      duration: "40 min",
      comments: "15K",
      likes: "2K",
      shares: "800",
      rating: 4.6,
      status: "Active",
    },
    {
      id: 6,
      image: media75,
      title: "The Culture Lab",
      author: "Sophia Miller",
      category: "Culture",
      episodes: 30,
      views: "1.8M",
      duration: "28 min",
      comments: "27K",
      likes: "6K",
      shares: "2.5K",
      rating: 4.8,
      status: "Active",
    },
];

interface Tag {
    id: number;
    className: string;
    icon: string;
    text: string;
    isActive?: boolean;
  };
  
export const PodcastCategeries: Tag[] = [
    { id: 1, className: 'nft-tag-primary active', icon: 'ti ti-world', text: 'All', isActive: true },
    { id: 2, className: 'nft-tag-secondary', icon: 'ti ti-flame', text: 'New Trends' },
    { id: 3, className: 'nft-tag-info', icon: 'ti ti-palette', text: 'Art Work' },
    { id: 4, className: 'nft-tag-success', icon: 'ti ti-device-gamepad-2', text: 'Games' },
    { id: 5, className: 'nft-tag-danger', icon: 'ti ti-tie', text: 'Fashion' },
    { id: 6, className: 'nft-tag-purple', icon: 'ti ti-music', text: 'Music' },
  ];