import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plane, Plus, Receipt, Scale } from 'lucide-react';

type Props = { onNewTrip?: () => void };
export default function MobileNavigation({ onNewTrip }: Props) {
  const router = useRouter();
  const inTrip = router.pathname === '/trips/[tripId]';
  const [fragment, setFragment] = useState('');
  useEffect(() => {
    const update = () => setFragment(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => setKeyboardOpen(window.innerHeight - viewport.height > 150);
    viewport.addEventListener('resize', update);
    update();
    return () => viewport.removeEventListener('resize', update);
  }, []);
  if ((!onNewTrip && !inTrip) || keyboardOpen) return null;
  return <nav className="mobile-bottom-nav" aria-label={inTrip ? 'Навигация в пътуването' : 'Основна навигация'}>
    <Link href="/" aria-current={router.pathname === '/' ? 'page' : undefined}><Plane size={22} aria-hidden="true" /><span>Пътувания</span></Link>
    {onNewTrip && <button type="button" onClick={onNewTrip} className="mobile-create"><span className="mobile-plus"><Plus size={26} aria-hidden="true" /></span><span>Нов</span></button>}
    {inTrip && <><a href="#trip-expenses" aria-current={fragment === '#trip-expenses' ? 'location' : undefined}><Receipt size={22} aria-hidden="true" /><span>Разходи</span></a><a href="#trip-debts" aria-current={fragment === '#trip-debts' ? 'location' : undefined}><Scale size={22} aria-hidden="true" /><span>Баланси</span></a></>}
  </nav>;
}
