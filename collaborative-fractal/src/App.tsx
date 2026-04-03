import { useState } from "react"
import { type Page } from "./utils/types"

import Home from "./pages/Home"
import Fractal from "./pages/Fractal"



const App = () => {
    const [currentPage, setCurrentPage] = useState<Page>('Home')

    const navigate = (page: Page) => setCurrentPage(page);

    const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home onNavigate={navigate} />;
      case 'Fractal':
        return <Fractal onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };
    return (
        <div>
            {renderPage()}
        </div>
    )
}

export default App