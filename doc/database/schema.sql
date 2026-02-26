create table user_notifications
(
    endpoint          text primary key,
    push_subscription jsonb       not null,
    next_review_at    timestamptz not null
);

create index on user_notifications (next_review_at);
