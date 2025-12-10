import React from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const PrivacyPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Политика за поверителност | TripSplitly</title>
      </Head>

      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        <h1 className="text-3xl font-semibold text-eco-text">
          Политика за поверителност и обработка на данни
        </h1>

        <p className="text-sm text-eco-text-muted">
          Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
        </p>

        <Card className="p-6 bg-eco-surface-soft/80 border border-eco-border shadow-eco-soft space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">1. Кои сме ние</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              TripSplitly е приложение за организиране на пътувания и справедливо
              разделяне на разходи между семейства и приятели. Тази политика обяснява
              какви данни събираме, защо ги събираме и как се използват те.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">2. Какви данни събираме</h2>

            <h3 className="font-medium text-eco-text mt-4 mb-1">2.1 Данни за акаунта</h3>
            <ul className="list-disc pl-6 text-sm text-eco-text-muted space-y-1">
              <li>Имейл адрес</li>
              <li>Име / псевдоним (ако е предоставено)</li>
              <li>Уникален идентификатор (UID от Firebase Authentication)</li>
            </ul>

            <h3 className="font-medium text-eco-text mt-4 mb-1">2.2 Данни за пътуванията</h3>
            <ul className="list-disc pl-6 text-sm text-eco-text-muted space-y-1">
              <li>Име на пътуване</li>
              <li>Вид пътуване</li>
              <li>Държава и валута</li>
              <li>Дата на създаване и статус</li>
            </ul>

            <h3 className="font-medium text-eco-text mt-4 mb-1">2.3 Семейства и участници</h3>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Записваме имена на семейства и връзката им с дадено пътуване.
              Приложението не изисква реални лични имена — използването им е изцяло по избор.
            </p>

            <h3 className="font-medium text-eco-text mt-4 mb-1">2.4 Данни за разходите</h3>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              За всеки разход се съхраняват платецът, сумата, валутата, разпределението между
              семейства и дата/час на добавяне.
            </p>

            <h3 className="font-medium text-eco-text mt-4 mb-1">
              2.5 Технически и аналитични данни
            </h3>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Може да събираме анонимна статистика за използването на приложението
              (например брой пътувания, активност по функции), която не позволява идентификация.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">
              3. Защо събираме тези данни
            </h2>
            <ul className="list-disc pl-6 text-sm text-eco-text-muted space-y-1">
              <li>За предоставяне на основните функции на приложението.</li>
              <li>За подобряване на качеството и стабилността.</li>
              <li>За сигурност и предотвратяване на злоупотреби.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">
              4. Къде съхраняваме данните
            </h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Всички данни се съхраняват във Firebase (Google Cloud), с висока степен на
              сигурност и контрол на достъпа.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">5. Твоите права</h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              Имаш право да поискаш преглед, корекция или изтриване на личните си данни.
              За целта можеш да се свържеш с нас на:
            </p>
            <p className="text-sm font-medium text-eco-text mt-2">
              support@tripsplitly.app
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-eco-text mb-2">
              6. Промени в политиката
            </h2>
            <p className="text-sm text-eco-text-muted leading-relaxed">
              При промени в политиката ще актуализираме тази страница
              и ще уведомим потребителите при съществени промени.
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

export default PrivacyPage;
