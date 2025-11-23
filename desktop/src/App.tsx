import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Marketplace from './pages/Marketplace';
import Groups from './pages/Groups';
import { Button } from './components/ui/button';
import Logo from './assets/logo.svg';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground">
        <aside className="w-64 border-r p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-4 mb-6 mt-2">
            <img src={Logo} alt="MCP Gateway" className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">MCP Gateway</h1>
          </div>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">Marketplace</Button>
          </Link>
          <Link to="/groups">
            <Button variant="ghost" className="w-full justify-start">Groups</Button>
          </Link>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/groups" element={<Groups />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
