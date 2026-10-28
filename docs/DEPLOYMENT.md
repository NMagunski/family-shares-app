# Безопасно внедряване — изисква отделно одобрение

Не изпълнявай production стъпките като част от локалния преглед. Нито един production запис не е променян от тази задача.

## Локална проверка

1. `npm ci` с Node 22 и Java 21+ за Emulator.
2. `npm run lint`, `npm run typecheck`, `npm test`.
3. `npm run test:emulator` — фиксиран demo проект `demo-tripsplitly`; никога не сменяй тестовия проект с реалния.
4. `npm run build -- --webpack`. Turbopack build блокира в ограничената локална среда; webpack build е провереният път.
5. `npm audit --omit=dev` — production зависимостите трябва да останат без известни advisories. Lockfile е част от промяната; gRPC override е необходим, докато Firebase обнови своята зависимост.
6. За ръчен UI QA: стартирай емулаторите и dev сървъра с `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-tripsplitly`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`. Провери всички потоци в двете теми, 390/768/1440 px, клавиатура и reduced motion. Тези променливи не трябва да присъстват в production.

## Подготовка преди одобрение

- Изтегли и запази действителните публикувани Firestore rules и indexes; сравни ги с новите файлове. Липсата им в git не доказва какви са в production.
- Направи Firestore export във versioned защитен bucket и провери възстановяване в отделен staging проект. Експортът трябва да включва всички колекции и подколекции.
- Инвентаризирай `trips.ownerId`, `families.userId`, текущите администратори и личните списъци. Поправи невалидни legacy собственици чрез отделно прегледана миграция; не гадай и не присвоявай семейства по име/email.
- За Admin SDK използвай Application Default Credentials / workload identity в Node runtime с необходимите Firestore и Firebase Auth права. Никога service-account JSON в NEXT_PUBLIC променлива или git.
- Прегледай администраторите по доверен списък и им постави custom claim `admin: true` през доверен admin инструмент. Новите правила и UI не се доверяват на клиентски `users.isAdmin`. Изискай нов ID token след промяната. Не мигрирай сляпо isAdmin флагове, преди да провериш старите rules.
- Прегледай `firestore.rules`, `firestore.indexes.json`, `src/pages/api/community.ts` и read-only миграцията. Проверете лимитите/timeout на избрания hosting; за големи пътувания подгответе job queue за изтриването.

## След изричното одобрение

1. Включи maintenance режим / спри старите клиенти, които могат да записват. Старите join линкове и клиентските writes не трябва да останат активен паралелен път.
2. Направи финален export и запази release/commit, правила, индекси и конфигурация за rollback.
3. С доверени credentials и изрично зададен реален projectId изпълни `npx tsx scripts/migrate-memberships.ts` **без** `--apply`. Провери броя пътувания/членства и всички грешки. Скриптът не чете и не променя личните записи.
4. След преглед на dry run изпълни същата команда с `--apply`. Скриптът добавя липсващите memberships, не трие/презаписва съществуващите семейства, разходи, членства или лични списъци. Повтори dry run и сравни owner/family достъпа с копието преди миграцията.
5. Публикувай индексите за избрания проект: `npx firebase deploy --only firestore:indexes --project REAL_PROJECT_ID`. Изчакай готовност.
6. В maintenance прозореца внедри Node приложението/API и новите правила: `npx firebase deploy --only firestore:rules --project REAL_PROJECT_ID`. Пускането само на клиента без доверения API и credentials не е завършено внедряване.
7. Провери със staging/контролни акаунти organizer/member/outsider: достъп до съществуващи пътувания; отказ на private lists за outsider и organizer; избор на username от стар акаунт; изпращане, приемане от две устройства, отказ/отмяна/изтичане; неизменени финансови суми. Не тествай разрушително изтриване с реални пътувания.
8. Изключи maintenance режима и наблюдавай permission-denied, API грешки, quota откази, transaction retries и незавършени `deleting` пътувания.

## Възстановяване

- При проблем остави maintenance режима активен. Първо върни проверената съвместима версия на приложението и **точните предишни правила**, а не permissive правила.
- Добавените memberships/public profiles/usernames/invitations могат да останат, докато се анализира проблемът; не ги изтривай автоматично. Миграцията е additive и не изисква изтриване на финансови данни за rollback.
- При частично изтриване не махай `deleting` преди проверка: това може да отвори записи, докато cleanup не е завършен. Повтори доверената операция след възстановяване на API или възстанови от export в staging и прехвърли проверените записи.
- Ако е нужно възстановяване на данни, първо ресторни export в staging, сравни с новите записи след експорта и възстанови избирателно по прегледан план. Пълно сляпо възстановяване може да загуби нови разходи и покани.
