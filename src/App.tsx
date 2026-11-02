import { HashRouter, Route, Routes } from 'react-router-dom';
import { Celebration } from './components/Celebration';
import { SiteLayout } from './components/Layout';
import { PaymentModal } from './components/PaymentModal';
import { Toaster } from './components/Toaster';
import { DonationProvider } from './store/donations';
import Home from './pages/Home';
import Tentang from './pages/Tentang';
import Keutamaan from './pages/Keutamaan';
import Mushaf from './pages/Mushaf';
import Penyaluran from './pages/Penyaluran';
import Wakaf from './pages/Wakaf';
import PapanDonasi from './pages/PapanDonasi';
import Kontak from './pages/Kontak';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Toaster>
      <DonationProvider>
        <HashRouter>
          <PaymentModal />
          <Celebration />
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="tentang" element={<Tentang />} />
              <Route path="keutamaan" element={<Keutamaan />} />
              <Route path="mushaf" element={<Mushaf />} />
              <Route path="penyaluran" element={<Penyaluran />} />
              <Route path="wakaf" element={<Wakaf />} />
              <Route path="papan-donasi" element={<PapanDonasi />} />
              <Route path="kontak" element={<Kontak />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </DonationProvider>
    </Toaster>
  );
}
