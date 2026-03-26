import { useParams, Navigate } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';
import ChipBuilder from '../components/ChipBuilder';

export default function LevelRouter() {
  const { id } = useParams<{ id: string }>();
  const levelId = Number(id);
  const isUnlocked = useProgressStore((s) => s.isUnlocked(levelId));

  if (!levelId || levelId < 1 || levelId > 9) return <Navigate to="/hub" replace />;
  if (!isUnlocked) return <Navigate to="/hub" replace />;

  return <ChipBuilder key={levelId} levelId={levelId} />;
}
