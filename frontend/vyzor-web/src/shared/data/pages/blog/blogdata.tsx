
import blog2 from '../../../../assets/images/media/blog/2.jpg';
import blog3 from '../../../../assets/images/media/blog/3.jpg';
import blog4 from '../../../../assets/images/media/blog/4.jpg';
import blog5 from '../../../../assets/images/media/blog/5.jpg';
import blog6 from '../../../../assets/images/media/blog/6.jpg';
import blog7 from '../../../../assets/images/media/blog/7.jpg';
import blog8 from '../../../../assets/images/media/blog/8.jpg';
import blog9 from '../../../../assets/images/media/blog/9.jpg';
import blog10 from '../../../../assets/images/media/blog/10.jpg';
import blog11 from '../../../../assets/images/media/blog/11.jpg';
import blog12 from '../../../../assets/images/media/blog/12.jpg';
import blog13 from '../../../../assets/images/media/blog/13.jpg';
import blog14 from '../../../../assets/images/media/blog/14.jpg';
import blog15 from '../../../../assets/images/media/blog/15.jpg';
import blog16 from '../../../../assets/images/media/blog/16.jpg';
import blog17 from '../../../../assets/images/media/blog/17.jpg';
import blog18 from '../../../../assets/images/media/blog/18.jpg';
import blog19 from '../../../../assets/images/media/blog/19.jpg';
import blog20 from '../../../../assets/images/media/blog/20.jpg';
import blog21 from '../../../../assets/images/media/blog/21.jpg';
import blog22 from '../../../../assets/images/media/blog/22.jpg';
import blog23 from '../../../../assets/images/media/blog/23.jpg';
import blog24 from '../../../../assets/images/media/blog/24.jpg';
import blog25 from '../../../../assets/images/media/blog/25.jpg';
import blog26 from '../../../../assets/images/media/blog/26.jpg';

interface BlogPost {
    image: string;
    title: string;
    desc: string;
  };
  
export const BlogPosts: BlogPost[] = [
    {
      image: blog2,
      title: "Automation",
      desc: "The Future of Automation: A Robot at Work",
    },
    {
      image: blog3,
      title: "Digital Trends",
      desc: "How Platforms are Shaping Digital Communication",
    },
    {
      image: blog4,
      title: "Robotics",
      desc: "The Role of Robotic Hands in Modern Technology",
    },
    {
      image: blog5,
      title: "Gadgets",
      desc: "Exploring the Latest Innovations in Headphone Technology.",
    },
  ];

//Top Stories

interface TopStory {
    image: string;
    badgeText: string;
    badgeClass: string;
    title: string;
  };
export const TopStories: TopStory[] = [
    {
      image: blog6,
      badgeText: "Technology & Innovation",
      badgeClass: "bg-primary-transparent",
      title: "How 5G is Revolutionizing Connectivity Across the Globe",
    },
    {
      image: blog7,
      badgeText: "Health & Wellness",
      badgeClass: "bg-secondary-transparent",
      title: "The Benefits of a Plant-Based Diet: What You Need to Know",
    },
    {
      image: blog8,
      badgeText: "Business & Finance",
      badgeClass: "bg-warning-transparent",
      title: "2025 Financial Trends: How to Prepare for a Changing Market",
    },
    {
      image: blog9,
      badgeText: "Travel & Adventure",
      badgeClass: "bg-success-transparent",
      title: "The Future of Travel Post-Pandemic: What to Expect",
    },
    {
      image: blog10,
      badgeText: "Entertainment & Culture",
      badgeClass: "bg-info-transparent",
      title: "How Social Media is Shaping the Entertainment Industry",
    },
  ];

//Popular Topics
interface BlogCategoryCard {
    imgSrc: string;
    title: string;
  };
export const BlogCategoryCards: BlogCategoryCard[] = [
    { imgSrc: blog11, title: "Technology" },
    { imgSrc: blog12, title: "Health" },
    { imgSrc: blog13, title: "Business" },
    { imgSrc: blog14, title: "Lifestyle" },
    { imgSrc: blog15, title: "Travel" },
    { imgSrc: blog16, title: "Entertainment" },
    { imgSrc: blog17, title: "Food & Recipes" },
    { imgSrc: blog18, title: "Animals" },
  ];

  interface BlogCard {
    image: string;
    title: string;
    desc: string;
  };
export const BlogCards: BlogCard[] = [
    {
      image: blog19,
      title: "Technology",
      desc: "Tech Innovations and Future Trends",
    },
    {
      image: blog20,
      title: "Health & Wellness",
      desc: "How to Stay Fit and Healthy in 2025",
    },
    {
      image: blog21,
      title: "Business & Finance",
      desc: "The Ultimate Guide to Personal Finance for Beginners",
    },
    {
      image: blog22,
      title: "Lifestyle",
      desc: "The Art of Minimalism: Simplify Your Life",
    },
    {
      image: blog23,
      title: "Productivity",
      desc: "The Secret to Effective Time Management",
    },
    {
      image: blog24,
      title: "Travel",
      desc: "Top 10 Hidden Travel Gems You Need to Visit",
    },
    {
      image: blog25,
      title: "Entertainment",
      desc: "Breaking Down the Latest Blockbuster Movies of 2025",
    },
    {
      image: blog26,
      title: "Food & Recipes",
      desc: "Healthy and Delicious Recipes for Every Meal",
    },
  ];
    
//Popular Blogs
interface PopularBlog {
    image: string;
    title: string;
    dateViews: string;
    link: string;
  };
export const PopularBlogs: PopularBlog[] = [
    {
      image: blog11,
      title: "Building a Sustainable Future: How Green Technology is Changing the World",
      dateViews: "Mar 15, 2025 - 1.8k Views",
      link: "/pages/blog/blog-details/",
    },
    {
      image: blog10,
      title: "Exploring the Rise of Remote Work: Trends and Best Practices",
      dateViews: "Apr 3, 2025 - 2.3k Views",
      link: "/pages/blog/blog-details/",
    },
    {
      image: blog9,
      title: "Digital Marketing Trends: What You Need to Know for 2025",
      dateViews: "May 10, 2025 - 3.1k Views",
      link: "/pages/blog/blog-details/",
    },
    {
      image: blog4,
      title: "Top 5 Budget-Friendly Home Improvement Projects",
      dateViews: "Jun 22, 2025 - 4.0k Views",
      link: "/pages/blog/blog-details/",
    },
    {
      image: blog7,
      title: "Mastering the Art of Public Speaking",
      dateViews: "Jul 19, 2025 - 850 Views",
      link: "/pages/blog/blog-details/",
    },
  ];
    
  
  