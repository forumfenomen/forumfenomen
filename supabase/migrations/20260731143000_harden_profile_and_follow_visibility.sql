begin;

/*
 * Takip tablosundaki gereksiz ve tehlikeli
 * doğrudan rol yetkilerini kaldır.
 *
 * TRUNCATE RLS tarafından korunmadığı için
 * authenticated rolünde kesinlikle bulunmamalı.
 */
revoke all privileges
on table public.user_follows
from public, anon, authenticated;

grant select, insert, delete
on table public.user_follows
to authenticated;


/*
 * Herkese açık SELECT politikasını kaldır.
 * Tabloyu yalnızca oturum açmış kullanıcılar okuyabilir.
 */
drop policy if exists
  "Anyone can view follows"
on public.user_follows;

drop policy if exists
  "Authenticated users can view follows"
on public.user_follows;

create policy
  "Authenticated users can view follows"
on public.user_follows
for select
to authenticated
using (
  auth.uid() is not null
);


/*
 * Profil görünümünde temel kimlik alanları,
 * aktif ve oturum açmış üyelere görünür.
 *
 * Bio ve ilgi alanları ise profil görünürlük
 * kuralına göre verilir.
 */
create or replace view public.public_profiles
with (
  security_barrier = true
)
as
select
  profile_data.id,
  profile_data.display_name,
  profile_data.username,
  profile_data.avatar_url,

  case
    when access_data.can_view_profile_details
      then profile_data.bio
    else null
  end as bio,

  case
    when access_data.can_view_profile_details
      then profile_data.interests
    else null
  end as interests,

  profile_data.created_at,
  profile_data.profile_visibility,
  profile_data.followers_visibility,
  profile_data.following_visibility,
  profile_data.comments_visibility,
  profile_data.likes_visibility,

  case
    when profile_data.role = 'admin'
      then 'admin'
    when profile_data.role = 'moderator'
      then 'moderator'
    else 'user'
  end as role

from public.profiles profile_data

cross join lateral (
  select
    (
      auth.role() = 'service_role'

      or profile_data.id = auth.uid()

      or exists (
        select 1
        from public.profiles viewer_profile
        where viewer_profile.id = auth.uid()
          and viewer_profile.account_status = 'active'
          and viewer_profile.role in (
            'admin',
            'moderator'
          )
      )

      or coalesce(
        profile_data.profile_visibility,
        'public'
      ) = 'public'

      or (
        profile_data.profile_visibility = 'followers'

        and exists (
          select 1
          from public.user_follows follow_data
          where follow_data.follower_id = auth.uid()
            and follow_data.following_id =
              profile_data.id
        )
      )
    ) as can_view_profile_details
) access_data

where profile_data.account_status = 'active'
  and (
    auth.role() = 'service_role'

    or exists (
      select 1
      from public.profiles viewer_profile
      where viewer_profile.id = auth.uid()
        and viewer_profile.account_status = 'active'
    )
  );

revoke all privileges
on table public.public_profiles
from public, anon;

grant select
on table public.public_profiles
to authenticated, service_role;

commit;
