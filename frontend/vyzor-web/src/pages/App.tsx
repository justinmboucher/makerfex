// src/pages/App.tsx
// ============================================================================
// Vyzor App Shell (Main Layout)
// ----------------------------------------------------------------------------
// Purpose:
// - Provides the primary authenticated application layout shell (Sidebar, Header,
//   Footer, Switcher, Back-to-top) and renders routed page content via <Outlet/>.
//
// Important:
// - All Makerfex protected routes should be nested under the route that renders
//   <App /> so they inherit the Vyzor layout chrome.
// - Keep this file “theme-ish”: avoid Makerfex data fetching and business logic here.
// ============================================================================

import { Fragment } from "react/jsx-runtime"
import { Outlet } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { Initialload } from "../contextapi"
import Backtotop from "../shared/layouts-components/backtotop/backtotop"
import Footer from "../shared/layouts-components/footer/footer"
import Sidebar from "../shared/layouts-components/sidebar/sidebar"
import Header from "../shared/layouts-components/header/header"
import Switcher from "../shared/layouts-components/switcher/switcher"
import { data$, getState } from "../shared/layouts-components/services/switcherServices"

function App() {

	const [lateLoad, setlateLoad] = useState(false);
	const progressRef = useRef<HTMLDivElement>(null);

	const [pageloading, setpageloading] = useState(false)

	useEffect(() => {
		setlateLoad(true);
		const handleScroll = () => {
			const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const scrollPercent = (scrollTop / scrollHeight) * 100;

			if (progressRef.current) {
				progressRef.current.style.width = `${scrollPercent}%`;
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	let [variable, setVariable] = useState(getState());
	useEffect(() => {
	  const subscription = data$.subscribe((e) => {
		setVariable(e);
	  });
  
	  return () => subscription.unsubscribe();
	}, []);
  
	let containerclass = variable.dataPageStyle === 'flat' ? "main-body-container" : ""

	return (
		<>
			<Fragment>
				<Initialload.Provider value={{ pageloading, setpageloading }}>
					<div style={{ display: `${lateLoad ? "block" : "none"}` }}>
						<div ref={progressRef} className="progress-top-bar"></div>
						<Switcher />
						<div className='page'>
							<Header />
							<Sidebar />
							<div className='main-content app-content'>
							<div className={`container-fluid page-container ${containerclass}`}>
									<Outlet />
								</div>
							</div>
							<Footer />
						</div>
						<Backtotop />
					</div>
				</Initialload.Provider>
			</Fragment>
		</>
	)
}

export default App