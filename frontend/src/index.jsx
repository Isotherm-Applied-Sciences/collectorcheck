import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { DittoProvider } from './context/DittoContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

import UploadPage from './pages/UploadPage.jsx';
import UploadSuccessPage from './pages/UploadSuccessPage.jsx';
import ReceiptListPage from './pages/ReceiptListPage.jsx';
import ReceiptDetailPage from './pages/ReceiptDetailPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import VendorOverviewPage from './pages/VendorOverviewPage.jsx';
import VendorReceiptsPage from './pages/VendorReceiptsPage.jsx';
import BulkExportPage from './pages/BulkExportPage.jsx';
import TagsPage from './pages/TagsPage.jsx';
import TagReceiptsPage from './pages/TagReceiptsPage.jsx';
import ViewsPage from './pages/ViewsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import DittoSettingsPage from './pages/DittoSettingsPage.jsx';
import Ditto from './components/Ditto.jsx';
import DittoController from './components/DittoController.jsx';
import EmailScanPlaceholder from './pages/EmailScanPlaceholder.jsx';
import { handleDittoAction } from './utils/dittoActions.js';

function NavBar() {
  const [dark, setDark] = React.useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  return (
    <nav>
      <Link to="/upload">
        Upload Receipt
      </Link>
      <Link to="/receipts">View Receipts</Link>
      <Link to="/stats">Stats</Link>
      <Link to="/timeline">Timeline</Link>
      <Link to="/vendors">Vendors</Link>
      <Link to="/bulk-export">Bulk Export</Link>
      <Link to="/tags">Tags</Link>
      <Link to="/views">Views</Link>
      <Link to="/settings">Settings</Link>
      <Link to="/settings/ditto">Ditto Settings</Link>
      <button type="button" onClick={() => setDark(!dark)} style={{ marginLeft: 'auto' }}>
        {dark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </nav>
  );
}

function ReceiptDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ReceiptDetailPage
      receiptId={id}
      onBack={() => navigate('/receipts')}
    />
  );
}

function UploadSuccessWrapper() {
  const { id } = useParams();
  return <UploadSuccessPage id={id} />;
}

function DittoRoute({ page, children }) {
  const navigate = useNavigate();
  const onAction = (action, payload) => handleDittoAction(action, navigate, payload);

  return (
    <DittoController page={page} onAction={onAction}>
      {({ shouldAppear, reason, visit, onAction: dittoAction }) => (
        <>
          {shouldAppear && (
            <Ditto
              reason={reason}
              visit={visit}
              page={page}
              onAction={dittoAction}
            />
          )}
          {children}
        </>
      )}
    </DittoController>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<DittoRoute page="upload"><UploadPage /></DittoRoute>} />
        <Route path="/upload" element={<DittoRoute page="upload"><UploadPage /></DittoRoute>} />
        <Route path="/upload/success/:id" element={<DittoRoute page="upload"><UploadSuccessWrapper /></DittoRoute>} />
        <Route path="/email-scan" element={<DittoRoute page="email-scan"><EmailScanPlaceholder /></DittoRoute>} />
        <Route path="/receipts" element={<DittoRoute page="list"><ReceiptListPage /></DittoRoute>} />
        <Route path="/receipts/:id" element={<DittoRoute page="detail"><ReceiptDetailWrapper /></DittoRoute>} />
        <Route path="/stats" element={<DittoRoute page="stats"><StatsPage /></DittoRoute>} />
        <Route path="/timeline" element={<DittoRoute page="timeline"><TimelinePage /></DittoRoute>} />
        <Route path="/vendors" element={<DittoRoute page="vendors"><VendorOverviewPage /></DittoRoute>} />
        <Route path="/vendors/:vendor" element={<DittoRoute page="vendors"><VendorReceiptsPage /></DittoRoute>} />
        <Route path="/bulk-export" element={<DittoRoute page="bulk-export"><BulkExportPage /></DittoRoute>} />
        <Route path="/tags" element={<DittoRoute page="tags"><TagsPage /></DittoRoute>} />
        <Route path="/tags/:tag" element={<DittoRoute page="tags"><TagReceiptsPage /></DittoRoute>} />
        <Route path="/views" element={<DittoRoute page="views"><ViewsPage /></DittoRoute>} />
        <Route path="/settings" element={<DittoRoute page="settings"><SettingsPage /></DittoRoute>} />
        <Route path="/settings/ditto" element={<DittoRoute page="settings"><DittoSettingsPage /></DittoRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DittoProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </DittoProvider>
  </React.StrictMode>
);
