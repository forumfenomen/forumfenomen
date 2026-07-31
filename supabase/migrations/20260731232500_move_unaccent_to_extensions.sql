begin;

alter extension unaccent
set schema extensions;

create or replace function public.normalize_username_for_filter(
  p_username text
)
returns text
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_value text;
begin
  v_value :=
    lower(
      extensions.unaccent(
        trim(
          coalesce(p_username, '')
        )
      )
    );

  v_value := translate(
    v_value,
    '430157',
    'aeoist'
  );

  v_value := regexp_replace(
    v_value,
    '[^a-z0-9]+',
    '',
    'g'
  );

  return v_value;
end;
$function$;

revoke all
on function public.normalize_username_for_filter(text)
from public, anon, service_role;

grant execute
on function public.normalize_username_for_filter(text)
to authenticated;

commit;
