import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const TermsPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Общи условия | TripSplitly</title>
      </Head>

      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        <h1 className="text-3xl font-semibold text-eco-text">
          Общи условия за ползване на TripSplitly
        </h1>

        <p className="text-sm text-eco-text-muted">
          Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
        </p>

        <Card className="p-6 bg-eco-surface-soft/80 border border-eco-border shadow-eco-soft space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">1. Приемане на условията</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Използвайки TripSplitly, ти се съгласяваш с настоящите Общи условия. 
              Ако не приемаш някоя от точките, моля не използвай услугата.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">2. За какво служи TripSplitly</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              TripSplitly позволява създаване на пътувания, добавяне на семейства и 
              справедливо разделяне на разходи между тях. Приложението не носи отговорност 
              за неточни данни, въведени от потребителите.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">3. Потребителски акаунти</h2>
            <ul className="list-disc pl-6 text-sm text-eco-text-muted space-y-1">
              <li>Трябва да предоставиш валиден имейл адрес.</li>
              <li>Отговаряш за поверителността на твоя акаунт.</li>
              <li>Не допускай трети лица да използват профила ти.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">4. Поверителност и сигурност</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Използването на TripSplitly се подчинява на нашата 
              <Link href="/privacy" className="text-emerald-500 underline">
                {' '}Политика за поверителност
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">5. Права върху съдържанието</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Потребителите запазват правата върху съдържанието, което създават. 
              TripSplitly не използва данните за маркетинг без изрично съгласие.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">6. Ограничение на отговорността</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Приложението се предоставя “както е”. Не гарантираме безпроблемна работа, 
              непрекъсваемост или липса на грешки. TripSplitly не носи отговорност за 
              финансови спорове между потребители.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">7. Прекратяване на достъпа</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Запазваме правото да ограничим или прекратим достъпа при злоупотреба или 
              нарушение на условията.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">8. Промени в условията</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Можем да актуализираме тези условия по всяко време. При промени ще 
              уведомяваме потребителите чрез приложението.
            </p>
          </section>
        </Card>

        <div className="pt-4">
          <Link href="/">
            <Button className="px-6 py-2">Обратно към началната страница</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
