begin;

create table if not exists public.rate_limit_buckets (
  key_hash text primary key,
  request_count integer not null,
  reset_at timestamptz not null,
  constraint rate_limit_buckets_key_hash_format
    check (key_hash ~ '^[a-f0-9]{64}$'),
  constraint rate_limit_buckets_request_count_positive
    check (request_count > 0)
);

create index if not exists rate_limit_buckets_reset_at_idx
  on public.rate_limit_buckets (reset_at);

alter table public.rate_limit_buckets enable row level security;

revoke all on table public.rate_limit_buckets from public, anon, authenticated;
grant all privileges on table public.rate_limit_buckets to service_role;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  max_requests integer,
  remaining integer,
  reset_at timestamptz,
  retry_after_seconds integer
)
language plpgsql
set search_path = public
as $$
declare
  v_count integer;
  v_now timestamptz := clock_timestamp();
  v_reset_at timestamptz;
begin
  if p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid rate-limit key hash' using errcode = '22023';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100000 then
    raise exception 'Invalid rate-limit limit' using errcode = '22023';
  end if;

  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 604800 then
    raise exception 'Invalid rate-limit window' using errcode = '22023';
  end if;

  insert into public.rate_limit_buckets as bucket (
    key_hash,
    request_count,
    reset_at
  )
  values (
    p_key_hash,
    1,
    v_now + make_interval(secs => p_window_seconds)
  )
  on conflict (key_hash) do update
  set
    request_count = case
      when bucket.reset_at <= v_now then 1
      else least(bucket.request_count + 1, p_limit + 1)
    end,
    reset_at = case
      when bucket.reset_at <= v_now
        then v_now + make_interval(secs => p_window_seconds)
      else bucket.reset_at
    end
  returning bucket.request_count, bucket.reset_at
  into v_count, v_reset_at;

  delete from public.rate_limit_buckets as expired
  where expired.key_hash in (
    select candidate.key_hash
    from public.rate_limit_buckets as candidate
    where candidate.key_hash <> p_key_hash
      and candidate.reset_at <= v_now
    order by candidate.reset_at
    limit 100
  );

  return query
  select
    v_count <= p_limit,
    p_limit,
    greatest(0, p_limit - v_count),
    v_reset_at,
    case
      when v_count <= p_limit then 0
      else greatest(
        1,
        ceil(extract(epoch from (v_reset_at - v_now)))::integer
      )
    end;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

commit;
