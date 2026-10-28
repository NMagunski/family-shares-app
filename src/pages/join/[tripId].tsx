import Layout from '@/components/layout/Layout';
import Link from 'next/link';
export default function LegacyJoin() { return <Layout><h1 className="text-3xl">Присъединяване с покана</h1><p className="my-4">Помоли организатора да изпрати покана до твоя username. Старите линкове не предоставят достъп.</p><Link href="/invitations" className="text-eco-accent">Твоите покани →</Link></Layout>; }
