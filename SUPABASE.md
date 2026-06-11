# Konfiguracja panelu świadków

Bez konfiguracji Supabase panel działa w trybie lokalnym. Po wykonaniu poniższych kroków zmiany zapisane przez
świadków będą widoczne dla wszystkich gości i automatycznie odświeżane na stronie co minutę.

1. Utwórz projekt na https://supabase.com.
2. W panelu Supabase otwórz **SQL Editor** i uruchom zawartość pliku `supabase-setup.sql`.
3. Otwórz **Authentication → Users** i utwórz dwa konta: dla świadkowej i świadka.
4. Otwórz **Project Settings → API** i skopiuj:
   - Project URL
   - anon public key
5. Wpisz te wartości do `schedule-config.js`:

```js
window.WEDDING_CONFIG = {
  supabaseUrl: 'PROJECT_URL',
  supabaseAnonKey: 'ANON_PUBLIC_KEY'
};
```

Panel znajduje się pod adresem `admin.html`. Tylko zalogowani użytkownicy mogą publikować zmiany.
