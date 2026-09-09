import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.tsx';
import { clear, load } from '../engine/storage.ts';
import { itemId } from '../types.ts';
import { seedStorage } from '../test/harness.tsx';
import { HOUR_MS } from '../engine/intervals.ts';

const FIRE = itemId('kanji', '火');
const WATER = itemId('kanji', '水');
const T0 = 1_700_000_000_000;

beforeEach(() => {
  clear();
});

describe('review loop, keyboard only', () => {
  it('answers a two-card session and lands the ranks correctly', async () => {
    const user = userEvent.setup();
    seedStorage({
      progress: {
        [FIRE]: { stage: 2, due: T0 - HOUR_MS, lapses: 0, seen: 5, correct: 5 },
        [WATER]: {
          stage: 1,
          due: T0 - HOUR_MS,
          lapses: 1,
          seen: 4,
          correct: 3,
        },
      },
    });
    render(<App />);

    await user.click(screen.getByRole('button', { name: /begin reviews/i }));

    // card 1: 火 = fire, answer correctly
    expect(screen.getByText('火')).toBeInTheDocument();
    await user.keyboard('fire');
    await user.keyboard('{Enter}'); // submit
    expect(screen.getByRole('status')).toHaveTextContent(/correct/i);
    await user.keyboard('{Enter}'); // advance

    // card 2: 水 = water, answer wrongly
    expect(screen.getByText('水')).toBeInTheDocument();
    await user.keyboard('xxxx');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(/not accepted/i);
    await user.keyboard('{Enter}');

    // 水 was wrong -> requeued -> asked again
    expect(screen.getByText('水')).toBeInTheDocument();
    await user.keyboard('water');
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    // summary
    expect(
      screen.getByRole('heading', { name: /answers/i }),
    ).toBeInTheDocument();

    const saved = load();
    expect(saved?.progress[FIRE]).toMatchObject({
      stage: 3,
      seen: 6,
      correct: 6,
    });
    // 水: wrong from stage 1 -> 0, then right 0 -> 1
    expect(saved?.progress[WATER]).toMatchObject({ stage: 1, lapses: 2 });
  });

  it('a near miss retries in place without recording anything', async () => {
    const user = userEvent.setup();
    const mountain = itemId('kanji', '山');
    seedStorage({
      progress: {
        [mountain]: {
          stage: 3,
          due: T0 - HOUR_MS,
          lapses: 0,
          seen: 6,
          correct: 6,
        },
      },
    });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /begin reviews/i }));

    await user.keyboard('mountan'); // one edit from "mountain"
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(/check the spelling/i);

    await user.keyboard('{Enter}'); // retry - clears verdict, keeps input
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    const input = screen.getByLabelText(/meaning in english/i);
    expect(input).toHaveValue('mountan');

    await user.clear(input);
    await user.keyboard('mountain');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(/correct/i);

    await user.keyboard('{Enter}');
    const saved = load();
    expect(saved?.progress[mountain]).toMatchObject({
      stage: 4,
      seen: 7,
      correct: 7,
    });
  });

  it('close button abandons the session and returns to Today', async () => {
    const user = userEvent.setup();
    seedStorage({
      progress: {
        [FIRE]: { stage: 0, due: T0 - HOUR_MS, lapses: 0, seen: 1, correct: 1 },
      },
    });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /begin reviews/i }));
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(
      screen.getByRole('button', { name: /begin reviews/i }),
    ).toBeInTheDocument();
  });
});

describe('lesson -> drill -> review path', () => {
  it('commits a batch and drills it', async () => {
    const user = userEvent.setup();
    seedStorage({ level: 1 });
    render(<App />);

    await user.click(screen.getByRole('button', { name: /take \d+ lessons/i }));
    // walk to the last card
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /^next$/i }));
    }
    await user.click(
      screen.getByRole('button', { name: /enter all 5 into the schedule/i }),
    );
    await user.click(screen.getByRole('button', { name: /drill the batch/i }));

    // now in a review session of 5
    const header = screen
      .getByRole('button', { name: /close/i })
      .closest('header')!;
    expect(within(header).getByText(/1 of 5/)).toBeInTheDocument();

    const saved = load();
    expect(Object.keys(saved?.progress ?? {})).toHaveLength(5);
  });
});
