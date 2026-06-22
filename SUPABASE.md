# Konfiguracja panelu świadków

Bez konfiguracji Supabase panel działa w trybie lokalnym. Po wykonaniu poniższych kroków zmiany zapisane przez
świadków będą widoczne dla wszystkich gości i automatycznie odświeżane na stronie co minutę.

1. Utwórz projekt na https://supabase.com.
2. W panelu Supabase otwórz **SQL Editor** i uruchom zawartość pliku `supabase-setup.sql`.
3. Przed uruchomieniem końcowych poleceń `update auth.users` w pliku SQL wpisz adresy e-mail świadków.
4. Otwórz **Authentication → Providers → Email** i wyłącz możliwość publicznej rejestracji.
5. Otwórz **Authentication → Users** i ręcznie utwórz dwa konta: dla świadkowej i świadka.
6. Ponownie uruchom końcowe polecenie `update auth.users`, aby nadać tym kontom rolę `wedding_admin`.
7. Otwórz **Project Settings → API** i skopiuj:
   - Project URL
   - anon public key
8. Wpisz te wartości do `schedule-config.js`:

```js
window.WEDDING_CONFIG = {
  supabaseUrl: 'PROJECT_URL',
  supabaseAnonKey: 'ANON_PUBLIC_KEY'
};
```

Panel znajduje się pod adresem `admin.html`. Tylko zalogowani użytkownicy mogą publikować zmiany.

## Co może znaleźć się w kodzie strony

- `Project URL` i `anon public key` są przeznaczone do użycia w przeglądarce i mogą być publiczne.
- Nigdy nie wpisuj do repozytorium klucza `service_role`, haseł świadków ani prywatnych tokenów.
- Bezpieczeństwo zapisu zapewnia RLS: tylko konta z rolą `wedding_admin` mogą aktualizować harmonogram.

## Publikacja przez GitHub Pages

1. Wypchnij gotowe pliki na gałąź `main`.
2. Na GitHubie otwórz **Settings → Pages**.
3. W sekcji **Build and deployment** wybierz **Deploy from a branch**.
4. Wybierz gałąź `main`, katalog `/ (root)` i kliknij **Save**.
5. Po publikacji strona będzie dostępna pod adresem:
   `https://adrian2131.github.io/wesele/`
6. Panel będzie dostępny pod adresem:
   `https://adrian2131.github.io/wesele/admin.html`

GitHub Pages automatycznie korzysta z HTTPS.

## Zalecenia bezpieczeństwa

- Użyj unikalnych, długich haseł dla obu kont.
- Nie udostępniaj linku resetowania hasła ani danych logowania.
- Włącz MFA dla kont świadków, jeśli jest dostępne w wybranym planie Supabase.
- Przed weselem sprawdź logowanie i publikację zmian na telefonach obu świadków.
