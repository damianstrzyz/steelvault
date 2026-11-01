# Exchange rates

The statistics page converts PLN, EUR, USD and GBP into one display currency using the
`exchange_rates` table. The app never invents rates: if a rate is missing, items in that
currency are left out of the converted totals and a notice tells you which one.

`rate_per_eur` means: how many units of that currency equal 1 EUR (EUR itself is always 1).

Look up the current rates, then run this in the SQL editor, replacing every `RATE` with a number:

    insert into public.exchange_rates (currency, rate_per_eur) values
      ('EUR', 1),
      ('PLN', RATE),
      ('USD', RATE),
      ('GBP', RATE)
    on conflict (currency) do update
      set rate_per_eur = excluded.rate_per_eur, updated_at = now();

Run it again whenever you want fresh values. The page shows when rates were last updated and
warns when they are older than 30 days.
