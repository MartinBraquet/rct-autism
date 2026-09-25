import React from 'react'
import {pct, RESULTS} from 'web/components/study-results/results-data'

const {quality, group} = RESULTS
const underMinimum = Math.round(quality.share_under_12_sessions * RESULTS.n_children)

const REASONS = [
  {
    icon: '⏱️',
    title: 'Ratings were not precise enough',
    body: 'Engagement was meant to be scored live at 5, 15 and 30 minutes. In practice, many ratings were written down from memory, often hours after the session.',
    evidence: `${pct(quality.share_rated_over_1h)} of ratings were submitted more than an hour after the warm-up was logged (${pct(quality.share_rated_over_3h)} more than three hours). In ${pct(quality.share_identical_ratings)} of sessions, all three time points got the exact same score. This pattern suggests an overall impression was recalled, not three separate observations.`,
  },
  {
    icon: '✋',
    title: 'The warm-up was often pushy',
    body: 'Instead of meeting the child where they were, the warm-up often turned into getting the child to do a task within minutes of arriving. Being made to act too soon tended to put the child in a worse mood, which carried over into the learning session.',
  },
  {
    icon: '👥',
    title: 'Well-meant extra help overwhelmed children',
    body: 'When a child was not following the warm-up, a second assistant would sometimes step in to help. Two adults directing one child was often too much, and the extra pressure made things worse.',
  },
  {
    icon: '🔁',
    title: 'Activities were too repetitive',
    body: "Each child had one fixed activity per condition, and sensory needs vary hugely from child to child. Doing the same activity again and again made children bored within a few days. A better design would keep the category fixed (e.g. 'stimulating') but change the activity from day to day.",
  },
  {
    icon: '🧲',
    title: 'Child choice led to hard transitions',
    body: 'When allowed to choose, children usually picked the same favourite object or activity they were fixated on. They then struggled to let go of it when the warm-up ended, and that frustration spilled into the session. This may have cancelled out any benefit of having a choice.',
  },
  {
    icon: '📉',
    title: 'Too few sessions per child',
    body: 'The design called for 12–32 sessions per child. Irregular attendance and the end of the collection window meant most children never reached that range.',
    evidence: `${underMinimum} of ${RESULTS.n_children} children (${pct(quality.share_under_12_sessions)}) had fewer than 12 rated sessions. Several had only one or two.`,
  },
]

const LESSONS = [
  'Score engagement live, on a phone or tablet, at the exact time points, and reject late entries.',
  'Make the warm-up invitational: offer the activity, and let the child ease in or opt out without pressure.',
  'One adult per child during the warm-up. No stepping in.',
  "Keep a pool of activities for each category and rotate them, so 'Stimulating' is not the same jump every day.",
  'For child-led warm-ups, exclude fixation objects and use a visual timer to prepare the transition out.',
  'Secure consistent attendance, or plan a longer collection window, before starting a per-child design.',
]

export function ResultsDiscussion() {
  return (
    <div className="flex flex-col gap-10">
      <div style={{maxWidth: 720}}>
        <p style={{fontSize: '1rem', lineHeight: 1.8, color: '#5a5040'}}>
          We did not detect any effect of the pre-session warm-up, for the group as a whole or for
          any individual child. We believe this says more about how the trial was run than about
          whether warm-ups work. Several practical problems each added noise to the engagement
          scores. After accounting for differences between children and practitioners, the scores
          for the same child still varied from one session to the next by about{' '}
          {group.sigma.mean.toFixed(1)} points (standard deviation). That is larger than the effects
          we were trying to find.
        </p>
      </div>

      <div
        className="grid gap-5"
        style={{gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))'}}
      >
        {REASONS.map((r) => (
          <div key={r.title} className="study-why-card">
            <div style={{fontSize: '1.6rem', marginBottom: '0.75rem'}}>{r.icon}</div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.15rem',
                fontWeight: 600,
                marginBottom: '0.6rem',
              }}
            >
              {r.title}
            </h3>
            <p style={{fontSize: '0.9rem', lineHeight: 1.7, color: '#7a7060'}}>{r.body}</p>
            {r.evidence && (
              <p
                className="mt-3 rounded-lg p-3"
                style={{
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: '#b85c38',
                  background: 'rgba(184, 92, 56, 0.06)',
                }}
              >
                <strong>In the data:</strong> {r.evidence}
              </p>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '1.5rem',
          background: 'rgba(184, 92, 56, 0.05)',
          border: '1px dashed rgba(184, 92, 56, 0.3)',
          borderRadius: 16,
        }}
      >
        <p style={{fontSize: '0.95rem', lineHeight: 1.75, color: '#5a5040'}}>
          <strong style={{color: '#b85c38'}}>{'Taken together: '}</strong>imprecise ratings,
          warm-ups that sometimes stressed children rather than preparing them, repetitive
          activities, and too few sessions per child all added noise. Any real signal from the
          preparation conditions was lost in it. The model also estimated that children differed
          very little in how they responded to each warm-up. As a result, each child&apos;s
          estimates were pulled strongly towards the group average, which is why the individual
          results above look so alike.
        </p>
      </div>

      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.4rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          What we would do differently
        </h3>
        <ul className="flex flex-col gap-3" style={{maxWidth: 760}}>
          {LESSONS.map((l) => (
            <li key={l} className="flex gap-3" style={{fontSize: '0.95rem', lineHeight: 1.7}}>
              <span style={{color: '#3d5a45', fontWeight: 700}}>→</span>
              <span style={{color: '#5a5040'}}>{l}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed" style={{color: '#7a7060', maxWidth: 760}}>
          The result is null and mostly reflects limits of the process, so we will not write it up
          as a journal paper. This page is the final report of the study. The data, model and
          analysis code are open in the repository below, as pre-registered.
        </p>
      </div>
    </div>
  )
}
