import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import OverviewPage from './pages/OverviewPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';
import ProjectsPage from './pages/ProjectsPage';
import SkillsPage from './pages/SkillsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview"   element={<OverviewPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/about"      element={<AboutPage />} />
          <Route path="/education"  element={<EducationPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/projects"   element={<ProjectsPage />} />
          <Route path="/skills"     element={<SkillsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
