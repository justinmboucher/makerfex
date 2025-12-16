import { lazy } from 'react'
import AreaChart from '../../components/charts/apex-charts/area-chart/area-chart';
import BarChart from '../../components/charts/apex-charts/bar-chart/bar-chart';
import BoxplotChart from '../../components/charts/apex-charts/boxplot-chart/boxplot-chart';
import BubbleChart from '../../components/charts/apex-charts/bubble-chart/bubble-chart';
import CandlestickChart from '../../components/charts/apex-charts/candlestick-chart/candlestick-chart';
import ColumnChart from '../../components/charts/apex-charts/column-chart/column-chart';
import FunnelChart from '../../components/charts/apex-charts/funnel-chart/funnel-chart';
import HeatmapChart from '../../components/charts/apex-charts/heatmap-chart/heatmap-chart';
import LineChart from '../../components/charts/apex-charts/line-chart/line-chart';
import MixedChart from '../../components/charts/apex-charts/mixed-chart/mixed-chart';
import PieChart from '../../components/charts/apex-charts/pie-chart/pie-chart';
import PolarareaChart from '../../components/charts/apex-charts/polararea-chart/polararea-chart';
import RadarChart from '../../components/charts/apex-charts/radar-chart/radar-chart';
import RadialbarChart from '../../components/charts/apex-charts/radialbar-chart/radialbar-chart';
import RangeAreaChart from '../../components/charts/apex-charts/range-area-chart/range-area-chart';
import ScatterChart from '../../components/charts/apex-charts/scatter-chart/scatter-chart';
import TimelineChart from '../../components/charts/apex-charts/timeline-chart/timeline-chart';
import TreemapChart from '../../components/charts/apex-charts/treemap-chart/treemap-chart';
import ChartjsCharts from '../../components/charts/chartjs-charts/chartjs-charts';
import EchartCharts from '../../components/charts/echart-charts/echart-charts';
const Alerts = lazy(() => import('../../components/general/ui-elements/alerts/alerts'));
const Badge = lazy(() => import('../../components/general/ui-elements/badge/badge'));
const Breadcrumbs = lazy(() => import('../../components/general/ui-elements/breadcrumb/breadcrumb'));
const Buttons = lazy(() => import('../../components/general/ui-elements/buttons/buttons'));
const ButtonGroups = lazy(() => import('../../components/general/ui-elements/button-group/button-group'));
const Cards = lazy(() => import('../../components/general/ui-elements/cards/cards'));
const Dropdowns = lazy(() => import('../../components/general/ui-elements/dropdowns/dropdowns'));
const ImagesFigures = lazy(() => import('../../components/general/ui-elements/images-figures/images-figures'));
const LinksInteractions = lazy(() => import('../../components/general/ui-elements/links-interactions/links-interactions'));
const ListGroups = lazy(() => import('../../components/general/ui-elements/list-group/list-group'));
const NavsTabs = lazy(() => import('../../components/general/ui-elements/navs-tabs/navs-tabs'));
const ObjectFit = lazy(() => import('../../components/general/ui-elements/object-fit/object-fit'));
const Paginations = lazy(() => import('../../components/general/ui-elements/pagination/pagination'));
const Popovers = lazy(() => import('../../components/general/ui-elements/popovers/popovers'));
const Progress = lazy(() => import('../../components/general/ui-elements/progress/progress'));
const Spinners = lazy(() => import('../../components/general/ui-elements/spinners/spinners'));
const Toasts = lazy(() => import('../../components/general/ui-elements/toasts/toasts'));
const Tooltips = lazy(() => import('../../components/general/ui-elements/tooltips/tooltips'));
const Typography = lazy(() => import('../../components/general/ui-elements/typography/typography'));
const Avatars = lazy(() => import('../../components/general/utilities/avatars/avatars'));
const Borders = lazy(() => import('../../components/general/utilities/borders/borders'));
const Breakpoints = lazy(() => import('../../components/general/utilities/breakpoints/breakpoints'));
const Colors = lazy(() => import('../../components/general/utilities/colors/colors'));
const Columns = lazy(() => import('../../components/general/utilities/columns/columns'));
const CssGrid = lazy(() => import('../../components/general/utilities/css-grid/css-grid'));
const Flex = lazy(() => import('../../components/general/utilities/flex/flex'));
const Gutters = lazy(() => import('../../components/general/utilities/gutters/gutters'));
const Helpers = lazy(() => import('../../components/general/utilities/helpers/helpers'));
const Position = lazy(() => import('../../components/general/utilities/position/position'));
const AdditionalContent = lazy(() => import('../../components/general/utilities/additional-content/additional-content'));
const AccordionsCollapse = lazy(() => import('../../components/general/advanced-ui/accordions-collapse/accordions-collapse'));
const Carousel = lazy(() => import('../../components/general/advanced-ui/carousel/carousel'));
const DraggableCards = lazy(() => import('../../components/general/advanced-ui/draggable-cards/draggable-cards'));
const MediaPlayer = lazy(() => import('../../components/general/advanced-ui/media-player/media-player'));
const ModalsCloses = lazy(() => import('../../components/general/advanced-ui/modals-closes/modals-closes'));
const Navbars = lazy(() => import('../../components/general/advanced-ui/navbar/navbar'));
const Offcanvass = lazy(() => import('../../components/general/advanced-ui/offcanvas/offcanvas'));
const Placeholders = lazy(() => import('../../components/general/advanced-ui/placeholders/placeholders'));
const SwiperJs = lazy(() => import('../../components/general/advanced-ui/swiper-js/swiper-js'));
const Ratings = lazy(() => import('../../components/general/advanced-ui/ratings/ratings'));
const Ribbons = lazy(() => import('../../components/general/advanced-ui/ribbons/ribbons'));
const Sortablejs = lazy(() => import('../../components/general/advanced-ui/sortable-js/sortable-js'));
const Tour = lazy(() => import('../../components/general/advanced-ui/tour/tour'));
const Pigeonmaps = lazy(() => import('../../components/maps/pigeon-maps/page'));
const Blog = lazy(() => import('../../components/pages/blog/blog/blog'));
const BlogDetails = lazy(() => import('../../components/pages/blog/blog-details/blog-details'));
const BlogCreate = lazy(() => import('../../components/pages/blog/create-blog/create-blog'));
const Empty = lazy(() => import('../../components/pages/empty/empty'));
const FormAdvanced = lazy(() => import('../../components/pages/forms/form-advanced/form-advanced'));
const Inputs = lazy(() => import('../../components/pages/forms/form-elements/inputs/inputs'));
const ChecksRadios = lazy(() => import('../../components/pages/forms/form-elements/checks-radios/checks-radios'));
const InputGroups = lazy(() => import('../../components/pages/forms/form-elements/input-group/input-group'));
const FormSelect = lazy(() => import('../../components/pages/forms/form-elements/form-select/form-select'));
const InputMasks = lazy(() => import('../../components/pages/forms/form-elements/input-masks/input-masks'));
const Timeline = lazy(() => import('../../components/pages/timeline/timeline'));
const TermsConditions = lazy(() => import('../../components/pages/terms-conditions/terms-conditions'));
const Team = lazy(() => import('../../components/pages/team/team'));
const Search = lazy(() => import('../../components/pages/search/search'));
const Testimonials = lazy(() => import('../../components/pages/testimonials/testimonials'));
const ProfileSettings = lazy(() => import('../../components/pages/profile-settings/profile-settings'));
const Profile = lazy(() => import('../../components/pages/profile/profile'));
const Pricing = lazy(() => import('../../components/pages/pricing/pricing'));
const InvoiceList = lazy(() => import('../../components/pages/invoice/invoice-list/invoice-list'));
const InvoiceDetails = lazy(() => import('../../components/pages/invoice/invoice-details/invoice-details'));
const CreateInvoice = lazy(() => import('../../components/pages/invoice/create-invoice/create-invoice'));
const Faqs = lazy(() => import('../../components/pages/faqs/faqs'));
const Select2 = lazy(() => import('../../components/pages/forms/select2/select2'));
const Validation = lazy(() => import('../../components/pages/forms/validation/validation'));
const QuillEditor = lazy(() => import('../../components/pages/forms/sun-editor/sun-editor'));
const FormWizards = lazy(() => import('../../components/pages/forms/form-wizards/form-wizards'));
const FormLayouts = lazy(() => import('../../components/pages/forms/form-layouts/form-layouts'));
const FloatingLabels = lazy(() => import('../../components/pages/forms/floating-labels/floating-labels'));
const ColorPickers = lazy(() => import('../../components/pages/forms/form-elements/color-picker/color-picker'));
const DateTimePicker = lazy(() => import('../../components/pages/forms/form-elements/date-time-picker/date-time-picker'));
const FileUploads = lazy(() => import('../../components/pages/forms/form-elements/file-uploads/file-uploads'));
const RangeSlider = lazy(() => import('../../components/pages/forms/form-elements/range-slider/range-slider'));
const Chat = lazy(() => import('../../components/applications/chat/chat'));
const MailApp = lazy(() => import('../../components/applications/email/mail-app/mail-app'));
const MailSettings = lazy(() => import('../../components/applications/email/mail-settings/mail-settings'));
const FileManager = lazy(() => import('../../components/applications/file-manager/file-manager'));
const Fullcalendar = lazy(() => import('../../components/applications/full-calendar/full-calendar'));
const Gallery = lazy(() => import('../../components/applications/gallery/gallery'));
const SweetAlerts = lazy(() => import('../../components/applications/sweet-alerts/sweet-alerts'));
const KanbanBoard = lazy(() => import('../../components/applications/task/kanban-board/kanban-board'));
const TaskListView = lazy(() => import('../../components/applications/task/list-view/list-view'));
const ToDoList = lazy(() => import('../../components/applications/to-do-list/to-do-list'));
const Leafletmaps = lazy(() => import('../../components/maps/leaflet-maps/page'));
const Tables = lazy(() => import('../../components/tables/tables/tables'));
const GridJsTables = lazy(() => import( '../../components/tables/grid-js-tables/grid-js-tables'));
const DataTables = lazy(() => import( '../../components/tables/data-tables/data-tables'));
const Icons  = lazy(() => import('../../components/icons/page'));
const Widgets  = lazy(() => import('../../components/widgets/widgets'));
const Leads = lazy(() => import('../../components/dashboards/crm/leads/leads'));
const Deals = lazy(() => import('../../components/dashboards/crm/deals/deals'));
const Projects = lazy(() => import('../../components/dashboards/projects/dashboard/dashboard'));
const ProjectsList = lazy(() => import('../../components/dashboards/projects/projects-list/projects-list'));
const ProjectsOverview = lazy(() => import('../../components/dashboards/projects/project-overview/project-overview'));
const CreateProject = lazy(() => import('../../components/dashboards/projects/create-project/create-project'));
const Hrm = lazy(() => import('../../components/dashboards/hrm/hrm'));
const Courses = lazy(() => import('../../components/dashboards/courses/courses'));
const Stocks = lazy(() => import('../../components/dashboards/stocks/stocks'));
const Nft = lazy(() => import('../../components/dashboards/nft/dashboard/dashboard'));
const MarketPlace = lazy(() => import('../../components/dashboards/nft/market-place/market-place'));
const NftDetails = lazy(() => import('../../components/dashboards/nft/nft-details/nft-details'));
const CreateNft = lazy(() => import('../../components/dashboards/nft/create-nft/create-nft'));
const WalletIntegration = lazy(() => import('../../components/dashboards/nft/wallet-integration/wallet-integration'));
const LiveAuction = lazy(() => import('../../components/dashboards/nft/live-auction/live-auction'));
const Jobs = lazy(() => import('../../components/dashboards/jobs/dashboard/dashboard'));
const JobDetails = lazy(() => import('../../components/dashboards/jobs/job-details/job-details'));
const SearchCompany = lazy(() => import('../../components/dashboards/jobs/search-company/search-company'));
const SearchJobs = lazy(() => import('../../components/dashboards/jobs/search-jobs/search-jobs'));
const PostJob = lazy(() => import('../../components/dashboards/jobs/job-post/job-post'));
const JobsList = lazy(() => import('../../components/dashboards/jobs/jobs-list/jobs-list'));
const SearchCandidate = lazy(() => import('../../components/dashboards/jobs/search-candidate/search-candidate'));
const CandidateDetails = lazy(() => import('../../components/dashboards/jobs/candidate-details/candidate-details'));
const Podcast = lazy(() => import('../../components/dashboards/podcast/podcast'));
const SocialMedia = lazy(() => import('../../components/dashboards/social-media/social-media'));
const School = lazy(() => import('../../components/dashboards/school/school'));
const Medical = lazy(() => import('../../components/dashboards/medical/medical'));
const PosSystem = lazy(() => import('../../components/dashboards/pos-system/pos-system'));
const Companies = lazy(() => import('../../components/dashboards/crm/companies/companies'));
const Contacts = lazy(() => import('../../components/dashboards/crm/contacts/contacts'));
const CRM = lazy(() => import('../../components/dashboards/crm/dashboard/dashboard'));
const Wallet = lazy(() => import('../../components/dashboards/crypto/wallet/wallet'));
const Marketcap = lazy(() => import('../../components/dashboards/crypto/market-cap/market-cap'));
const BuySell = lazy(() => import('../../components/dashboards/crypto/buy-sell/buy-sell'));
const CurrencyExchange = lazy(() => import('../../components/dashboards/crypto/currency-exchange/currency-exchange'));
const Transactions = lazy(() => import('../../components/dashboards/crypto/transactions/transactions'));
const Crypto = lazy(() => import('../../components/dashboards/crypto/dashboard/dashboard'));
const AddProduct = lazy(() => import('../../components/dashboards/ecommerce/add-product/add-product'));
const OrderDetails = lazy(() => import('../../components/dashboards/ecommerce/order-details/order-details'));
const Orders = lazy(() => import('../../components/dashboards/ecommerce/orders/orders'));
const CustomersList = lazy(() => import('../../components/dashboards/ecommerce/customers/customers'));
const Checkout = lazy(() => import('../../components/dashboards/ecommerce/checkout/checkout'));
const Cart = lazy(() => import('../../components/dashboards/ecommerce/cart/cart'));
const ProductDetails = lazy(() => import('../../components/dashboards/ecommerce/product-details/product-details'));
const Products = lazy(() => import('../../components/dashboards/ecommerce/products/products'));
const Sales = lazy(() => import('../../components/dashboards/sale/sale'));
const Analytics = lazy(() => import('../../components/dashboards/analytics/analytics'));
const Dashboard = lazy(() => import('../../components/dashboards/ecommerce/dashboard/dashboard'));

export const RouteData = [
    { id: 1, path: `${import.meta.env.BASE_URL}dashboards/sales`, element: <Sales /> },
    { id: 2, path: `${import.meta.env.BASE_URL}dashboards/analytics`, element: <Analytics /> },
    { id: 3, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/dashboard`, element: <Dashboard /> },
    { id: 4, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/products`, element: <Products /> },
    { id: 5, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/product-details`, element: <ProductDetails /> },
    { id: 6, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/cart`, element: <Cart /> },
    { id: 7, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/checkout`, element: <Checkout /> },
    { id: 8, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/customers`, element: <CustomersList /> },
    { id: 9, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/orders`, element: <Orders /> },
    { id: 10, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/order-details`, element: <OrderDetails /> },
    { id: 11, path: `${import.meta.env.BASE_URL}dashboards/ecommerce/add-product`, element: <AddProduct /> },
    { id: 12, path: `${import.meta.env.BASE_URL}dashboards/crypto/dashboard`, element: <Crypto /> },
    { id: 13, path: `${import.meta.env.BASE_URL}dashboards/crypto/transactions`, element: <Transactions /> },
    { id: 14, path: `${import.meta.env.BASE_URL}dashboards/crypto/currency-exchange`, element: <CurrencyExchange /> },
    { id: 15, path: `${import.meta.env.BASE_URL}dashboards/crypto/buy-sell`, element: <BuySell /> },
    { id: 16, path: `${import.meta.env.BASE_URL}dashboards/crypto/market-cap`, element: <Marketcap /> },
    { id: 17, path: `${import.meta.env.BASE_URL}dashboards/crypto/wallet`, element: <Wallet /> },
    { id: 18, path: `${import.meta.env.BASE_URL}dashboards/crm/dashboard`, element: <CRM /> },
    { id: 19, path: `${import.meta.env.BASE_URL}dashboards/crm/contacts`, element: <Contacts /> },
    { id: 20, path: `${import.meta.env.BASE_URL}dashboards/crm/companies`, element: <Companies /> },
    { id: 21, path: `${import.meta.env.BASE_URL}dashboards/crm/deals`, element: <Deals /> },
    { id: 22, path: `${import.meta.env.BASE_URL}dashboards/crm/leads`, element: <Leads /> },
    { id: 23, path: `${import.meta.env.BASE_URL}dashboards/projects/dashboard`, element: <Projects /> },
    { id: 24, path: `${import.meta.env.BASE_URL}dashboards/projects/projects-list`, element: <ProjectsList /> },
    { id: 25, path: `${import.meta.env.BASE_URL}dashboards/projects/project-overview`, element: <ProjectsOverview /> },
    { id: 26, path: `${import.meta.env.BASE_URL}dashboards/projects/create-project`, element: <CreateProject /> },
    { id: 27, path: `${import.meta.env.BASE_URL}dashboards/hrm`, element: <Hrm /> },
    { id: 28, path: `${import.meta.env.BASE_URL}dashboards/courses`, element: <Courses /> },
    { id: 29, path: `${import.meta.env.BASE_URL}dashboards/stocks`, element: <Stocks /> },
    { id: 30, path: `${import.meta.env.BASE_URL}dashboards/nft/dashboard`, element: <Nft /> },
    { id: 31, path: `${import.meta.env.BASE_URL}dashboards/nft/market-place`, element: <MarketPlace /> },
    { id: 32, path: `${import.meta.env.BASE_URL}dashboards/nft/nft-details`, element: <NftDetails /> },
    { id: 33, path: `${import.meta.env.BASE_URL}dashboards/nft/create-nft`, element: <CreateNft /> },
    { id: 34, path: `${import.meta.env.BASE_URL}dashboards/nft/wallet-integration`, element: <WalletIntegration /> },
    { id: 35, path: `${import.meta.env.BASE_URL}dashboards/nft/live-auction`, element: <LiveAuction /> },
    { id: 36, path: `${import.meta.env.BASE_URL}dashboards/jobs/dashboard`, element: <Jobs /> },
    { id: 37, path: `${import.meta.env.BASE_URL}dashboards/jobs/job-details`, element: <JobDetails /> },
    { id: 38, path: `${import.meta.env.BASE_URL}dashboards/jobs/search-company`, element: <SearchCompany /> },
    { id: 39, path: `${import.meta.env.BASE_URL}dashboards/jobs/search-jobs`, element: <SearchJobs /> },
    { id: 40, path: `${import.meta.env.BASE_URL}dashboards/jobs/job-post`, element: <PostJob /> },
    { id: 41, path: `${import.meta.env.BASE_URL}dashboards/jobs/jobs-list`, element: <JobsList /> },
    { id: 42, path: `${import.meta.env.BASE_URL}dashboards/jobs/search-candidate`, element: <SearchCandidate /> },
    { id: 43, path: `${import.meta.env.BASE_URL}dashboards/jobs/candidate-details`, element: <CandidateDetails /> },
    { id: 44, path: `${import.meta.env.BASE_URL}dashboards/podcast`, element: <Podcast /> },
    { id: 45, path: `${import.meta.env.BASE_URL}dashboards/social-media`, element: <SocialMedia /> },
    { id: 46, path: `${import.meta.env.BASE_URL}dashboards/school`, element: <School /> },
    { id: 47, path: `${import.meta.env.BASE_URL}dashboards/medical`, element: <Medical /> },
    { id: 48, path: `${import.meta.env.BASE_URL}dashboards/pos-system`, element: <PosSystem /> },
    { id: 49, path: `${import.meta.env.BASE_URL}applications/chat`, element: <Chat /> },
    { id: 50, path: `${import.meta.env.BASE_URL}applications/email/mail-app`, element: <MailApp /> },
    { id: 51, path: `${import.meta.env.BASE_URL}applications/email/mail-settings`, element: <MailSettings /> },
    { id: 52, path: `${import.meta.env.BASE_URL}applications/file-manager`, element: <FileManager /> },
    { id: 53, path: `${import.meta.env.BASE_URL}applications/full-calendar`, element: <Fullcalendar /> },
    { id: 54, path: `${import.meta.env.BASE_URL}applications/gallery`, element: <Gallery /> },
    { id: 55, path: `${import.meta.env.BASE_URL}applications/sweet-alerts`, element: <SweetAlerts /> },
    { id: 56, path: `${import.meta.env.BASE_URL}applications/task/kanban-board`, element: <KanbanBoard /> },
    { id: 57, path: `${import.meta.env.BASE_URL}applications/task/list-view`, element: <TaskListView /> },
    { id: 58, path: `${import.meta.env.BASE_URL}applications/to-do-list`, element: <ToDoList /> },
    { id: 59, path: `${import.meta.env.BASE_URL}pages/blog/blog`, element: <Blog /> },
    { id: 60, path: `${import.meta.env.BASE_URL}pages/blog/blog-details`, element: <BlogDetails /> },
    { id: 61, path: `${import.meta.env.BASE_URL}pages/blog/create-blog`, element: <BlogCreate /> },
    { id: 62, path: `${import.meta.env.BASE_URL}pages/empty`, element: <Empty /> },
    { id: 63, path: `${import.meta.env.BASE_URL}pages/forms/form-advanced`, element: <FormAdvanced /> },
    { id: 64, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/inputs`, element: <Inputs /> },
    { id: 65, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/checks-radios`, element: <ChecksRadios /> },
    { id: 66, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/input-group`, element: <InputGroups /> },
    { id: 67, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/form-select`, element: <FormSelect /> },
    { id: 68, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/range-slider`, element: <RangeSlider /> },    
    { id: 69, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/input-masks`, element: <InputMasks /> },
    { id: 70, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/file-uploads`, element: <FileUploads /> },
    { id: 71, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/date-time-picker`, element: <DateTimePicker /> },
    { id: 72, path: `${import.meta.env.BASE_URL}pages/forms/form-elements/color-picker`, element: <ColorPickers /> },
    { id: 73, path: `${import.meta.env.BASE_URL}pages/forms/floating-labels`, element: <FloatingLabels /> },
    { id: 74, path: `${import.meta.env.BASE_URL}pages/forms/form-layouts`, element: <FormLayouts /> },
    { id: 75, path: `${import.meta.env.BASE_URL}pages/forms/form-wizards`, element: <FormWizards /> },
    { id: 76, path: `${import.meta.env.BASE_URL}pages/forms/sun-editor`, element: <QuillEditor /> },
    { id: 77, path: `${import.meta.env.BASE_URL}pages/forms/validation`, element: <Validation /> },
    { id: 78, path: `${import.meta.env.BASE_URL}pages/forms/select2`, element: <Select2 /> },
    { id: 79, path: `${import.meta.env.BASE_URL}pages/faqs`, element: <Faqs /> },
    { id: 80, path: `${import.meta.env.BASE_URL}pages/invoice/create-invoice`, element: <CreateInvoice /> },    
    { id: 81, path: `${import.meta.env.BASE_URL}pages/invoice/invoice-details`, element: <InvoiceDetails /> },
    { id: 82, path: `${import.meta.env.BASE_URL}pages/invoice/invoice-list`, element: <InvoiceList /> },
    { id: 83, path: `${import.meta.env.BASE_URL}pages/pricing`, element: <Pricing /> },
    { id: 84, path: `${import.meta.env.BASE_URL}pages/profile`, element: <Profile /> },
    { id: 85, path: `${import.meta.env.BASE_URL}pages/profile-settings`, element: <ProfileSettings /> },
    { id: 86, path: `${import.meta.env.BASE_URL}pages/testimonials`, element: <Testimonials /> },
    { id: 87, path: `${import.meta.env.BASE_URL}pages/search`, element: <Search /> },
    { id: 88, path: `${import.meta.env.BASE_URL}pages/team`, element: <Team /> },
    { id: 89, path: `${import.meta.env.BASE_URL}pages/terms-conditions`, element: <TermsConditions /> },
    { id: 90, path: `${import.meta.env.BASE_URL}pages/timeline`, element: <Timeline /> },
    { id: 91, path: `${import.meta.env.BASE_URL}general/ui-elements/alerts`, element: <Alerts /> },
    { id: 92, path: `${import.meta.env.BASE_URL}general/ui-elements/badge`, element: <Badge /> },
    { id: 93, path: `${import.meta.env.BASE_URL}general/ui-elements/breadcrumb`, element: <Breadcrumbs /> },
    { id: 94, path: `${import.meta.env.BASE_URL}general/ui-elements/buttons`, element: <Buttons /> },
    { id: 95, path: `${import.meta.env.BASE_URL}general/ui-elements/button-group`, element: <ButtonGroups /> },
    { id: 96, path: `${import.meta.env.BASE_URL}general/ui-elements/cards`, element: <Cards /> },
    { id: 97, path: `${import.meta.env.BASE_URL}general/ui-elements/dropdowns`, element: <Dropdowns /> },
    { id: 98, path: `${import.meta.env.BASE_URL}general/ui-elements/images-figures`, element: <ImagesFigures /> },
    { id: 99, path: `${import.meta.env.BASE_URL}general/ui-elements/links-interactions`, element: <LinksInteractions /> },
    { id: 100, path: `${import.meta.env.BASE_URL}general/ui-elements/list-group`, element: <ListGroups /> },
    { id: 101, path: `${import.meta.env.BASE_URL}general/ui-elements/navs-tabs`, element: <NavsTabs /> },
    { id: 102, path: `${import.meta.env.BASE_URL}general/ui-elements/object-fit`, element: <ObjectFit /> },
    { id: 103, path: `${import.meta.env.BASE_URL}general/ui-elements/pagination`, element: <Paginations /> },
    { id: 104, path: `${import.meta.env.BASE_URL}general/ui-elements/popovers`, element: <Popovers /> },
    { id: 105, path: `${import.meta.env.BASE_URL}general/ui-elements/progress`, element: <Progress /> },
    { id: 106, path: `${import.meta.env.BASE_URL}general/ui-elements/spinners`, element: <Spinners /> },
    { id: 107, path: `${import.meta.env.BASE_URL}general/ui-elements/toasts`, element: <Toasts /> },
    { id: 108, path: `${import.meta.env.BASE_URL}general/ui-elements/tooltips`, element: <Tooltips /> },
    { id: 109, path: `${import.meta.env.BASE_URL}general/ui-elements/typography`, element: <Typography /> },
    { id: 110, path: `${import.meta.env.BASE_URL}general/utilities/avatars`, element: <Avatars /> },
    { id: 111, path: `${import.meta.env.BASE_URL}general/utilities/borders`, element: <Borders /> },
    { id: 112, path: `${import.meta.env.BASE_URL}general/utilities/breakpoints`, element: <Breakpoints /> },
    { id: 113, path: `${import.meta.env.BASE_URL}general/utilities/colors`, element: <Colors /> },
    { id: 114, path: `${import.meta.env.BASE_URL}general/utilities/columns`, element: <Columns /> },
    { id: 115, path: `${import.meta.env.BASE_URL}general/utilities/css-grid`, element: <CssGrid /> },
    { id: 116, path: `${import.meta.env.BASE_URL}general/utilities/flex`, element: <Flex /> },
    { id: 117, path: `${import.meta.env.BASE_URL}general/utilities/gutters`, element: <Gutters /> },
    { id: 118, path: `${import.meta.env.BASE_URL}general/utilities/helpers`, element: <Helpers /> },
    { id: 119, path: `${import.meta.env.BASE_URL}general/utilities/position`, element: <Position /> },
    { id: 120, path: `${import.meta.env.BASE_URL}general/utilities/additional-content`, element: <AdditionalContent /> },
    { id: 121, path: `${import.meta.env.BASE_URL}general/advanced-ui/accordions-collapse`, element: <AccordionsCollapse /> },
    { id: 122, path: `${import.meta.env.BASE_URL}general/advanced-ui/carousel`, element: <Carousel /> },
    { id: 123, path: `${import.meta.env.BASE_URL}general/advanced-ui/draggable-cards`, element: <DraggableCards /> },
    { id: 124, path: `${import.meta.env.BASE_URL}general/advanced-ui/media-player`, element: <MediaPlayer /> },
    { id: 125, path: `${import.meta.env.BASE_URL}general/advanced-ui/modals-closes`, element: <ModalsCloses /> },
    { id: 126, path: `${import.meta.env.BASE_URL}general/advanced-ui/navbar`, element: <Navbars /> },
    { id: 127, path: `${import.meta.env.BASE_URL}general/advanced-ui/offcanvas`, element: <Offcanvass /> },
    { id: 128, path: `${import.meta.env.BASE_URL}general/advanced-ui/placeholders`, element: <Placeholders /> },
    { id: 129, path: `${import.meta.env.BASE_URL}general/advanced-ui/ratings`, element: <Ratings /> },
    { id: 130, path: `${import.meta.env.BASE_URL}general/advanced-ui/ribbons`, element: <Ribbons /> },
    { id: 131, path: `${import.meta.env.BASE_URL}general/advanced-ui/sortable-js`, element: <Sortablejs /> },
    { id: 132, path: `${import.meta.env.BASE_URL}general/advanced-ui/swiper-js`, element: <SwiperJs /> },
    { id: 133, path: `${import.meta.env.BASE_URL}general/advanced-ui/tour`, element: <Tour /> },
    { id: 134, path: `${import.meta.env.BASE_URL}widgets`, element: <Widgets /> },
    { id: 135, path: `${import.meta.env.BASE_URL}maps/pigeon-maps`, element: <Pigeonmaps /> },
    { id: 136, path: `${import.meta.env.BASE_URL}maps/leaflet-maps`, element: <Leafletmaps /> },
    { id: 137, path: `${import.meta.env.BASE_URL}icons`, element: <Icons /> },
    { id: 138, path: `${import.meta.env.BASE_URL}charts/apex-charts/area-chart`, element: <AreaChart /> },
    { id: 139, path: `${import.meta.env.BASE_URL}charts/apex-charts/bar-chart`, element: <BarChart /> },
    { id: 140, path: `${import.meta.env.BASE_URL}charts/apex-charts/boxplot-chart`, element: <BoxplotChart /> },
    { id: 141, path: `${import.meta.env.BASE_URL}charts/apex-charts/bubble-chart`, element: <BubbleChart /> },
    { id: 142, path: `${import.meta.env.BASE_URL}charts/apex-charts/candlestick-chart`, element: <CandlestickChart /> },
    { id: 143, path: `${import.meta.env.BASE_URL}charts/apex-charts/column-chart`, element: <ColumnChart /> },
    { id: 144, path: `${import.meta.env.BASE_URL}charts/apex-charts/funnel-chart`, element: <FunnelChart /> },
    { id: 145, path: `${import.meta.env.BASE_URL}charts/apex-charts/heatmap-chart`, element: <HeatmapChart /> },
    { id: 146, path: `${import.meta.env.BASE_URL}charts/apex-charts/line-chart`, element: <LineChart /> },
    { id: 147, path: `${import.meta.env.BASE_URL}charts/apex-charts/mixed-chart`, element: <MixedChart /> },
    { id: 148, path: `${import.meta.env.BASE_URL}charts/apex-charts/pie-chart`, element: <PieChart /> },
    { id: 149, path: `${import.meta.env.BASE_URL}charts/apex-charts/polararea-chart`, element: <PolarareaChart /> },
    { id: 150, path: `${import.meta.env.BASE_URL}charts/apex-charts/radar-chart`, element: <RadarChart /> },
    { id: 151, path: `${import.meta.env.BASE_URL}charts/apex-charts/radialbar-chart`, element: <RadialbarChart /> },
    { id: 152, path: `${import.meta.env.BASE_URL}charts/apex-charts/range-area-chart`, element: <RangeAreaChart /> },
    { id: 153, path: `${import.meta.env.BASE_URL}charts/apex-charts/scatter-chart`, element: <ScatterChart /> },
    { id: 154, path: `${import.meta.env.BASE_URL}charts/apex-charts/timeline-chart`, element: <TimelineChart /> },
    { id: 155, path: `${import.meta.env.BASE_URL}charts/apex-charts/treemap-chart`, element: <TreemapChart /> },
    { id: 156, path: `${import.meta.env.BASE_URL}charts/chartjs-charts`, element: <ChartjsCharts /> },
    { id: 157, path: `${import.meta.env.BASE_URL}charts/echart-charts`, element: <EchartCharts /> },
    { id: 158, path: `${import.meta.env.BASE_URL}tables/tables`, element: <Tables /> },
    { id: 159, path: `${import.meta.env.BASE_URL}tables/grid-js-tables`, element: <GridJsTables /> },
    { id: 160, path: `${import.meta.env.BASE_URL}tables/data-tables`, element: <DataTables /> },
];