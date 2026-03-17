# Over-Consumption of Technology

By Nathan Trotter, Jake Gunnell, Jazzive Vizcarra, and George Ramsay

# Problem Statement

As a frequent consumer of social media and digital content, I want easier access to real events and social activities so that I can spend my free time more intentionally and feel more present in the real world.

# Competitive Analysis

The primary competitors are

- **Screen Time Apps** such as Opal and Foqus   
- **Habit Control Behaviors** such as   
- **Hobbies** such as reading, writing  
- **Productivity Apps** such as duolingo, brilliant, Udemy, Elevate, GreatCourses, Audible

## Competitor overview

### 1\) General Event Discovery Platforms

*(Facebook Events, Eventbrite, Google Events/Things to do, Ticketmaster/Live Nation, Fever, Bandsintown, Dice, local venue calendars)*

* **What they offer:** Large inventories of events, search by location/date/category, ticketing and reminders (varies by platform).  
* **Target users:** Anyone looking for something to do “this weekend/tonight,” especially concerts, festivals, classes, and public events.  
* **Key features**: Location-based search, event pages, RSVP/tickets, sharing/invites, notifications, organizer tools, recommendations.  
* **Common gaps (opportunity):** Noise/irrelevance, too ticketed-entertainment heavy, limited support for recurring clubs and beginner-friendly entry, fragmented across many sources.

### 2\) Interest-Based Groups \+ Recurring Activities

*(Meetup, Geneva, Bumble For Friends / friend-finding apps, Strava clubs & run groups, hobby-specific communities)*

* **What they offer:** Communities and recurring meetups built around interests; social validation and group identity.  
* **Target users:** People who want connection and routine (not just one-off events).  
* **Key features:** Group pages, schedules, chat/DMs, membership/RSVP, recurring events, moderation.  
* **Common gaps (opportunity):** Uneven quality by city, “dead groups,” paywalls/organizer fees, onboarding friction, limited aggregation with other local calendars.

### 3\) Campus-Specific Events & Clubs

*(BYU Events calendar, BYU Clubs/Organizations pages, department calendars, student life/involvement pages)*

* **What they offer:** Official listings for campus events, clubs, and student organizations; trusted and locally relevant.  
* **Target users:** Students looking for on-campus or near-campus activities and communities.  
* **Key features:** Verified events/clubs, categories by interest, time/location details, campus alignment, sometimes sign-up links.  
* **Common gaps (opportunity):** Hard to compare across sources, inconsistent updates, limited personalization, limited “what should I do tonight” discovery flow.

### 4\) Local Community Hubs & “What’s Happening” Pages

*(City tourism calendars, parks & rec schedules, library events, community centers, Nextdoor, local Reddit/Discord groups)*

- **What they offer:** Hyper-local events and niche activities, often free or low-cost.  
- **Target users:** Residents who want neighborhood-level activities.  
- **Key features:** Community-posted events, recurring programs, local announcements.  
- **Common gaps (opportunity):** Poor search/filtering, inconsistent formatting, low trust/verification, not optimized for fast decision-making.

## Competitive Comparison Chart

| Feature | Facebook Events | Meetup | Eventbrite/ Fever | BYU Events & Clubs |
| ----- | ----- | ----- | ----- | ----- |
| **Nearby discovery (time \+ location filters)** | Yes | Yes | Yes | Yes (campus-focused) |
| **Recurring clubs/weekly activities** | Limited | Yes | Limited | Yes |
| **Easy “how to join / what to expect” for newcomers** | Limited | Medium | Medium | Medium |
| **Personalization by interests** | Medium– High | High | Medium | Limited |
| **RSVP/tickets \+ reminders** | RSVP | RSVP | Tickets | Sometimes |
| **Social sharing / bring-a-friend** | High | Medium | Low– Medium | Low |
| **Noise / irrelevant content risk** | High | Medium | Medium | Low |
| **Aggregates multiple sources (one place to look)** | No | No | No | No |

## Cross-Competitor Insights

* **Discovery exists, but it’s all over the place.** Users would have to check multiple places for a list of all relevant events. None function as a reliable “single starting point,” especially for clubs \+ events together.

* **Each competitor is optimized for a different “job.”**

  * **Facebook Events:** social visibility \+ invites, but high noise and inconsistent relevance.

  * **Meetup:** recurring communities, but varies by city and can feel intimidating or “dead group” prone.

  * **Eventbrite/Fever:** polished, searchable, but skew toward ticketed/one-off entertainment vs ongoing clubs.

  * **BYU pages**: trusted and relevant for students, but limited personalization and cross-source comparison.

* **Trust and ‘freshness’ are uneven.** Ticketing platforms are usually current; social/community listings can be quickly outdated.

* **Social momentum is a competitive advantage.** Facebook wins when the user already has a network attending. Most other platforms don’t help users convert an activity into a shared plan.

# System Scope and Priorities (MoSCoW)User Requirements (EARS Format)

| Must have *(Table stakes)* | Should have *(Differentiators)* | Could have *(Nice-to-have)* | Won’t have *(Out of scope)* |
| :---- | :---- | :---- | :---- |
| **BYU student login** (CAS/SSO if feasible; otherwise BYU email-based auth) **Event feed (list view) ranked by “happening soon” Create event** (title, start time, end time, location, description, category) **Location support suitable for campus** (pre-set locations/buildings or simple text \+ map link) **Basic filters** (time window: today/this week; category; “near me” if you can do simple distance) **Event details page Basic UGC safeguards** (report event, rate limit posting, ability to remove/hide reported events as admins)  | **Lightweight personalization:** “hide past events,” “prefer categories,” “sort by closest” **Save/bookmark events** (drives retention and creates interaction data for ML) **Calendar export (ICS)** instead of building reminders **Basic image support** (one image per event; can be optional at creation) **Relevance ranking v2:** incorporate simple engagement signals (views/saves) into the feed ranker  | **Map view** (simple pins; no clustering if possible) **Host profiles** (very lightweight “host page” showing events by same host string) **Keyword search** (title/description) **“Going with friends” share link** (no in-app chat) **ML-assisted ranking** (batch, not real-time) | **Payments/ticketing Full social networking (comments, DMs, follower graphs) Attendance verification/check-ins Non-BYU or off-campus aggregation/scraping Advanced club account management/verification workflows**  |

## Ubiquitous requirements

* **UR-01 (Authentication):** *The system shall* allow only authenticated BYU students to access event content.  
* **UR-02 (Event feed):** *The system shall* display a ranked list of upcoming on-campus events.  
* **UR-03 (Event details):** *The system shall* display an event detail view when a user selects an event.  
* **UR-04 (Create event):** *The system shall* allow authenticated users to create and publish a new event.  
* **UR-05 (Event fields):** *The system shall* store and display for each event: title, start time, end time, location, category, and description.  
* **UR-06 (Filters):** *The system shall* allow users to filter events by time window and category.  
* **UR-07 (Freshness):** *The system shall* hide or deprioritize events whose end time has passed.

## Event-driven requirements

* **UR-08 (Publish):** *When* a user submits a valid event form, *the system shall* publish the event and make it visible in the event feed.  
* **UR-09 (Validation errors):** *When* a user submits an invalid event form, *the system shall* show validation errors and prevent publishing.  
* **UR-10 (Report event):** *When* a user reports an event, *the system shall* record the report and remove the event from the reporter’s feed.  
* **UR-11 (Admin moderation):** *When* an event reaches a configured report threshold, *the system shall* mark the event as “flagged” for admin review.  
  **UR-12 (Remove content):** *When* an admin removes an event, *the system shall* prevent it from being shown to users and retain an audit record of the action.

## State-driven requirements

* **UR-13 (Draft vs published):** *While* an event is in “draft” state, *the system shall* allow only the creator to view it.  
* **UR-14 (Published visibility):** *While* an event is in “published” state, *the system shall* allow all authenticated users to view it.  
  **UR-15 (Expired events):** *While* an event is “expired,” *the system shall* exclude it from default feed results.

## Optional-feature requirements

* **UR-16 (Save event):** *The system shall* allow users to save/bookmark events.  
* **UR-17 (Saved list):** *The system shall* allow users to view a list of saved events.  
* **UR-18 (Calendar export):** *When* a user selects “Add to calendar,” *the system shall* generate and download an ICS calendar file for that event.  
* **UR-19 (Image upload):** *Where* a user includes an image with an event, *the system shall* store the image and display it on the event detail view.

## Unwanted behavior / constraints

* **UR-20 (Rate limiting):** *Where* a user exceeds a configured posting limit within a time window, *the system shall* prevent additional event creation until the window expires.  
* **UR-21 (Duplicate/low-quality guardrail):** *When* a user submits an event that matches configured spam heuristics (e.g., repeated text or excessive links), *the system shall* block publishing or queue the event for review.

## ML-related requirements

* **UR-22 (Interaction capture):** *When* a user views an event, saves an event, or clicks “Add to calendar,” *the system shall* log the interaction for analytics/recommendations.  
* **UR-23 (Ranking signal use):** *While* ranking the event feed, *the system shall* combine time-to-start with at least one relevance signal (category match, distance, or predicted engagement score).  
* **UR-24 (Model scoring):** *When* a new model score is available for an event, *the system shall* store the score and use it in subsequent feed ranking.

# Objectives and Key Results (OKRs)

## OKR 1 — Ship a usable BYU-only MVP that enables fast discovery and posting

**Argument:** In one semester, the main risk is not shipping a complete product. This OKR forces an end-to-end experience (login → browse → details → create) that can be tested and demoed.

**Objective:** Deliver a stable MVP where BYU students can discover and post on-campus events.

**Key Results:**

- **KR1:** BYU-authenticated users can view a ranked feed of upcoming events and open event details (0 critical bugs in UAT).  
- **KR2:** Users can create/publish events with required fields (title, time, location, category, description) and validation prevents invalid posts (≥ 95% test pass rate).  
- **KR3:** Users can filter events by time window and category with correct results (≥ 95% test pass rate).

## OKR 2 — Establish a healthy event supply loop with acceptable quality and trust

**Argument:** Because you are not scraping, the product lives or dies by whether enough students post events and whether spam/noise is controlled.

**Objective:** Maintain sufficient, credible event inventory to make the feed useful.

**Key Results:**

- **KR1:** Reach 75+ published events by end of semester with 10+ unique posters.  
- **KR2:** ≥ 70% of events meet completeness quality (all required fields \+ non-trivial description).  
- **KR3:** Implement basic safeguards (reporting \+ rate limiting \+ admin remove) and keep flagged/removed events to ≤ 10% of total posts.

## OKR 3 — Demonstrate “lower friction to go” with engagement outcomes and an integrated ML pipeline

**Argument:** Your differentiator is reducing the effort from “scrolling” to “showing up.” ML is only valuable if it’s integrated into ranking and improves a measurable outcome.

**Objective:** Increase offline-intent actions through relevant ranking, including an end-to-end ML pipeline.

**Key Results:**

* **KR1:** ≥ 30% of active users complete at least one intent action (Save, Add-to-calendar, or Open map link).  
* **KR2:** Implement interaction logging (views, saves, intent actions) with ≥ 95% reliability in tests.  
* **KR3:** ML-assisted ranking is deployed (batch scoring acceptable) and shows ≥ 5% improvement in CTR or save-rate versus a time-only baseline (offline evaluation or small A/B test).

# Product Vision

A BYU-only, student-run events feed that makes it effortless to find something happening on campus in the next few minutes. In one place, students can post quick events, browse a ranked list tailored to their interests and schedule, and take an immediate next step (save, add to calendar, or navigate). The product prioritizes low friction, high relevance, and basic trust/safety so students spend less time scrolling and more time showing up.

