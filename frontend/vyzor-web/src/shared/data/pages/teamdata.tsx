import team1 from '../../../assets/images/faces/team/1.png';
import team2 from '../../../assets/images/faces/team/2.png';
import team3 from '../../../assets/images/faces/team/3.png';
import team4 from '../../../assets/images/faces/team/4.png';
import team5 from '../../../assets/images/faces/team/5.png';
import team6 from '../../../assets/images/faces/team/6.png';
import team7 from '../../../assets/images/faces/team/7.png';
import team8 from '../../../assets/images/faces/team/8.png';
import team9 from '../../../assets/images/faces/team/9.png';
import team10 from '../../../assets/images/faces/team/10.png';


interface TeamMember {
  id:number;
  imgSrc: string;
  name: string;
  role: string;
  socials: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}

export const TeamMembers: TeamMember[] = [
  {
    id:1,
    imgSrc: team1,
    name: "John Smith",
    role: "Senior Developer",
    socials: {
      facebook: "https://facebook.com/johnsmith",
      twitter: "https://twitter.com/johnsmith",
      linkedin: "https://linkedin.com/in/johnsmith"
    }
  },
  {
    id:2,
    imgSrc: team2,
    name: "Emily Johnson",
    role: "Product Manager",
    socials: {
      facebook: "https://facebook.com/emilyjohnson",
      twitter: "https://twitter.com/emilyjohnson",
      linkedin: "https://linkedin.com/in/emilyjohnson"
    }
  },
  {
    id:3,
    imgSrc: team3,
    name: "Sarah Davis",
    role: "Marketing Specialist",
    socials: {
      facebook: "https://facebook.com/sarahdavis",
      twitter: "https://twitter.com/sarahdavis",
      linkedin: "https://linkedin.com/in/sarahdavis"
    }
  },
  {
    id:4,
    imgSrc: team4,
    name: "Michael Brown",
    role: "Lead Designer",
    socials: {
      facebook: "https://facebook.com/michaelbrown",
      twitter: "https://twitter.com/michaelbrown",
      linkedin: "https://linkedin.com/in/michaelbrown"
    }
  },
  {
    id:5,
    imgSrc: team5,
    name: "Anna Martinez",
    role: "UX/UI Designer",
    socials: {
      facebook: "https://facebook.com/annamartinez",
      twitter: "https://twitter.com/annamartinez",
      linkedin: "https://linkedin.com/in/annamartinez"
    }
  },
  {
    id:6,
    imgSrc: team6,
    name: "James Taylor",
    role: "Project Manager",
    socials: {
      facebook: "https://facebook.com/jamestaylor",
      twitter: "https://twitter.com/jamestaylor",
      linkedin: "https://linkedin.com/in/jamestaylor"
    }
  },
  {
    id:7,
    imgSrc: team7,
    name: "Olivia Harris",
    role: "Content Strategist",
    socials: {
      facebook: "https://facebook.com/oliviaharris",
      twitter: "https://twitter.com/oliviaharris",
      linkedin: "https://linkedin.com/in/oliviaharris"
    }
  },
  {
    id:8,
    imgSrc: team8,
    name: "Daniel Lee",
    role: "Software Engineer",
    socials: {
      facebook: "https://facebook.com/daniellee",
      twitter: "https://twitter.com/daniellee",
      linkedin: "https://linkedin.com/in/daniellee"
    }
  },
  {
    id:9,
    imgSrc: team9,
    name: "Mia White",
    role: "QA Engineer",
    socials: {
      facebook: "https://facebook.com/miawhite",
      twitter: "https://twitter.com/miawhite",
      linkedin: "https://linkedin.com/in/miawhite"
    }
  },
  {
    id:10,
    imgSrc: team10,
    name: "Ethan Scott",
    role: "Digital Marketing Lead",
    socials: {
      facebook: "https://facebook.com/ethanscott",
      twitter: "https://twitter.com/ethanscott",
      linkedin: "https://linkedin.com/in/ethanscott"
    }
  }
];

export const TeamMembersLanding: TeamMember[] = [
  {
    id:1,
    imgSrc: team1,
    name: "John Smith",
    role: "Senior Developer",
    socials: {
      facebook: "https://facebook.com/johnsmith",
      twitter: "https://twitter.com/johnsmith",
      linkedin: "https://linkedin.com/in/johnsmith"
    }
  },
  {
    id:2,
    imgSrc: team2,
    name: "Emily Johnson",
    role: "Product Manager",
    socials: {
      facebook: "https://facebook.com/emilyjohnson",
      twitter: "https://twitter.com/emilyjohnson",
      linkedin: "https://linkedin.com/in/emilyjohnson"
    }
  },
  {
    id:3,
    imgSrc: team3,
    name: "Sarah Davis",
    role: "Marketing Specialist",
    socials: {
      facebook: "https://facebook.com/sarahdavis",
      twitter: "https://twitter.com/sarahdavis",
      linkedin: "https://linkedin.com/in/sarahdavis"
    }
  },
  {
    id:4,
    imgSrc: team4,
    name: "Michael Brown",
    role: "Lead Designer",
    socials: {
      facebook: "https://facebook.com/michaelbrown",
      twitter: "https://twitter.com/michaelbrown",
      linkedin: "https://linkedin.com/in/michaelbrown"
    }
  },
  {
    id:5,
    imgSrc: team5,
    name: "Anna Martinez",
    role: "UX/UI Designer",
    socials: {
      facebook: "https://facebook.com/annamartinez",
      twitter: "https://twitter.com/annamartinez",
      linkedin: "https://linkedin.com/in/annamartinez"
    }
  },
  {
    id:6,
    imgSrc: team6,
    name: "James Taylor",
    role: "Project Manager",
    socials: {
      facebook: "https://facebook.com/jamestaylor",
      twitter: "https://twitter.com/jamestaylor",
      linkedin: "https://linkedin.com/in/jamestaylor"
    }
  },
  {
    id:7,
    imgSrc: team7,
    name: "Olivia Harris",
    role: "Content Strategist",
    socials: {
      facebook: "https://facebook.com/oliviaharris",
      twitter: "https://twitter.com/oliviaharris",
      linkedin: "https://linkedin.com/in/oliviaharris"
    }
  },
  {
    id:8,
    imgSrc: team8,
    name: "Daniel Lee",
    role: "Software Engineer",
    socials: {
      facebook: "https://facebook.com/daniellee",
      twitter: "https://twitter.com/daniellee",
      linkedin: "https://linkedin.com/in/daniellee"
    }
  },
  {
    id:9,
    imgSrc: team9,
    name: "Mia White",
    role: "QA Engineer",
    socials: {
      facebook: "https://facebook.com/miawhite",
      twitter: "https://twitter.com/miawhite",
      linkedin: "https://linkedin.com/in/miawhite"
    }
  },
  {
    id:10,
    imgSrc: team10,
    name: "Ethan Scott",
    role: "Digital Marketing Lead",
    socials: {
      facebook: "https://facebook.com/ethanscott",
      twitter: "https://twitter.com/ethanscott",
      linkedin: "https://linkedin.com/in/ethanscott"
    }
  }
];

