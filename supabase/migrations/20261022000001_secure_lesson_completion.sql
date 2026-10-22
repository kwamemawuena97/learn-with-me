create table if not exists public.lesson_rewards (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_key integer not null,
  correct_answers integer not null check (correct_answers between 0 and 5),
  total_questions integer not null check (total_questions between 1 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  activity_date date not null default (timezone('utc', now()))::date,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

alter table public.lesson_rewards enable row level security;

drop policy if exists "Learners can read their lesson rewards" on public.lesson_rewards;
create policy "Learners can read their lesson rewards"
  on public.lesson_rewards for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners can create their lesson rewards" on public.lesson_rewards;
create policy "Learners can create their lesson rewards"
  on public.lesson_rewards for insert
  with check ((select auth.uid()) = user_id);

create or replace function public.complete_lesson(
  lesson_key integer,
  correct_answers integer,
  total_questions integer,
  activity_date date default (timezone('utc', now()))::date
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
set row_security = on
as $$
declare
  current_progress jsonb;
  completed integer[];
  is_replay boolean;
  xp_earned integer := 0;
  next_xp integer;
  today_xp integer;
  today_text text := activity_date::text;
  yesterday_text text := (activity_date - 1)::text;
  saved_streak integer;
  last_date text;
  next_streak integer;
  activity jsonb;
begin
  if lesson_key < 1 or lesson_key > 100 then raise exception 'Invalid lesson'; end if;
  if correct_answers < 0 or correct_answers > total_questions then raise exception 'Invalid answer count'; end if;
  if total_questions < 1 or total_questions > 100 then raise exception 'Invalid lesson size'; end if;
  if activity_date > (timezone('utc', now()))::date or activity_date < (timezone('utc', now()))::date - 1 then
    raise exception 'Activity date is outside the allowed range';
  end if;

  select progress into current_progress
  from public.learner_progress where user_id = auth.uid();

  if current_progress is null then current_progress := '{}'::jsonb; end if;
  completed := coalesce(
    array(select value::integer from jsonb_array_elements_text(coalesce(current_progress->'completedLessons', '[]'::jsonb))),
    '{}'::integer[]
  );
  is_replay := lesson_key = any(completed);

  if not is_replay then
    xp_earned := correct_answers * 10;
    if correct_answers = total_questions then xp_earned := xp_earned + 10; end;
    insert into public.lesson_rewards (user_id, lesson_key, correct_answers, total_questions, xp_earned, activity_date)
    values (auth.uid(), lesson_key, correct_answers, total_questions, xp_earned, activity_date);
    completed := completed || lesson_key;
  end if;

  next_xp := coalesce((current_progress->>'xp')::integer, 0) + xp_earned;
  saved_streak := coalesce((current_progress->>'streak')::integer, 0);
  last_date := current_progress->>'lastStudyDate';
  if last_date = today_text then
    next_streak := saved_streak;
  elsif last_date = yesterday_text then
    next_streak := saved_streak + 1;
  else
    next_streak := 1;
  end if;

  activity := coalesce(current_progress->'activityByDate', '{}'::jsonb);
  if xp_earned > 0 then
    activity := jsonb_set(activity, array[today_text], to_jsonb(coalesce((activity->>today_text)::integer, 0) + xp_earned), true);
  end if;

  today_xp := coalesce((current_progress->>'todayXp')::integer, 0);
  if coalesce(current_progress->>'todayDate', '') = today_text then
    today_xp := today_xp + xp_earned;
  else
    today_xp := xp_earned;
  end;

  current_progress := current_progress
    || jsonb_build_object(
      'xp', next_xp,
      'streak', next_streak,
      'lastStudyDate', today_text,
      'completedLessons', to_jsonb(completed),
      'todayXp', today_xp,
      'todayDate', today_text,
      'activityByDate', activity
    );

  insert into public.learner_progress (user_id, progress, updated_at)
  values (auth.uid(), current_progress, now())
  on conflict (user_id) do update set progress = excluded.progress, updated_at = excluded.updated_at;

  return jsonb_build_object('xpEarned', xp_earned, 'isReplay', is_replay, 'progress', current_progress);
end;
$$;

revoke all on function public.complete_lesson(integer, integer, integer, date) from public;
grant execute on function public.complete_lesson(integer, integer, integer, date) to authenticated;
